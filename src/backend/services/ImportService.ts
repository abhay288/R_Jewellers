import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/shared/lib/mongodb';
import Product, { IProduct } from '@/backend/models/Product';
import Category from '@/backend/models/Category';
import ImportLog from '@/backend/models/ImportLog';
import mongoose from 'mongoose';

// Configure Cloudinary server-side SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface IValidationResult {
  valid: boolean;
  rows: Record<string, any>[];
  errors: Array<{
    rowNumber: number;
    sku?: string;
    name?: string;
    reason: string;
    field?: string;
  }>;
  totalRows: number;
}

export interface IZipMediaFiles {
  images: Map<string, { buffer: Buffer; name: string }>;
  videos: Map<string, { buffer: Buffer; name: string }>;
}

export class ImportService {
  /**
   * Helper function to upload buffer stream to Cloudinary
   */
  private static async uploadBufferToCloudinary(
    buffer: Buffer,
    fileName: string,
    isVideo: boolean = false
  ): Promise<string> {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn("Cloudinary credentials missing, using fallback placeholder media.");
      return isVideo ? "" : `https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800`;
    }

    return new Promise((resolve, reject) => {
      const sanitizeName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'radhika_jewellers/products',
          resource_type: isVideo ? 'video' : 'image',
          public_id: `${sanitizeName}_${Date.now()}`
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(error);
          }
          resolve(result?.secure_url || '');
        }
      );
      uploadStream.end(buffer);
    });
  }

  /**
   * Parse CSV or Excel file buffer into raw JSON rows
   */
  public static async parseDataFile(fileBuffer: Buffer, mimeType: string, filename: string): Promise<Record<string, any>[]> {
    const isExcel = filename.endsWith('.xlsx') || filename.endsWith('.xls') || mimeType.includes('spreadsheet') || mimeType.includes('excel');

    if (isExcel) {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } else {
      const textContent = fileBuffer.toString('utf-8');
      const parsed = Papa.parse<Record<string, any>>(textContent, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim()
      });
      return parsed.data;
    }
  }

  /**
   * Parse ZIP file buffer into image and video buffer maps indexed by lowercased file names
   */
  public static async parseZipFile(zipBuffer: Buffer): Promise<IZipMediaFiles> {
    const zip = await JSZip.loadAsync(zipBuffer);
    const images = new Map<string, { buffer: Buffer; name: string }>();
    const videos = new Map<string, { buffer: Buffer; name: string }>();

    for (const relativePath of Object.keys(zip.files)) {
      const fileEntry = zip.files[relativePath];
      if (fileEntry.dir) continue;

      const baseName = relativePath.split('/').pop()?.trim() || '';
      if (!baseName || baseName.startsWith('.')) continue;

      const lowerName = baseName.toLowerCase();
      const ext = lowerName.split('.').pop() || '';

      if (['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif'].includes(ext)) {
        const arrayBuf = await fileEntry.async('nodebuffer');
        images.set(lowerName, { buffer: arrayBuf, name: baseName });
        // Also index by filename without extension for flexible SKU matching
        const nameWithoutExt = lowerName.substring(0, lowerName.lastIndexOf('.'));
        images.set(nameWithoutExt, { buffer: arrayBuf, name: baseName });
      } else if (['mp4', 'webm', 'mov', 'm4v'].includes(ext)) {
        const arrayBuf = await fileEntry.async('nodebuffer');
        videos.set(lowerName, { buffer: arrayBuf, name: baseName });
        const nameWithoutExt = lowerName.substring(0, lowerName.lastIndexOf('.'));
        videos.set(nameWithoutExt, { buffer: arrayBuf, name: baseName });
      }
    }

    return { images, videos };
  }

  /**
   * Validate raw data rows before committing import
   */
  public static async validateRows(rows: Record<string, any>[]): Promise<IValidationResult> {
    await connectDB();
    const errors: IValidationResult['errors'] = [];
    const skuSet = new Set<string>();
    const slugSet = new Set<string>();

    const existingSkus = new Set((await Product.find({}, 'sku')).map(p => p.sku?.toUpperCase()).filter(Boolean));
    const existingSlugs = new Set((await Product.find({}, 'slug')).map(p => p.slug?.toLowerCase()).filter(Boolean));

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // 1-based index + header row

      // Standardize field extraction
      const name = (row['Product Name'] || row['name'] || row['Title'] || '').toString().trim();
      const rawPrice = row['Price'] ?? row['price'];
      const rawStock = row['Stock'] ?? row['stock'];
      const categoryName = (row['Category'] || row['category'] || '').toString().trim();
      const sku = (row['SKU'] || row['sku'] || '').toString().trim().toUpperCase();
      const slug = (row['Slug'] || row['slug'] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')).toString().trim().toLowerCase();

      // Required Name
      if (!name) {
        errors.push({
          rowNumber,
          sku,
          name: 'N/A',
          reason: 'Product Name is missing',
          field: 'Product Name'
        });
      }

      // Required Category
      if (!categoryName) {
        errors.push({
          rowNumber,
          sku,
          name,
          reason: 'Category is missing',
          field: 'Category'
        });
      }

      // Price Validation
      const price = parseFloat(rawPrice);
      if (rawPrice === undefined || rawPrice === '' || isNaN(price) || price < 0) {
        errors.push({
          rowNumber,
          sku,
          name,
          reason: `Invalid Price: "${rawPrice}". Must be a non-negative number.`,
          field: 'Price'
        });
      }

      // Stock Validation
      if (rawStock !== undefined && rawStock !== '') {
        const stock = parseInt(rawStock, 10);
        if (isNaN(stock) || stock < 0) {
          errors.push({
            rowNumber,
            sku,
            name,
            reason: `Invalid Stock: "${rawStock}". Must be a non-negative integer.`,
            field: 'Stock'
          });
        }
      }

      // Duplicate SKU in batch
      if (sku) {
        if (skuSet.has(sku)) {
          errors.push({
            rowNumber,
            sku,
            name,
            reason: `Duplicate SKU "${sku}" found within the CSV file.`,
            field: 'SKU'
          });
        } else {
          skuSet.add(sku);
        }
      }

      // Duplicate Slug in batch
      if (slug) {
        if (slugSet.has(slug)) {
          errors.push({
            rowNumber,
            sku,
            name,
            reason: `Duplicate Slug "${slug}" generated within the CSV file.`,
            field: 'Slug'
          });
        } else {
          slugSet.add(slug);
        }
      }
    });

    return {
      valid: errors.length === 0,
      rows,
      errors,
      totalRows: rows.length
    };
  }

  /**
   * Process & save products from validated rows and zip files
   */
  public static async executeImport(
    sessionId: string,
    rows: Record<string, any>[],
    mediaFiles?: IZipMediaFiles,
    autoCreateCategory: boolean = true
  ): Promise<any> {
    await connectDB();

    const categoryCache = new Map<string, mongoose.Types.ObjectId>();
    const existingCats = await Category.find({});
    existingCats.forEach(cat => {
      categoryCache.set(cat.name.toLowerCase().trim(), cat._id as mongoose.Types.ObjectId);
    });

    const createdCategories: string[] = [];
    const rowErrors: Array<{
      rowNumber: number;
      sku?: string;
      name?: string;
      reason: string;
      field?: string;
    }> = [];

    let successCount = 0;
    let failedCount = 0;

    // Helper boolean parser
    const parseBool = (val: any, defaultVal = false): boolean => {
      if (val === undefined || val === null || val === '') return defaultVal;
      const str = String(val).trim().toLowerCase();
      return ['true', 'yes', '1', 'y', 'active'].includes(str);
    };

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const rowNumber = idx + 2;

      try {
        const name = (row['Product Name'] || row['name'] || row['Title'] || '').toString().trim();
        const categoryName = (row['Category'] || row['category'] || '').toString().trim();
        const subcategory = (row['Sub Category'] || row['subcategory'] || row['Subcategory'] || '').toString().trim();
        const rawPrice = parseFloat(row['Price'] || row['price'] || '0');
        const rawMrp = row['MRP'] || row['mrp'] ? parseFloat(row['MRP'] || row['mrp']) : undefined;
        const rawDiscount = row['Discount'] || row['discount'] ? parseFloat(row['Discount'] || row['discount']) : 0;
        const stock = parseInt(row['Stock'] || row['stock'] || '10', 10);
        const minStock = parseInt(row['Minimum Stock'] || row['minimumStock'] || '2', 10);
        const userSku = (row['SKU'] || row['sku'] || '').toString().trim();
        const userProductId = (row['Product ID'] || row['productId'] || '').toString().trim();
        const userSlug = (row['Slug'] || row['slug'] || '').toString().trim();
        const brand = (row['Brand'] || row['brand'] || 'Radhika Jewellers').toString().trim();
        const collectionName = (row['Collection'] || row['collection'] || row['collectionName'] || '').toString().trim();
        const material = (row['Material'] || row['material'] || 'Brass Alloy with Gold Plating').toString().trim();
        const stoneType = (row['Stone Type'] || row['stoneType'] || row['Stone'] || row['stone'] || 'Kundan & CZ').toString().trim();
        const color = (row['Color'] || row['color'] || 'Gold').toString().trim();
        const finish = (row['Finish'] || row['finish'] || '').toString().trim();
        const weight = (row['Weight'] || row['weight'] || '').toString().trim();
        const dimensions = (row['Dimensions'] || row['dimensions'] || '').toString().trim();
        const occasion = (row['Occasion'] || row['occasion'] || 'Bridal & Festive').toString().trim();
        const gender = (row['Gender'] || row['gender'] || 'Women').toString().trim() as any;
        const style = (row['Style'] || row['style'] || 'Traditional Royal').toString().trim();
        const shortDesc = (row['Short Description'] || row['shortDescription'] || '').toString().trim();
        const longDesc = (row['Long Description'] || row['description'] || row['longDescription'] || '').toString().trim();
        const featuresStr = (row['Features'] || row['features'] || '').toString().trim();
        const careInstructions = (row['Care Instructions'] || row['careInstructions'] || '').toString().trim();
        const shippingInfo = (row['Shipping Information'] || row['shippingInfo'] || '').toString().trim();
        const returnPolicy = (row['Return Policy'] || row['returnPolicy'] || '').toString().trim();
        const warranty = (row['Warranty'] || row['warranty'] || '').toString().trim();
        const tagsStr = (row['Tags'] || row['tags'] || '').toString().trim();
        const imageFolderKey = (row['Image Folder'] || row['imageFolder'] || userSku || name).toString().trim().toLowerCase();
        const videoFolderKey = (row['Video Folder'] || row['videoFolder'] || userSku || name).toString().trim().toLowerCase();

        // 1. Resolve Category
        const catKey = categoryName.toLowerCase();
        let categoryId = categoryCache.get(catKey);

        if (!categoryId) {
          if (autoCreateCategory && categoryName) {
            const catSlug = categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            const newCat = await Category.create({
              name: categoryName,
              slug: catSlug,
              description: `${categoryName} Collection at Radhika Jewellers`,
              isActive: true,
            });
            categoryId = newCat._id as mongoose.Types.ObjectId;
            categoryCache.set(catKey, categoryId);
            createdCategories.push(categoryName);
          } else {
            throw new Error(`Category "${categoryName}" does not exist in database.`);
          }
        }

        // 2. Handle Cloudinary Media Uploads from ZIP
        const imageUrls: string[] = [];
        let videoUrl: string | undefined = undefined;

        if (mediaFiles) {
          // Find matching images in ZIP (either by SKU/Folder prefix or exact name)
          const matchedImages: Buffer[] = [];
          for (const [key, val] of mediaFiles.images.entries()) {
            if (
              key.startsWith(imageFolderKey) ||
              (userSku && key.startsWith(userSku.toLowerCase())) ||
              key.includes(name.toLowerCase().substring(0, 5))
            ) {
              matchedImages.push(val.buffer);
            }
          }

          // Upload matched images to Cloudinary
          for (let i = 0; i < matchedImages.length; i++) {
            try {
              const url = await this.uploadBufferToCloudinary(matchedImages[i], `${imageFolderKey}_${i+1}.jpg`, false);
              if (url) imageUrls.push(url);
            } catch (err) {
              console.error(`Failed uploading image ${i} for ${name}:`, err);
            }
          }

          // Find matching video
          for (const [key, val] of mediaFiles.videos.entries()) {
            if (
              key.startsWith(videoFolderKey) ||
              (userSku && key.startsWith(userSku.toLowerCase()))
            ) {
              try {
                videoUrl = await this.uploadBufferToCloudinary(val.buffer, `${videoFolderKey}.mp4`, true);
                break;
              } catch (err) {
                console.error(`Failed uploading video for ${name}:`, err);
              }
            }
          }
        }

        // Fallback default sample images if no images matched/uploaded
        if (imageUrls.length === 0) {
          imageUrls.push('https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800');
        }

        // 3. Prepare Tags and Features
        const tags = tagsStr ? tagsStr.split(',').map((t: string) => t.trim()).filter(Boolean) : [categoryName, brand];
        const features = featuresStr ? featuresStr.split(/,|\n/).map((f: string) => f.trim()).filter(Boolean) : [];

        // 4. Calculate pricing
        let finalPrice = rawPrice;
        let mrp = rawMrp || Math.round(rawPrice * 1.3);
        if (rawDiscount > 0) {
          finalPrice = Math.round(rawPrice - (rawPrice * (rawDiscount / 100)));
        }

        // 5. Generate Slug
        let slug = userSlug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        
        // Ensure slug uniqueness
        let existingSlug = await Product.findOne({ slug });
        if (existingSlug && existingSlug.sku !== userSku) {
          slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 6. Generate SKU
        let sku = userSku;
        if (!sku) {
          const prefix = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'RJ');
          sku = `RJ-${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
        }

        // 7. Generate Product ID
        let productId = userProductId;
        if (!productId) {
          productId = `PRD-${Math.floor(10000 + Math.random() * 90000)}`;
        }

        // 8. Upsert Product to MongoDB
        const productPayload = {
          productId,
          sku,
          name,
          slug,
          category: categoryId,
          subcategory,
          brand,
          collectionName,
          price: rawPrice,
          mrp,
          discount: rawDiscount,
          finalPrice,
          stock,
          minimumStock: minStock,
          material,
          stone: stoneType,
          stoneType,
          color,
          finish,
          weight,
          dimensions,
          occasion,
          gender: ['Women', 'Men', 'Unisex'].includes(gender) ? gender : 'Women',
          style,
          shortDescription: shortDesc || `${name} handcrafted with finest ${material} and ${stoneType}.`,
          description: longDesc || `<p>${name} by ${brand}. Elegant design crafted for ${occasion}.</p>`,
          features: features.length > 0 ? features : [`Authentic ${material}`, `${stoneType} Setting`, `Perfect for ${occasion}`],
          careInstructions: careInstructions || 'Keep away from direct moisture, perfumes, and hairsprays. Store in velvet pouch.',
          shippingInfo: shippingInfo || 'Dispatched within 24-48 hours. Free insured delivery across India.',
          returnPolicy: returnPolicy || 'Easy 48-hour return or exchange policy.',
          warranty: warranty || '6 Months Warranty on plating & craftsmanship.',
          tags,
          images: imageUrls,
          videoUrl,
          imageFolder: imageFolderKey,
          videoFolder: videoFolderKey,
          isActive: parseBool(row['Active'] ?? row['active'], true),
          isFeatured: parseBool(row['Featured'] ?? row['isFeatured'], false),
          isTrending: parseBool(row['Trending'] ?? row['isTrending'], false),
          isBestSeller: parseBool(row['Best Seller'] ?? row['isBestSeller'], false),
          isNewArrival: parseBool(row['New Arrival'] ?? row['isNewArrival'], true),
          seoTitle: row['SEO Title'] || row['seoTitle'] || `${name} | Radhika Jewellers`,
          seoDescription: row['SEO Description'] || row['seoDescription'] || `Buy ${name} online at Radhika Jewellers. Fine jewellery with certified quality and express shipping.`,
          metaKeywords: (row['SEO Keywords'] || row['metaKeywords'] || '').toString().split(',').map((k: string) => k.trim()).filter(Boolean),
          status: stock > 0 ? 'Published' : 'Out Of Stock',
          isDeleted: false,
        };

        // Update if existing SKU, otherwise create new
        await Product.findOneAndUpdate(
          { sku: sku },
          { $set: productPayload },
          { upsert: true, new: true, runValidators: true }
        );

        successCount++;
      } catch (err: any) {
        failedCount++;
        rowErrors.push({
          rowNumber,
          sku: row['SKU'] || 'N/A',
          name: row['Product Name'] || 'N/A',
          reason: err.message || 'Error processing product row',
          field: 'General'
        });
      }
    }

    // Save Log Session
    await ImportLog.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        filename: `import_${sessionId}.csv`,
        totalRows: rows.length,
        successCount,
        failedCount,
        status: failedCount === rows.length ? 'failed' : 'completed',
        errors: rowErrors,
        createdCategories,
      },
      { upsert: true, new: true }
    );

    return {
      sessionId,
      totalRows: rows.length,
      successCount,
      failedCount,
      errors: rowErrors,
      createdCategories,
    };
  }
}
