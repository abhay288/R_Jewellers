'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  ArrowRight,
  RefreshCw,
  Info,
  Loader2
} from 'lucide-react';
import Papa from 'papaparse';

interface ImportWizardProps {
  onComplete?: () => void;
}

export default function ImportWizard({ onComplete }: ImportWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [dataFile, setDataFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [autoCreateCategory, setAutoCreateCategory] = useState<boolean>(true);

  // Validation state
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Import Execution state
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [importResult, setImportResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sample CSV Download generator
  const downloadSampleCSV = () => {
    const headers = [
      'SKU', 'Product ID', 'Product Name', 'Slug', 'Category', 'Sub Category', 'Brand', 'Collection',
      'Price', 'MRP', 'Discount', 'Stock', 'Minimum Stock', 'Weight', 'Dimensions', 'Material', 'Stone Type',
      'Color', 'Finish', 'Occasion', 'Gender', 'Style', 'Short Description', 'Long Description', 'Features',
      'Care Instructions', 'Shipping Information', 'Return Policy', 'Warranty', 'Tags', 'Featured', 'Trending',
      'Best Seller', 'New Arrival', 'Active', 'SEO Title', 'SEO Description', 'SEO Keywords', 'Image Folder', 'Video Folder'
    ];

    const sampleRow = [
      'RJ-KUN-9012', 'PRD-10023', 'Royal Bridal Kundan Necklace Set', 'royal-kundan-necklace', 'Necklaces', 'Bridal Sets',
      'Radhika Jewellers', 'Royal Heritage', '45000', '65000', '30', '15', '3', '120g', '18 inches', '22K Gold Plated Alloy',
      'Handcrafted Kundan & Pearl', 'Yellow Gold', 'Antique High Polish', 'Wedding & Royal Reception', 'Women', 'Traditional Rajasthani',
      'Exquisite 22K Gold Plated Kundan Necklace Set with Matching Earrings.',
      '<h2>Royal Kundan Craftsmanship</h2><p>Designed for brides who desire timeless heritage beauty. Embedded with precision-cut Kundan stones.</p>',
      '22K Gold Plating, Certified Kundan Stones, Includes Adjustable Dori, Includes Matching Jhumkas',
      'Avoid contact with moisture perfume and soap. Store in cotton velvet box.',
      'Free 48-Hour Insured Express Delivery across India.', 'Easy 48-hour return or replacement policy.',
      '1 Year Plating Warranty', 'kundan, necklace, bridal, gold, traditional', 'TRUE', 'TRUE', 'TRUE', 'TRUE', 'TRUE',
      'Royal Kundan Necklace Set | Radhika Jewellers', 'Shop authentic Kundan bridal necklace set online at Radhika Jewellers.',
      'kundan necklace, bridal jewellery, gold necklace', 'RJ-KUN-9012', 'RJ-KUN-9012'
    ];

    const csvContent = Papa.unparse([headers, sampleRow]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Radhika_Jewellers_Product_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run Pre-Validation
  const handleRunValidation = async () => {
    if (!dataFile) return;
    setIsValidating(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', dataFile);
      formData.append('action', 'validate');

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Validation failed.');

      setValidationResult(json.validation);
      setStep(2);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  // Run Full Import Pipeline
  const handleExecuteImport = async () => {
    if (!dataFile) return;
    setIsImporting(true);
    setStep(3);
    setImportProgress(20);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', dataFile);
      if (zipFile) formData.append('zip', zipFile);
      formData.append('action', 'execute');
      formData.append('autoCreateCategory', autoCreateCategory.toString());

      setImportProgress(45);

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      setImportProgress(85);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Import failed.');

      setImportProgress(100);
      setImportResult(json.result);

      if (onComplete) onComplete();
    } catch (err: any) {
      setErrorMessage(err.message);
      setImportProgress(0);
    } finally {
      setIsImporting(false);
    }
  };

  // Download error log as CSV
  const downloadErrorCSV = () => {
    if (!importResult?.errors?.length) return;
    const csvContent = Papa.unparse(importResult.errors);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Import_Errors_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Wizard Header & Stepper */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-foreground">Bulk Product Import Wizard</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Import thousands of products automatically with media matching & Cloudinary processing.
          </p>
        </div>
        <button
          onClick={downloadSampleCSV}
          className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-xl text-xs font-semibold transition-colors border border-border"
        >
          <Download className="w-4 h-4 text-primary" />
          Download Sample CSV
        </button>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-3 gap-2 my-6">
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 1 ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border text-muted-foreground'}`}>
          <span className="text-xs uppercase tracking-wider block">Step 1</span>
          <span className="text-sm font-medium">Upload CSV / Excel</span>
        </div>
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 2 ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border text-muted-foreground'}`}>
          <span className="text-xs uppercase tracking-wider block">Step 2</span>
          <span className="text-sm font-medium">Upload Media (ZIP)</span>
        </div>
        <div className={`p-3 rounded-xl border text-center transition-all ${step === 3 ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-border text-muted-foreground'}`}>
          <span className="text-xs uppercase tracking-wider block">Step 3</span>
          <span className="text-sm font-medium">Validation & Import</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-6 rounded-xl bg-destructive/10 border border-destructive text-destructive flex items-center gap-3 text-sm">
          <XCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: CSV / EXCEL UPLOAD */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-muted/20 relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => setDataFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {dataFile ? dataFile.name : 'Select or Drag & Drop Product File (.CSV, .XLSX)'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Supports up to 10,000 product rows in a single import file.
            </p>
            {dataFile && (
              <span className="inline-block mt-3 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                {(dataFile.size / 1024).toFixed(1)} KB Loaded
              </span>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              Column mapping is automatic based on standardized headers.
            </div>
            <button
              onClick={handleRunValidation}
              disabled={!dataFile || isValidating}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-50"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating CSV...
                </>
              ) : (
                <>
                  Next: Validate & Media
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: ZIP MEDIA UPLOAD & CONFIG */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Validation Status summary */}
          {validationResult && (
            <div className="p-4 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                {validationResult.valid ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    {validationResult.totalRows} Product Rows Inspected
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {validationResult.valid ? 'All rows passed pre-validation requirements.' : `${validationResult.errors.length} formatting warnings found.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ZIP File uploader */}
          <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-2xl p-8 text-center bg-muted/20 relative">
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setZipFile(e.target.files?.[0] || null)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <FileArchive className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="text-base font-semibold text-foreground">
              {zipFile ? zipFile.name : 'Upload Media ZIP Archive (Optional)'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-lg mx-auto">
              ZIP folder example: <code className="text-primary font-mono">/images/RJ001-1.jpg</code>, <code className="text-primary font-mono">/videos/RJ001.mp4</code>. Images will automatically be matched by SKU and uploaded to Cloudinary.
            </p>
            {zipFile && (
              <span className="inline-block mt-3 px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-semibold">
                {(zipFile.size / (1024 * 1024)).toFixed(2)} MB Archive Loaded
              </span>
            )}
          </div>

          {/* Settings Switch */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <div>
              <span className="text-sm font-semibold text-foreground block">Auto-Create Missing Categories</span>
              <span className="text-xs text-muted-foreground">
                If a category in the CSV doesn't exist in MongoDB, create it automatically.
              </span>
            </div>
            <input
              type="checkbox"
              checked={autoCreateCategory}
              onChange={(e) => setAutoCreateCategory(e.target.checked)}
              className="w-5 h-5 accent-primary rounded cursor-pointer"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary/30"
            >
              Start Automated Import & Cloudinary Upload
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: IMPORT EXECUTION & DETAILED REPORT */}
      {step === 3 && (
        <div className="space-y-6">
          {isImporting ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
              <h3 className="text-xl font-semibold text-foreground">Processing Products & Media...</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Reading rows, uploading images & videos to Cloudinary, indexing search data, and saving to MongoDB.
              </p>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-3 max-w-md mx-auto overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-500 rounded-full"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          ) : importResult ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-center">
                  <span className="text-2xl font-bold text-emerald-500">{importResult.successCount}</span>
                  <span className="text-xs text-muted-foreground block font-medium mt-1">Products Imported Successfully</span>
                </div>
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-center">
                  <span className="text-2xl font-bold text-destructive">{importResult.failedCount}</span>
                  <span className="text-xs text-muted-foreground block font-medium mt-1">Rows Failed</span>
                </div>
                <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 text-center">
                  <span className="text-2xl font-bold text-primary">{importResult.createdCategories?.length || 0}</span>
                  <span className="text-xs text-muted-foreground block font-medium mt-1">New Categories Created</span>
                </div>
              </div>

              {/* Created Categories listing */}
              {importResult.createdCategories?.length > 0 && (
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-2">Auto-Created Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {importResult.createdCategories.map((c: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-card border border-border rounded-lg text-xs font-medium text-foreground">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Log Breakdown */}
              {importResult.errors?.length > 0 ? (
                <div className="border border-destructive/30 rounded-xl overflow-hidden bg-card">
                  <div className="p-4 bg-destructive/10 border-b border-destructive/30 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Import Execution Warnings & Errors ({importResult.errors.length})
                    </h4>
                    <button
                      onClick={downloadErrorCSV}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-destructive text-destructive-foreground rounded-lg text-xs font-semibold hover:bg-destructive/90 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Error Log (.CSV)
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border text-xs">
                    {importResult.errors.map((err: any, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-4 hover:bg-muted/20">
                        <div>
                          <span className="font-semibold text-foreground">Row {err.rowNumber} ({err.sku})</span>
                          <p className="text-muted-foreground">{err.reason}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-muted rounded text-[10px] uppercase font-mono text-muted-foreground">
                          {err.field || 'General'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-foreground">Complete Success!</h3>
                  <p className="text-xs text-muted-foreground">All products were validated, processed with Cloudinary, and saved to MongoDB.</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  onClick={() => {
                    setStep(1);
                    setDataFile(null);
                    setZipFile(null);
                    setImportResult(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Import Another File
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
