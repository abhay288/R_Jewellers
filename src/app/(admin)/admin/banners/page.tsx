"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Move
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface IBannerItem {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  position: number;
  isActive: boolean;
  createdAt?: string;
}

const PRESET_BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=1600",
  "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=1600"
];

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<IBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IBannerItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "/shop",
    buttonText: "Explore Collection",
    position: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to load banners");
      }
    } catch (err) {
      setError("Network error loading banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: PRESET_BANNER_IMAGES[0],
      linkUrl: "/shop",
      buttonText: "Explore Collection",
      position: banners.length,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: IBannerItem) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "/shop",
      buttonText: banner.buttonText || "Explore Collection",
      position: banner.position || 0,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      return alert("Please enter both a Title and an Image URL.");
    }

    setSaving(true);
    try {
      const url = editingBanner ? `/api/admin/banners/${editingBanner._id}` : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBanners();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save banner.");
      }
    } catch (err) {
      alert("Network error saving banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (banner: IBannerItem) => {
    try {
      const res = await fetch(`/api/admin/banners/${banner._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });

      if (res.ok) {
        setBanners((prev) =>
          prev.map((b) => (b._id === banner._id ? { ...b, isActive: !b.isActive } : b))
        );
      }
    } catch (err) {
      console.error("Failed to toggle banner active state:", err);
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${bannerId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b._id !== bannerId));
      } else {
        alert("Failed to delete banner.");
      }
    } catch (err) {
      alert("Network error deleting banner.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-foreground flex items-center">
            Banner Management <Sparkles className="w-5 h-5 ml-2.5 text-amber-500" />
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Configure advertising slides and hero banners for your storefront home page.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl border border-border/50 bg-secondary/80 text-foreground hover:bg-secondary transition-colors cursor-pointer"
            title="Refresh Banners"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-primary/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Banner
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-64 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-xs text-muted-foreground">Loading storefront banners...</p>
        </div>
      )}

      {/* Error Banner */}
      {error && !loading && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-4 rounded-2xl text-xs font-semibold flex justify-between items-center">
          <span>{error}</span>
          <button onClick={fetchBanners} className="underline hover:opacity-80">Retry</button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && banners.length === 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-10 shadow-xs flex flex-col items-center justify-center min-h-75 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="font-playfair font-bold text-lg mb-2 text-foreground">No promotional banners configured</h3>
          <p className="text-muted-foreground text-xs max-w-sm mb-6">
            Click 'Add New Banner' to create custom promotional slides for your homepage header carousel.
          </p>
          <button 
            onClick={handleOpenAddModal}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md cursor-pointer"
          >
            + Add First Banner
          </button>
        </div>
      )}

      {/* Banners Grid */}
      {!loading && !error && banners.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner._id}
              className={cn(
                "bg-card border rounded-3xl overflow-hidden shadow-xs transition-all duration-300 flex flex-col justify-between group",
                banner.isActive ? "border-border/60 hover:border-amber-500/40" : "border-border/30 opacity-60"
              )}
            >
              {/* Image Preview Stage */}
              <div className="relative h-48 w-full bg-secondary/50 overflow-hidden">
                <Image 
                  src={banner.imageUrl} 
                  alt={banner.title}
                  fill 
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="bg-amber-500 text-neutral-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                      Position #{banner.position}
                    </span>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border backdrop-blur-md",
                      banner.isActive ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" : "bg-zinc-500/20 border-zinc-500/30 text-zinc-300"
                    )}>
                      {banner.isActive ? "Active" : "Hidden"}
                    </span>
                  </div>
                  <h3 className="font-playfair font-bold text-lg text-white drop-shadow-md truncate">{banner.title}</h3>
                  {banner.subtitle && <p className="text-xs text-white/80 line-clamp-1">{banner.subtitle}</p>}
                </div>
              </div>

              {/* Banner Information & Controls */}
              <div className="p-5 flex items-center justify-between bg-card">
                <div className="flex items-center space-x-3 text-xs text-muted-foreground truncate">
                  <ExternalLink className="w-4 h-4 shrink-0 text-amber-500" />
                  <span className="font-mono truncate">{banner.linkUrl || '/shop'}</span>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={cn(
                      "p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                      banner.isActive 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/20" 
                        : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                    )}
                    title={banner.isActive ? "Hide Banner" : "Show Banner"}
                  >
                    {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(banner)}
                    className="p-2 rounded-xl border border-border/60 bg-secondary/80 text-foreground hover:bg-secondary transition-colors cursor-pointer"
                    title="Edit Banner"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors cursor-pointer"
                    title="Delete Banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/60 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-xl font-playfair font-bold text-foreground">
                {editingBanner ? "Edit Promotional Banner" : "Add New Promotional Banner"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Banner Title *</label>
                <input 
                  required
                  type="text" 
                  placeholder="e.g. Royal Kundan Collection 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Subtitle / Tagline</label>
                <input 
                  type="text" 
                  placeholder="e.g. Designer artificial jewellery with 24K gold finish"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Banner Image URL *</label>
                <input 
                  required
                  type="url" 
                  placeholder="https://images.unsplash.com/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500"
                />
                
                {/* Preset image suggestions */}
                <div className="pt-2">
                  <span className="text-[10px] text-muted-foreground block mb-1">Quick Presets:</span>
                  <div className="flex space-x-2 overflow-x-auto pb-1">
                    {PRESET_BANNER_IMAGES.map((imgUrl, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData({ ...formData, imageUrl: imgUrl })}
                        className="relative w-12 h-12 rounded-lg overflow-hidden border border-border/60 hover:border-amber-500 shrink-0 cursor-pointer"
                      >
                        <Image src={imgUrl} alt={`Preset ${idx + 1}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Link URL</label>
                  <input 
                    type="text" 
                    placeholder="/shop or /categories/kundan"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Button Label</label>
                  <input 
                    type="text" 
                    placeholder="Explore Collection"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Display Sequence Position</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: Number(e.target.value) })}
                    className="w-full bg-background border border-border/50 rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-5">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Is Active</span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer",
                      formData.isActive ? "bg-amber-500" : "bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full bg-neutral-950 transition-transform shadow-xs",
                      formData.isActive ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex space-x-3 pt-6 border-t border-border/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border/60 font-bold text-xs hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Saving Banner..." : editingBanner ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
