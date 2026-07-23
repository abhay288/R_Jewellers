'use client';

import React, { useState } from 'react';
import { DataTable } from "@/frontend/components/ui/data-table";
import { columns, ProductColumn } from "./columns";
import {
  Upload,
  Download,
  Plus,
  SlidersHorizontal,
  Trash2,
  Tag,
  DollarSign,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import ImportWizard from '@/frontend/components/admin/products/ImportWizard';
import AddProductModal from '@/frontend/components/admin/products/AddProductModal';

interface ProductsClientProps {
  products: ProductColumn[];
  categories: { id: string; name: string }[];
}

export default function ProductsClient({ products, categories }: ProductsClientProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Bulk Form state
  const [bulkAction, setBulkAction] = useState<string>('bulk_price_update');
  const [priceMode, setPriceMode] = useState<'percentage' | 'fixed'>('percentage');
  const [priceValue, setPriceValue] = useState<string>('10');
  const [stockMode, setStockMode] = useState<'set' | 'add'>('set');
  const [stockValue, setStockValue] = useState<string>('20');
  const [toggleValue, setToggleValue] = useState<boolean>(true);
  const [targetCategory, setTargetCategory] = useState<string>('');
  const [targetBrand, setTargetBrand] = useState<string>('Radhika Jewellers');
  const [targetCollection, setTargetCollection] = useState<string>('');

  // Export State
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  // Trigger Bulk Action
  const handleExecuteBulkAction = async () => {
    if (selectedProductIds.length === 0) return;
    setIsSubmittingBulk(true);
    setBulkMessage(null);

    let payload: any = {};
    if (bulkAction === 'bulk_price_update') payload = { mode: priceMode, value: priceValue };
    else if (bulkAction === 'bulk_stock_update') payload = { stockMode, stockValue };
    else if (['bulk_toggle_active', 'bulk_toggle_featured', 'bulk_toggle_trending', 'bulk_toggle_new_arrival'].includes(bulkAction)) payload = { value: toggleValue };
    else if (bulkAction === 'bulk_change_category') payload = { categoryId: targetCategory };
    else if (bulkAction === 'bulk_change_brand') payload = { brand: targetBrand };
    else if (bulkAction === 'bulk_change_collection') payload = { collectionName: targetCollection };

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: bulkAction,
          productIds: selectedProductIds,
          payload,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to apply bulk changes');

      setBulkMessage({ type: 'success', text: `Successfully updated ${json.updatedCount} products!` });
      setTimeout(() => {
        setShowBulkModal(false);
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setBulkMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  // Trigger Export
  const handleExecuteExport = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/admin/products/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format: exportFormat,
          productIds: selectedProductIds.length > 0 ? selectedProductIds : undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to export products.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Radhika_Jewellers_Products_${Date.now()}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setShowExportModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground">Product Management</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Shopify & Amazon Seller style control for bulk operations, Cloudinary media processing, and catalog indexing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowImportWizard(true)}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Upload className="w-4 h-4" />
            Import Products (CSV / ZIP)
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-foreground border border-border px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
          >
            <Download className="w-4 h-4 text-primary" />
            Export Catalog
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Selected Products Toolbar */}
      {selectedProductIds.length > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-primary text-primary-foreground font-bold rounded-lg text-xs">
              {selectedProductIds.length} Selected
            </span>
            <span className="text-sm font-medium text-foreground">Products selected for batch operations.</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Batch Actions
            </button>
            <button
              onClick={() => setSelectedProductIds([])}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        searchPlaceholder="Search products by Name, SKU, ID..."
        onRowSelectionChange={(rows) => {
          setSelectedProductIds(rows.map((r) => r.id));
        }}
      />

      {/* IMPORT WIZARD MODAL */}
      {showImportWizard && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowImportWizard(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <ImportWizard onComplete={() => window.location.reload()} />
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                Export Products
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">Export Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('csv')}
                    className={`p-3 rounded-xl border text-center font-semibold text-sm transition-all ${exportFormat === 'csv' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'}`}
                  >
                    CSV (.csv)
                  </button>
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`p-3 rounded-xl border text-center font-semibold text-sm transition-all ${exportFormat === 'excel' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground'}`}
                  >
                    Excel (.xlsx)
                  </button>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
                {selectedProductIds.length > 0
                  ? `Exporting ${selectedProductIds.length} currently selected products.`
                  : `Exporting all ${products.length} catalog products.`}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteExport}
                disabled={isExporting}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isExporting ? 'Generating...' : 'Download File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BULK ACTIONS MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                Batch Product Operations ({selectedProductIds.length})
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkMessage && (
              <div className={`p-4 rounded-xl border text-sm flex items-center gap-3 ${bulkMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-destructive/10 border-destructive text-destructive'}`}>
                {bulkMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{bulkMessage.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-muted-foreground block mb-2">Select Operation</label>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="bulk_price_update">🏷 Bulk Price Update (Fixed / % Adjustment)</option>
                  <option value="bulk_stock_update">📦 Bulk Stock Adjustment</option>
                  <option value="bulk_toggle_active">👁 Bulk Active / Inactive Toggle</option>
                  <option value="bulk_toggle_featured">⭐ Bulk Featured Toggle</option>
                  <option value="bulk_toggle_trending">🔥 Bulk Trending Toggle</option>
                  <option value="bulk_toggle_new_arrival">🆕 Bulk New Arrival Toggle</option>
                  <option value="bulk_change_category">🗂 Bulk Category Change</option>
                  <option value="bulk_change_brand">🏷 Bulk Brand Change</option>
                  <option value="bulk_change_collection">✨ Bulk Collection Change</option>
                  <option value="bulk_delete">🗑 Bulk Delete (Soft Delete)</option>
                  <option value="bulk_restore">🔄 Bulk Restore Deleted Products</option>
                </select>
              </div>

              {/* Dynamic Inputs per Bulk Action */}
              {bulkAction === 'bulk_price_update' && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPriceMode('percentage')}
                      className={`p-2 rounded-lg text-xs font-semibold border ${priceMode === 'percentage' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-foreground'}`}
                    >
                      Percentage Change (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceMode('fixed')}
                      className={`p-2 rounded-lg text-xs font-semibold border ${priceMode === 'fixed' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-foreground'}`}
                    >
                      Fixed Amount (₹)
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">
                      {priceMode === 'percentage' ? 'Adjustment % (e.g. 10 for +10%, -15 for -15%)' : 'Amount in ₹ (e.g. 500 or -500)'}
                    </label>
                    <input
                      type="number"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}

              {bulkAction === 'bulk_stock_update' && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-xl border border-border">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStockMode('set')}
                      className={`p-2 rounded-lg text-xs font-semibold border ${stockMode === 'set' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-foreground'}`}
                    >
                      Set Exact Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockMode('add')}
                      className={`p-2 rounded-lg text-xs font-semibold border ${stockMode === 'add' ? 'border-primary bg-primary/20 text-primary' : 'border-border text-foreground'}`}
                    >
                      Add / Subtract Stock
                    </button>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground block mb-1">Stock Units</label>
                    <input
                      type="number"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              )}

              {['bulk_toggle_active', 'bulk_toggle_featured', 'bulk_toggle_trending', 'bulk_toggle_new_arrival'].includes(bulkAction) && (
                <div className="p-4 bg-muted/30 rounded-xl border border-border flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Set Value</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setToggleValue(true)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold ${toggleValue ? 'bg-emerald-500 text-white' : 'bg-muted border border-border text-foreground'}`}
                    >
                      ENABLE (TRUE)
                    </button>
                    <button
                      type="button"
                      onClick={() => setToggleValue(false)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold ${!toggleValue ? 'bg-destructive text-white' : 'bg-muted border border-border text-foreground'}`}
                    >
                      DISABLE (FALSE)
                    </button>
                  </div>
                </div>
              )}

              {bulkAction === 'bulk_change_category' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Select Target Category</label>
                  <select
                    value={targetCategory}
                    onChange={(e) => setTargetCategory(e.target.value)}
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm font-medium text-foreground"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {bulkAction === 'bulk_change_brand' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Enter Brand Name</label>
                  <input
                    type="text"
                    value={targetBrand}
                    onChange={(e) => setTargetBrand(e.target.value)}
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground"
                  />
                </div>
              )}

              {bulkAction === 'bulk_change_collection' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Enter Collection Name</label>
                  <input
                    type="text"
                    value={targetCollection}
                    onChange={(e) => setTargetCollection(e.target.value)}
                    placeholder="e.g. Royal Kundan Heritage"
                    className="w-full p-3 bg-card border border-border rounded-xl text-sm text-foreground"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkAction}
                disabled={isSubmittingBulk}
                className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isSubmittingBulk ? 'Applying Changes...' : 'Apply Batch Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        categories={categories}
      />
    </div>
  );
}
