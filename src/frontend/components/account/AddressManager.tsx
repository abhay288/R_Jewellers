"use client";

import { useState, useEffect } from "react";
import { 
  MapPin, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, 
  Loader2, Building, Home, Briefcase, Star, X, Check
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  email: string;
  houseNo: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
  country: string;
  addressType: "Home" | "Office" | "Other";
  isDefault: boolean;
}

export default function AddressManager() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressType, setAddressType] = useState<"Home" | "Office" | "Other">("Home");
  const [isDefault, setIsDefault] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shop/addresses");
      if (!res.ok) throw new Error("Failed to load addresses.");
      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setHouseNo("");
    setStreet("");
    setLandmark("");
    setArea("");
    setCity("");
    setDistrict("");
    setState("");
    setPostalCode("");
    setAddressType("Home");
    setIsDefault(addresses.length === 0);
    setIsModalOpen(true);
  };

  const openEditModal = (addr: Address) => {
    setEditingAddress(addr);
    setFullName(addr.fullName || "");
    setPhone(addr.phone || "");
    setEmail(addr.email || "");
    setHouseNo(addr.houseNo || "");
    setStreet(addr.street || "");
    setLandmark(addr.landmark || "");
    setArea(addr.area || "");
    setCity(addr.city || "");
    setDistrict(addr.district || "");
    setState(addr.state || "");
    setPostalCode(addr.postalCode || "");
    setAddressType(addr.addressType || "Home");
    setIsDefault(addr.isDefault || false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    const payload = {
      fullName,
      phone,
      email: email || "customer@radhika.com",
      houseNo,
      street,
      landmark,
      area: area || street,
      city,
      district: district || city,
      state,
      postalCode,
      country: "India",
      addressType,
      isDefault,
    };

    try {
      const url = editingAddress
        ? `/api/shop/addresses/${editingAddress._id}`
        : "/api/shop/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address.");

      setSuccessMsg(editingAddress ? "Address updated successfully!" : "New address added successfully!");
      setIsModalOpen(false);
      fetchAddresses();

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to save address.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this saved address?")) return;

    try {
      const res = await fetch(`/api/shop/addresses/${addressId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address.");

      setSuccessMsg("Address removed.");
      fetchAddresses();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      const res = await fetch(`/api/shop/addresses/${addr._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addr, isDefault: true }),
      });
      if (!res.ok) throw new Error("Failed to update default address.");

      setSuccessMsg("Default shipping address updated.");
      fetchAddresses();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500 mb-2" />
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Loading Saved Addresses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h3 className="text-xl font-playfair font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            Saved Delivery Addresses
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">Manage your shipping destinations for faster checkout</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-3" />
          Add New Address
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center space-x-2 bg-green-500/15 text-green-600 dark:text-green-400 p-3.5 rounded-2xl text-xs border border-green-500/30">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 bg-destructive/15 text-destructive p-3.5 rounded-2xl text-xs border border-destructive/30">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Address Grid */}
      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-secondary/20 rounded-3xl border border-border/40">
          <MapPin className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-base font-semibold text-foreground mb-1">No Saved Addresses Found</h4>
          <p className="text-xs text-muted-foreground mb-4">Add your home or office address to enable quick 1-click checkout.</p>
          <button
            onClick={openAddModal}
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={cn(
                "border rounded-2xl p-5 bg-background/50 relative flex flex-col justify-between transition-all duration-300",
                addr.isDefault ? "border-amber-500/80 shadow-md ring-1 ring-amber-500/30" : "border-border/60 hover:border-primary/40"
              )}
            >
              <div>
                {/* Card Header & Badges */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary border border-border/50 text-foreground flex items-center gap-1">
                      {addr.addressType === "Home" && <Home className="w-3 h-3 text-amber-500" />}
                      {addr.addressType === "Office" && <Briefcase className="w-3 h-3 text-blue-500" />}
                      {addr.addressType === "Other" && <Building className="w-3 h-3 text-purple-500" />}
                      {addr.addressType}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-secondary rounded-full transition-colors cursor-pointer"
                      title="Edit Address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addr._id)}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer"
                      title="Delete Address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Address Details */}
                <h4 className="font-bold text-sm text-foreground mb-1">{addr.fullName}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {addr.houseNo}, {addr.street}{addr.area ? `, ${addr.area}` : ""}{addr.landmark ? ` (Near ${addr.landmark})` : ""}
                  <br />
                  {addr.city}, {addr.state} - <strong className="text-foreground">{addr.postalCode}</strong>
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  Mobile: <span className="text-foreground font-bold">{addr.phone}</span>
                </p>
              </div>

              {/* Bottom Action */}
              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t border-border/40">
                  <button
                    onClick={() => handleSetDefault(addr)}
                    className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5" /> Set as Default Address
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-background border border-border/60 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="font-playfair text-lg font-bold text-foreground">
                {editingAddress ? "Edit Saved Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Recipient Name"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">House / Flat No. *</label>
                  <input
                    type="text"
                    required
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    placeholder="Apt 4B, Building 12"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">Pincode *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="6-digit Pincode"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">Street / Road / Area *</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    if (!area) setArea(e.target.value);
                  }}
                  placeholder="MG Road, Civil Lines"
                  className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (!district) setDistrict(e.target.value);
                    }}
                    placeholder="Jaipur"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold uppercase text-muted-foreground">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Rajasthan"
                    className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">Landmark (Optional)</label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near City Palace Gate 2"
                  className="w-full bg-secondary/30 border border-border/60 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Address Type Toggle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-muted-foreground">Address Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Home", "Office", "Other"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAddressType(type)}
                      className={cn(
                        "py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                        addressType === type
                          ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold"
                          : "border-border/60 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      {type === "Home" && <Home className="w-3.5 h-3.5" />}
                      {type === "Office" && <Briefcase className="w-3.5 h-3.5" />}
                      {type === "Other" && <Building className="w-3.5 h-3.5" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Address Checkbox */}
              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
                <span className="text-xs font-medium text-foreground">Make this my default shipping address</span>
              </label>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-border/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-3" />
                      {editingAddress ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
