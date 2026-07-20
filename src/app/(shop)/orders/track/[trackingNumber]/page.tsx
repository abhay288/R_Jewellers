"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  ArrowLeft, 
  Clock, 
  Phone, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface TrackingTimelineItem {
  status: string;
  date: string;
  note?: string;
}

interface TrackingData {
  type: 'order' | 'return';
  orderId?: string;
  returnId?: string;
  shipmentId?: string;
  trackingNumber: string;
  courierName: string;
  estimatedDelivery?: string;
  status: string;
  shipmentStatus?: string;
  shippingAddress?: any;
  trackingTimeline: TrackingTimelineItem[];
  lastTrackingUpdate?: string;
}

export default function OrderTrackingPage() {
  const router = useRouter();
  const params = useParams();
  const trackingNumber = params.trackingNumber as string;

  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');



  const fetchTrackingInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/shop/orders/track/${trackingNumber}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Tracking details not found.');
      }
      const trackingResult = await res.json();
      setData(trackingResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo();
    }
  }, [trackingNumber]);

  const steps = [
    { label: 'Order Placed', icon: Package, desc: 'Order received and being processed' },
    { label: 'Confirmed', icon: CheckCircle2, desc: 'Quality checked and confirmed' },
    { label: 'Packed', icon: Package, desc: 'Securely packaged in premium box' },
    { label: 'Shipped', icon: Truck, desc: 'Handed over to delivery partner' },
    { label: 'Out For Delivery', icon: Truck, desc: 'Out with delivery executive' },
    { label: 'Delivered', icon: ShieldCheck, desc: 'Safely delivered to your doorstep' }
  ];

  const getCurrentStepIndex = () => {
    if (!data) return 0;
    const coreStatus = data.status;
    const idx = steps.findIndex(s => s.label === coreStatus);
    return idx === -1 ? 0 : idx;
  };

  const currentStepIdx = getCurrentStepIndex();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center p-6">
        <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-playfair text-xl text-neutral-800 animate-pulse">Locating your luxury parcel...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col justify-center items-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
        <h1 className="text-3xl font-playfair font-bold text-neutral-900 mb-2">Tracking Failed</h1>
        <p className="text-neutral-600 max-w-md mb-8">{error || 'Could not retrieve tracking details.'}</p>
        <button 
          onClick={() => router.back()}
          className="px-8 py-3 bg-neutral-900 text-white rounded-full font-medium hover:bg-neutral-800 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://radhikajewellers.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Profile",
        "item": "https://radhikajewellers.com/profile"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Orders",
        "item": "https://radhikajewellers.com/profile/orders"
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Track Shipment",
        "item": `https://radhikajewellers.com/orders/track/${trackingNumber}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-neutral-800 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Header Banner */}
      <div className="bg-neutral-950 text-[#f5f5f7] py-16 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(217,119,6,0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link href="/profile/orders" className="inline-flex items-center text-xs text-amber-500/80 hover:text-amber-500 uppercase tracking-widest mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Return to profile
          </Link>
          <h1 className="text-4xl md:text-5xl font-playfair font-extrabold tracking-tight mb-2">Track Your Masterpiece</h1>
          <p className="text-sm text-neutral-400 font-mono tracking-wider">AWB NUMBER: {data.trackingNumber}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-20">
        
        {/* Summary Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl p-6 md:p-8 shadow-xl flex flex-wrap gap-8 justify-between items-center mb-8">
          <div>
            <p className="text-xs uppercase text-neutral-400 font-semibold tracking-wider mb-1">Courier Partner</p>
            <h3 className="font-playfair text-xl font-bold flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2.5 inline-block" />
              {data.courierName}
            </h3>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400 font-semibold tracking-wider mb-1">Estimated Delivery</p>
            <h3 className="font-playfair text-xl font-bold">
              {data.estimatedDelivery ? (
                new Date(data.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
              ) : (
                'Pending Pickup'
              )}
            </h3>
          </div>
          <div>
            <p className="text-xs uppercase text-neutral-400 font-semibold tracking-wider mb-1">Shipment Status</p>
            <span className="px-4 py-1.5 bg-neutral-900 text-[#f5f5f7] rounded-full text-xs font-semibold uppercase tracking-widest border border-amber-600/30">
              {data.shipmentStatus || data.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline & Maps */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Elegant Tracking Progress */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100">
              <h3 className="text-lg font-bold font-playfair mb-8">Delivery Lifecycle</h3>
              
              <div className="relative">
                {/* Vertical line for mobile, horizontal for desktop (using desktop vertical layout for premium detailed view) */}
                <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-neutral-100" />
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(Math.max(0, currentStepIdx) / (steps.length - 1)) * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                  className="absolute left-5 top-6 w-0.5 bg-amber-600"
                />

                <div className="space-y-8 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = currentStepIdx >= idx;
                    const isCurrent = currentStepIdx === idx;
                    const Icon = step.icon;
                    
                    const logMatch = data.trackingTimeline.find((t: any) => t.status === step.label);

                    return (
                      <div key={idx} className="flex items-start gap-5 relative group">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors duration-500
                          ${isCompleted ? 'bg-amber-600 text-white shadow-lg' : 'bg-neutral-100 text-neutral-400 border border-neutral-200'}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-baseline gap-2">
                            <h4 className={`font-playfair font-bold text-base transition-colors ${isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                              {step.label}
                            </h4>
                            {logMatch && (
                              <span className="text-xs font-mono text-neutral-400">
                                {new Date(logMatch.date).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-neutral-500 mt-1">{step.desc}</p>
                          {logMatch?.note && (
                            <p className="text-xs text-amber-700 bg-amber-50/50 border border-amber-100 rounded-lg p-2 mt-2 italic">
                              {logMatch.note}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Premium Live Map Placeholder */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-neutral-100 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold font-playfair">Transit Map</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">Real-time route mapping details</p>
                </div>
                <div className="flex items-center text-xs text-amber-600 font-medium">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping mr-2" />
                  Live GPS Active
                </div>
              </div>

              {/* Styled SVG Map Illustration */}
              <div className="aspect-video bg-neutral-50 rounded-2xl border border-neutral-100 relative overflow-hidden flex items-center justify-center">
                {/* SVG background grid patterns */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  {/* Decorative map routes */}
                  <path d="M 50 150 Q 200 80, 350 200 T 700 120" fill="none" stroke="#d4d4d4" strokeWidth="3" strokeDasharray="6 6" />
                  <path d="M 50 150 Q 200 80, 350 200" fill="none" stroke="#d97706" strokeWidth="4" />
                </svg>

                {/* Start Location Node */}
                <div className="absolute left-[10%] top-[60%] flex flex-col items-center">
                  <div className="w-4 h-4 bg-neutral-900 rounded-full border-2 border-white shadow-md" />
                  <span className="text-[10px] font-mono text-neutral-500 mt-1">Origin Hub</span>
                </div>

                {/* Mapped Progress Node */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    y: [0, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{
                    left: `${Math.min(10 + currentStepIdx * 15, 80)}%`,
                    top: `${Math.max(60 - currentStepIdx * 5, 25)}%`
                  }}
                  className="absolute flex flex-col items-center z-30"
                >
                  <MapPin className="w-8 h-8 text-amber-600 filter drop-shadow-md" />
                  <span className="px-2 py-0.5 bg-amber-600 text-white rounded text-[8px] font-bold uppercase tracking-wider -mt-1 shadow-md">
                    In Transit
                  </span>
                </motion.div>

                {/* Destination Node */}
                <div className="absolute right-[15%] top-[25%] flex flex-col items-center">
                  <div className="w-4 h-4 bg-green-600 rounded-full border-2 border-white shadow-md animate-pulse" />
                  <span className="text-[10px] font-mono text-neutral-500 mt-1">Your Address</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Destination summary */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 space-y-6">
              <h3 className="font-playfair font-bold text-lg border-b border-neutral-100 pb-4">Shipping Destination</h3>
              
              {data.shippingAddress ? (
                <div className="text-sm space-y-3">
                  <p className="font-bold text-neutral-900 text-base">{data.shippingAddress.fullName}</p>
                  <div className="text-neutral-500 space-y-1">
                    <p>{data.shippingAddress.houseNo}, {data.shippingAddress.street}</p>
                    {data.shippingAddress.landmark && <p>Landmark: {data.shippingAddress.landmark}</p>}
                    <p>{data.shippingAddress.area}, {data.shippingAddress.city}</p>
                    <p>{data.shippingAddress.state} - {data.shippingAddress.postalCode}</p>
                  </div>
                  <div className="pt-4 border-t border-neutral-100 flex items-center gap-2.5 text-neutral-700">
                    <Phone className="w-4 h-4 text-amber-600" />
                    <span className="font-mono text-xs">{data.shippingAddress.phone}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-400">Loading delivery address details...</p>
              )}
            </div>

            {/* Courier helpline card */}
            <div className="bg-linear-to-br from-neutral-900 to-neutral-950 text-[#f5f5f7] rounded-3xl p-6 shadow-xl border border-neutral-800">
              <h3 className="font-playfair font-bold text-lg mb-2">Need Assistance?</h3>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                If you have custom requests regarding delivery timings or location changes, feel free to coordinate with our dispatch team.
              </p>
              <div className="space-y-4">
                <a 
                  href="tel:+919999999999" 
                  className="flex items-center justify-center gap-2 w-full py-3 bg-white text-neutral-900 rounded-full text-sm font-bold hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Contact Support
                </a>
                <button 
                  onClick={fetchTrackingInfo}
                  className="w-full py-3 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 rounded-full text-xs uppercase tracking-wider font-semibold transition-colors"
                >
                  Force Poll Refresh
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
