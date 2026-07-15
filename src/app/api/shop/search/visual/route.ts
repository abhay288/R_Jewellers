import { NextResponse } from 'next/server';
import connectDB from '@/shared/lib/mongodb';
import Product from '@/backend/models/Product';
import { AIService } from '@/backend/services/AIService';
import { SettingService } from '@/backend/services/SettingService';

export async function POST(request: Request) {
  try {
    await connectDB();
    const settingService = new SettingService();

    const enableVisual = await settingService.getSettingByKey('enableVisualSearch', 'true');
    if (enableVisual === 'false' || enableVisual === false) {
      return NextResponse.json({ error: 'Visual Search is currently disabled by administrator.' }, { status: 400 });
    }

    const data = await request.formData();
    const file = data.get('image') as File | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;

    const aiService = new AIService();
    const analysis = await aiService.analyzeImage(buffer, mimeType);

    if (!analysis) {
      return NextResponse.json({ error: 'Failed to analyze image with AI' }, { status: 500 });
    }

    console.log('AI Visual Search Analysis:', analysis);

    let matchingProducts: any[] = [];
    const queryEmbedding = await aiService.generateEmbedding(analysis.searchQuery || file.name);

    if (queryEmbedding && queryEmbedding.length > 0) {
      // Perform vector similarity search
      const candidates = await Product.find({
        status: 'Published',
        embedding: { $exists: true, $not: { $size: 0 } }
      }).select('name slug description price discount finalPrice images category material weight color occasion embedding').exec();

      const scoredCandidates = candidates.map((cand) => {
        const similarity = aiService.cosineSimilarity(queryEmbedding, cand.embedding || []);
        return { product: cand, similarity };
      });

      scoredCandidates.sort((a, b) => b.similarity - a.similarity);

      // Filter matches above a reasonable threshold
      matchingProducts = scoredCandidates
        .filter((sc) => sc.similarity > 0.45)
        .slice(0, 8)
        .map((sc) => {
          const p = sc.product.toObject();
          delete p.embedding;
          return { ...p, similarity: sc.similarity };
        });
    }

    // Fallback: search by text parameters if vector search returned nothing
    if (matchingProducts.length === 0) {
      const orConditions: any[] = [];
      if (analysis.itemType) {
        orConditions.push({ name: { $regex: analysis.itemType, $options: 'i' } });
      }
      if (analysis.material) {
        orConditions.push({ material: { $regex: analysis.material, $options: 'i' } });
      }
      if (analysis.searchQuery) {
        orConditions.push({ name: { $regex: analysis.searchQuery.split(' ')[0], $options: 'i' } });
      }

      if (orConditions.length > 0) {
        matchingProducts = await Product.find({
          status: 'Published',
          $or: orConditions
        }).limit(8).select('-embedding').exec();
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      products: matchingProducts
    });

  } catch (error: any) {
    console.error('Visual Search POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
