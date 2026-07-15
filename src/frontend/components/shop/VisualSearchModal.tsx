"use client";

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Camera, Sparkles, Loader2, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError("Please upload an image file.");
      return;
    }
    setError(null);
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError(null);
    setResults([]);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const res = await fetch('/api/shop/search/visual', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysis(data.analysis);
        setResults(data.products || []);
      } else {
        setError(data.error || "Failed to analyze image. Please try again.");
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAnalysis(null);
    setResults([]);
    setError(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="fixed inset-x-4 bottom-4 top-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 w-full max-w-2xl bg-background border border-border/50 shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: "-45%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.95, y: "-45%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-border/50">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-playfair text-xl font-bold text-foreground">AI Visual Search</h3>
              </div>
              <button onClick={onClose} className="text-foreground hover:text-primary transition-colors p-2">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {error && (
                <div className="p-4 bg-destructive/15 border border-destructive/30 rounded-2xl text-destructive text-sm">
                  {error}
                </div>
              )}

              {!imagePreview ? (
                /* Drag & Drop Area */
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-4 ${
                    dragActive ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleChange}
                  />
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Upload your jewelry piece</p>
                    <p className="text-xs text-muted-foreground mt-1">Drag and drop or click to browse files</p>
                  </div>
                </div>
              ) : (
                /* Preview and Search */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Image Preview */}
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border border-border/50 bg-secondary flex items-center justify-center">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                      {loading && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-3">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                          <p className="text-xs font-medium animate-pulse">AI is analyzing image...</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={resetState}
                        disabled={loading}
                        className="flex-1 border border-border/50 py-2.5 rounded-xl text-xs font-semibold uppercase hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        Reset Image
                      </button>
                      <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-xs font-semibold uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Search className="w-3.5 h-3.5" />
                        Search Catalog
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Search Results */}
                  <div className="space-y-4 flex flex-col">
                    {/* Analysis attributes */}
                    {analysis && (
                      <div className="bg-secondary/30 border border-border/30 rounded-2xl p-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">AI Detection:</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Type: </span>
                            <span className="font-semibold text-foreground capitalize">{analysis.itemType}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Metal: </span>
                            <span className="font-semibold text-foreground capitalize">{analysis.material}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Style: </span>
                            <span className="font-semibold text-foreground capitalize">{analysis.style}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Color: </span>
                            <span className="font-semibold text-foreground capitalize">{analysis.color}</span>
                          </div>
                        </div>
                        <p className="text-xs italic text-muted-foreground mt-2">"{analysis.searchQuery}"</p>
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px] max-h-[300px] mt-2">
                      {loading ? (
                        <div className="h-full flex items-center justify-center">
                          <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      ) : results.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                          <Upload className="w-8 h-8 stroke-1 opacity-50 mb-2" />
                          <p className="text-xs">No matching products found. Try a different angle or lighting!</p>
                        </div>
                      ) : (
                        results.map((product) => (
                          <Link
                            key={product._id}
                            href={`/product/${product.slug || product._id}`}
                            onClick={onClose}
                            className="flex items-center space-x-3 p-2.5 rounded-xl border border-border/50 hover:border-primary/50 hover:bg-secondary/20 transition-all"
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/50 bg-secondary shrink-0">
                              <Image
                                src={product.images?.[0] || "/assets/placeholder.jpg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="text-xs font-semibold truncate text-foreground pr-2">{product.name}</h5>
                                {product.similarity && (
                                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                                    {Math.round(product.similarity * 100)}% match
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{product.material} • {product.occasion || 'Everyday'}</p>
                              <p className="text-xs font-medium text-primary mt-1">₹{product.finalPrice || product.price}</p>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
