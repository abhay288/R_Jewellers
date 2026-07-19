"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, animate } from "framer-motion";
import { 
  ArrowRight, Star, ShieldCheck, Award, Heart, HelpCircle, 
  ChevronLeft, ChevronRight, Sparkles, Navigation, 
  Truck, Hammer, CheckCircle, Package, ChevronDown,
  MapPin
} from "lucide-react";
import FeaturedCollections from "@/frontend/components/home/FeaturedCollections";
import BrandStory from "@/frontend/components/home/BrandStory";
import TrendingSlider from "@/frontend/components/home/TrendingSlider";

// Animated counter
function Counter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString() + suffix);
  useEffect(() => {
    const controls = animate(count, value, { duration, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, count]);
  return <motion.span>{rounded}</motion.span>;
}

// Category data — portrait cards
const circularCategories = [
  { name: "Necklaces", slug: "necklaces", subtitle: "Statement Pieces", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400" },
  { name: "Rings", slug: "rings", subtitle: "Eternal Symbols", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" },
  { name: "Bracelets", slug: "bracelets", subtitle: "Wrist Elegance", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400" },
  { name: "Bangles", slug: "bangles", subtitle: "Heritage Craft", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400" },
  { name: "Earrings", slug: "earrings", subtitle: "Face Framing", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=400" },
  { name: "Anklets", slug: "anklets", subtitle: "Subtle Grace", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
  { name: "Bridal Sets", slug: "bridal-sets", subtitle: "Royal Occasions", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400" },
  { name: "Festival", slug: "festival-collection", subtitle: "Celebration", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400" },
  { name: "Gifts", slug: "gift-collection", subtitle: "Curated Giving", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=400" },
  { name: "Mangalsutras", slug: "necklaces", subtitle: "Sacred Bonds", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400" },
];

// Motion Videos
const motionJewellery = [
  { title: "Diamond Collection", category: "High Jewellery", desc: "Brilliance captured in every facet — our finest CZ diamond pieces.", video: "https://res.cloudinary.com/didisxfr/video/upload/v1784448320/Diamond_kv5xpu.mp4", fallback: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600" },
  { title: "Bridal Collection", category: "Heritage Gold", desc: "Every piece tells the story of an extraordinary day.", video: "https://player.vimeo.com/external/538571059.hd.mp4?s=1d743a699ba14c62b258e72c83c27ee98236d8d6&profile_id=172&oauth2_token_id=57447761", fallback: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600" },
  { title: "Festival Wear", category: "Contemporary Designs", desc: "Vivid, celebratory jewellery made for the grandest occasions.", video: "https://player.vimeo.com/external/371433846.hd.mp4?s=4bf1f1eb5bc9f1c7d2b51ff73dbb8e967a57a5cf&profile_id=174&oauth2_token_id=57447761", fallback: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600" },
  { title: "Necklace Showcase", category: "Choker Series", desc: "Statement collars crafted for the modern woman.", video: "https://player.vimeo.com/external/517602120.hd.mp4?s=4a20fb8932599723ec083b482ee4e1957248f219&profile_id=174&oauth2_token_id=57447761", fallback: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600" },
  { title: "Royal Rings", category: "Classic Solitaires", desc: "Timeless solitaires that define quiet luxury.", video: "https://player.vimeo.com/external/435674703.hd.mp4?s=6f4834ab023af7cc41147a469a475a80d5d4d39f&profile_id=174&oauth2_token_id=57447761", fallback: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=600" }
];

// Bridal Lookbook
const lookbookLooks = {
  haldi: {
    title: "The Haldi Splendor",
    subtitle: "Bright, radiant yellow floral & gold combinations.",
    desc: "An elegant, lightweight ensemble featuring delicate gold-plated floral chokers and matching jhumkas, styled to shine brilliantly alongside traditional yellow turmeric ceremonies.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=1000",
    jewellery: ["Delicate Floral Necklace", "Petal Earrings", "Shining Kada Bracelet"]
  },
  mehendi: {
    title: "The Mehendi Garden",
    subtitle: "Intricate green emerald accents and custom sets.",
    desc: "Exquisite details styled with leaf patterns and emerald drop gems. Heavy cuffs designed to stand out against intricate henna patterns on hands.",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000",
    jewellery: ["Emerald Choker Set", "Intricate Leaf Maang Tikka", "Heavy Filigree Bangle Set"]
  },
  engagement: {
    title: "The Engagement Radiance",
    subtitle: "Contemporary diamond lustre and minimalist bands.",
    desc: "Crafted to celebrate new chapters. High-polish CZ diamonds styled to catch every flash of light, offering a sophisticated, modern statement for the evening.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000",
    jewellery: ["Sparkling CZ Solitaire Choker", "Tear-drop Earrings", "Elegance Diamond Kada"]
  },
  wedding: {
    title: "The Royal Wedding",
    subtitle: "Heavy Kundan and Polki heritage masterpieces.",
    desc: "For the grand moment. Multi-layer heritage Kundan necklaces paired with matching temple jewellery and bridal crowns, creating an unforgettable queenly stance.",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1000",
    jewellery: ["Grand Royal Choker", "Long Multi-layer Kundan Haar", "Bespoke Bridal Jhumkas", "Polki Kada Set"]
  },
  reception: {
    title: "The Reception Gala",
    subtitle: "Modern statement collars and high-fashion luxury.",
    desc: "Sleek, glamorous jewellery styling that blends traditional motifs with contemporary silhouettes. Designed to flow elegantly with reception evening gowns.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=1000",
    jewellery: ["Modern Collar Necklace", "Crystalline Statement Earrings", "Shining Platinum Bangle"]
  }
};

// Gift Finder
const giftResults = [
  { name: "Royal Solitaire Ring", price: 1499, budget: "₹999–₹1999", occasion: "Anniversary", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500" },
  { name: "Kundan Droplet Earrings", price: 899, budget: "₹499–₹999", occasion: "Festival", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=500" },
  { name: "Grand Bridal Choker", price: 3499, budget: "₹2999–₹4999", occasion: "Wedding", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=500" },
  { name: "CZ Tear-drop Earrings", price: 1299, budget: "₹999–₹1999", occasion: "Birthday", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=500" },
  { name: "Elegance Diamond Kada", price: 2199, budget: "₹1999–₹2999", occasion: "Engagement", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500" },
  { name: "Bespoke Emerald Set", price: 5499, budget: "₹4999+", occasion: "Anniversary", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=500" },
  { name: "Pearl Drop Earrings", price: 799, budget: "₹499–₹999", occasion: "Mother's Day", image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&q=80&w=500" },
  { name: "Classic Bangle Set", price: 1899, budget: "₹999–₹1999", occasion: "Festival", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=500" },
  { name: "Love Heart Ring", price: 1099, budget: "₹999–₹1999", occasion: "Valentine", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=500" }
];

// Customer Gallery
const customerGems = [
  { username: "@kavya.shah", location: "Ahmedabad", rating: 5, product: "Kundan Collar Set", review: "Absolutely breathtaking. The craftsmanship feels like fine jewellery worth ten times the price.", likes: 142, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600" },
  { username: "@ananya_rao", location: "Bangalore", rating: 5, product: "Royal Drop Earrings", review: "Wearing these to my sister's reception — everyone asked where they're from. So proud.", likes: 89, image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=600" },
  { username: "@priyanka.k", location: "Mumbai", rating: 5, product: "Solitaire Kada", review: "Skin-safe and absolutely gorgeous. No tarnish after three months of daily wear.", likes: 215, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600" },
  { username: "@shruti.j", location: "Delhi", rating: 5, product: "Diamond Choker", review: "The packaging alone made me emotional. Premium velvet box, certificate, the whole experience.", likes: 173, image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=600" }
];

// Why Choose Radhika
const whyChooseReasons = [
  { title: "Certified Jewellery", desc: "Every design backed by our validation certificates.", icon: ShieldCheck },
  { title: "Premium Quality", desc: "Handcrafted using hypoallergenic, skin-safe materials.", icon: Star },
  { title: "Secure Checkout", desc: "SSL certified channels for complete peace of mind.", icon: Award },
  { title: "Easy Returns", desc: "Complimentary return shipping and exchanges.", icon: Navigation },
  { title: "Bespoke Packaging", desc: "Velvet-lined legacy cases for timeless gifting.", icon: Package },
  { title: "Express Delivery", desc: "Complimentary express delivery to your doorstep.", icon: Truck },
  { title: "Artisan Craft", desc: "Finely detailed by veteran traditional jewellery makers.", icon: Hammer },
  { title: "Affordable Luxury", desc: "Premium styling at approachable price points.", icon: Sparkles },
  { title: "24/7 Support", desc: "Our concierge team is always standing by.", icon: HelpCircle },
  { title: "Safe Settings", desc: "Stones locked in durable, precision settings.", icon: CheckCircle }
];

// Motion Video Card
function MotionVideoCard({ item, index }: { item: typeof motionJewellery[0]; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleMouseEnter = () => {
    if (videoRef.current) videoRef.current.play().catch(() => {});
  };
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={handleMouseEnter}
      className="w-72 md:w-84 shrink-0 group relative h-[600px] overflow-hidden bg-[#1a1a18] cursor-pointer luxury-card"
    >
      {/* Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          ref={videoRef}
          src={item.video}
          loop
          muted
          playsInline
          autoPlay
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06] filter brightness-[0.65]"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent z-10" />
      </div>

      {/* Category badge */}
      <div className="absolute top-6 left-6 z-20">
        <span className="text-[9px] uppercase tracking-[0.35em] text-[#C9A227] font-bold bg-black/40 backdrop-blur-sm border border-[#C9A227]/25 px-3.5 py-1.5">
          {item.category}
        </span>
      </div>

      {/* Mute button */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 z-20 w-9 h-9 bg-black/40 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:border-[#C9A227]/60 transition-colors cursor-pointer"
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l-2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L4.5 9H1.5v6h3l4.5 3.75V5.25z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
          </svg>
        )}
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
        <h4 className="font-playfair text-2xl text-white font-bold mb-2 group-hover:text-[#F5E6C4] transition-colors duration-500">
          {item.title}
        </h4>
        <div className="w-8 h-px bg-[#C9A227] mb-4 group-hover:w-16 transition-all duration-700 ease-out" />
        <p className="text-white/65 text-xs font-light leading-relaxed mb-6 max-w-[240px]">
          {item.desc}
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.35em] font-bold text-[#C9A227] hover:text-white transition-colors duration-300"
          onClick={e => e.stopPropagation()}
        >
          View Collection
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </div>

      {/* Gold frame reveal on hover */}
      <div className="absolute inset-0 border border-[#C9A227]/0 group-hover:border-[#C9A227]/30 transition-all duration-700 pointer-events-none z-30" />
    </motion.div>
  );
}

// Category Card
function CategoryCard({ cat, index }: { cat: typeof circularCategories[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer"
    >
      <Link href={`/shop?category=${cat.slug}`} className="block">
        {/* Image */}
        <div className="relative h-[320px] md:h-[380px] overflow-hidden mb-4 bg-[#F5EDD8]">
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-1200 ease-out group-hover:scale-[1.08]"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent z-10" />
          {/* Gold border on hover */}
          <div className="absolute inset-0 border border-[#C9A227]/0 group-hover:border-[#C9A227]/50 transition-all duration-700 pointer-events-none z-20" />
          {/* Category name inside image */}
          <div className="absolute bottom-5 left-5 z-20">
            <h3 className="font-playfair text-white text-xl font-bold leading-tight">
              {cat.name}
            </h3>
            <p className="text-white/65 text-[10px] tracking-[0.2em] uppercase mt-1">
              {cat.subtitle}
            </p>
          </div>
        </div>
        {/* CTA link */}
        <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.3em] font-bold text-muted-foreground group-hover:text-primary transition-colors duration-300">
          <span>Shop Now</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function HomeClient({
  featuredProducts,
  trendingProducts,
  bestSellers,
  categories
}: {
  featuredProducts: any[],
  trendingProducts: any[],
  bestSellers: any[],
  categories: any[]
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [lookbookTab, setLookbookTab] = useState<keyof typeof lookbookLooks>('wedding');
  const [selectedBudget, setSelectedBudget] = useState('₹999–₹1999');
  const [selectedOccasion, setSelectedOccasion] = useState('Anniversary');
  const [likesState, setLikesState] = useState([142, 89, 215, 173]);
  const [likedCards, setLikedCards] = useState<boolean[]>([false, false, false, false]);
  const [testimonialDir, setTestimonialDir] = useState(1);

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const bannerVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playVideo = (videoRef: React.RefObject<HTMLVideoElement | null>) => {
      if (videoRef.current) videoRef.current.play().catch(() => {});
    };
    playVideo(heroVideoRef);
    playVideo(bannerVideoRef);
  }, [isLoading]);

  const handleLikeClick = (idx: number) => {
    const updatedLiked = [...likedCards];
    const updatedLikes = [...likesState];
    if (updatedLiked[idx]) { updatedLikes[idx] -= 1; updatedLiked[idx] = false; }
    else { updatedLikes[idx] += 1; updatedLiked[idx] = true; }
    setLikesState(updatedLikes);
    setLikedCards(updatedLiked);
  };

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const scrollWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -100]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  const cursorX = useSpring(useMotionValue(0), { stiffness: 100, damping: 25 });
  const cursorY = useSpring(useMotionValue(0), { stiffness: 100, damping: 25 });

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => { cursorX.set(e.clientX); cursorY.set(e.clientY); };
    window.addEventListener("mousemove", handleGlobalMouseMove);
    return () => window.removeEventListener("mousemove", handleGlobalMouseMove);
  }, [cursorX, cursorY]);

  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 10}s`,
      duration: `${12 + Math.random() * 10}s`,
      size: Math.random() > 0.7 ? 3 : 2,
    }));
    setParticles(generated);
    const t = setTimeout(() => setIsLoading(false), 1600);
    return () => clearTimeout(t);
  }, []);

  const testimonials = [
    {
      name: "Aishwarya Rai",
      location: "Mumbai, Maharashtra",
      rating: 5,
      comment: "The craftsmanship of the Royal Kundan Set is absolutely breath-taking. It looks and feels like heritage fine jewellery. I wore it for my wedding reception, and the compliments never stopped.",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Priyanka Sharma",
      location: "New Delhi, Delhi",
      rating: 5,
      comment: "I am extremely sensitive to alloys, but Radhika Jewellers' pieces are genuinely skin-safe and hypoallergenic. The gold finish has a gorgeous luxury polish, not brassy at all.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    },
    {
      name: "Meera Deshmukh",
      location: "Pune, Maharashtra",
      rating: 5,
      comment: "Exceptional customer support and premium luxury packaging. The jewellery arrived in a beautiful velvet-lined gift box with validation certificates. Highly recommended brand!",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
    }
  ];

  const filteredGifts = giftResults.filter(
    (gift) => gift.budget === selectedBudget || gift.occasion === selectedOccasion
  ).slice(0, 3);

  const changeTestimonial = (dir: number) => {
    setTestimonialDir(dir);
    setActiveTestimonial(prev => (prev + dir + testimonials.length) % testimonials.length);
  };

  return (
    <>
      {/* ─── Luxury Loading Screen ─── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-background z-9999 flex flex-col items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,230,196,0.15),transparent_70%)] pointer-events-none" />
            <div className="luxury-grain" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="text-center relative z-10"
            >
              <div className="absolute -inset-10 rounded-full border border-primary/5 blur-md scale-95 opacity-50 animate-pulse pointer-events-none" />
              <motion.h1
                initial={{ letterSpacing: "0.15em" }}
                animate={{ letterSpacing: "0.3em" }}
                transition={{ duration: 1.6, ease: "easeInOut" }}
                className="font-playfair text-4xl md:text-6xl text-gradient-gold text-shimmer-gold mb-3 font-bold"
              >
                RADHIKA
              </motion.h1>
              <p className="text-[9px] uppercase tracking-[0.45em] text-muted-foreground/80 font-light">
                Luxury Jewellery Boutique
              </p>
              <div className="h-px w-36 bg-primary/20 mx-auto mt-10 relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-gradient-gold w-1/2"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex flex-col min-h-screen bg-background relative"
        ref={containerRef}
      >
        {/* Inline keyframes for animations */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
          @keyframes goldDust {
            0%{transform:translateY(100vh) scale(0.5);opacity:0}
            20%{opacity:0.7}
            80%{opacity:0.3}
            100%{transform:translateY(-15vh) translateX(20px) scale(1.2);opacity:0}
          }
          .animate-float{animation:float 6s ease-in-out infinite}
          .dust-particle{
            position:absolute;background:#C9A227;border-radius:50%;
            pointer-events:none;animation:goldDust linear infinite;z-index:5;
          }
        `}} />

        {/* Scroll Progress Bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] bg-[#C9A227] z-999 origin-left"
          style={{ width: scrollWidth }}
        />

        {/* Global Cursor Spotlight */}
        <motion.div
          className="fixed pointer-events-none inset-0 z-30 hidden md:block"
          style={{
            background: useTransform(
              [cursorX, cursorY],
              ([cx, cy]) => `radial-gradient(350px at ${cx}px ${cy}px, rgba(201,162,39,0.04), transparent 80%)`
            )
          }}
        />

        {/* ══════════════════════════════════════════════
            HERO SECTION
        ══════════════════════════════════════════════ */}
        <section className="hero-video relative h-[88vh] w-full overflow-hidden bg-black">
          {/* Gold dust particles inside hero */}
          {particles.map(p => (
            <div
              key={p.id}
              className="dust-particle"
              style={{
                left: p.left,
                bottom: 0,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}

          {/* Hero Video */}
          <video
            ref={heroVideoRef}
            src="/assets/Hero_Video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover z-0"
            style={{ filter: "brightness(0.78)" }}
          />

          {/* Cinematic overlays */}
          <div className="absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/65 z-1 pointer-events-none" />
          <div className="luxury-grain opacity-15 z-2" />

          {/* Top left — Season badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="absolute top-6 left-6 md:left-12 z-20"
          >
            <span className="text-[9px] uppercase tracking-[0.45em] font-bold text-white/90 bg-white/8 backdrop-blur-md border border-white/15 px-5 py-2.5">
              New Bridal Collection — 2025
            </span>
          </motion.div>

          {/* Top right — logo watermark */}
          <div className="absolute top-6 right-6 z-20 opacity-25 select-none hidden md:block">
            <Image
              src="/assets/logo.png"
              alt="Radhika Jewellers"
              width={60}
              height={60}
              style={{ width: "auto", height: "auto" }}
              className="object-contain brightness-[2] mix-blend-screen"
            />
          </div>

          {/* Center hero text */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="absolute inset-0 flex items-center justify-center z-10 text-center px-6"
          >
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9, duration: 0.8 }}
                className="text-[10px] uppercase tracking-[0.5em] text-[#C9A227] font-bold mb-6"
              >
                Radhika Jewellers
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.0, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                className="font-playfair font-bold text-white mb-6 leading-[0.95]"
                style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
              >
                Where Every Jewel<br />
                <em className="font-normal italic text-[#E6C280]">Tells a Story</em>
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 2.2, duration: 0.8 }}
                className="w-20 h-px bg-[#C9A227] mx-auto mb-8"
              />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.3, duration: 0.8 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Link href="/shop" className="btn-luxury-ghost">
                  <span>Shop Collection</span>
                  <ArrowRight className="w-3.5 h-3.5 relative z-10" />
                </Link>
                <Link
                  href="#lookbook"
                  className="text-[9px] uppercase tracking-[0.4em] font-bold text-white/70 hover:text-[#C9A227] transition-colors duration-300 border-b border-white/20 hover:border-[#C9A227] pb-0.5"
                >
                  Bridal Lookbook
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.8, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
          >
            <span className="text-[8px] uppercase tracking-[0.4em] text-white/50 font-bold">Scroll</span>
            <div className="animate-scroll-bounce">
              <ChevronDown className="w-4 h-4 text-[#C9A227]" />
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════
            SHOP BY CATEGORY
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-ivory">
          <div className="container mx-auto px-6">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-20"
            >
              <span className="label-luxury text-primary block mb-5">Curated Selections</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                Shop by Category
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            {/* Category cards grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 md:gap-6">
              {circularCategories.map((cat, index) => (
                <CategoryCard key={cat.slug + index} cat={cat} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            JEWELLERY IN MOTION
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-editorial-dark relative overflow-hidden">
          {/* Subtle gold radial */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(201,162,39,0.06),transparent_70%)] pointer-events-none" />

          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <span className="label-luxury text-[#C9A227] block mb-5">Cinematic Showcase</span>
              <h2 className="font-playfair font-bold text-white mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                Jewellery in Motion
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            {/* Horizontal slider */}
            <div className="flex overflow-x-auto gap-5 pb-6 scrollbar-thin scrollbar-thumb-[#C9A227]/20 scrollbar-track-transparent -mx-6 px-6">
              {motionJewellery.map((item, index) => (
                <MotionVideoCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            FEATURED COLLECTIONS
        ══════════════════════════════════════════════ */}
        <FeaturedCollections collections={categories} />

        {/* ══════════════════════════════════════════════
            BRIDAL LOOKBOOK
        ══════════════════════════════════════════════ */}
        <section id="lookbook" className="py-32 section-linen relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <span className="label-luxury text-primary block mb-5">Bridal Lookbook</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                Royal Wedding Styling
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            {/* Tabs — editorial underline style */}
            <div className="flex flex-wrap justify-center gap-1 mb-16 border-b border-border/30">
              {Object.keys(lookbookLooks).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setLookbookTab(tab as any)}
                  className={`px-6 py-3.5 text-[10px] font-bold tracking-[0.35em] uppercase transition-all duration-400 cursor-pointer relative -mb-px ${
                    lookbookTab === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Lookbook display */}
            <div className="flex flex-col lg:flex-row items-stretch gap-0 max-w-6xl mx-auto border border-border/20 overflow-hidden shadow-xl">
              {/* Left — Image */}
              <div className="relative w-full lg:w-[55%] h-[440px] lg:h-[580px] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lookbookTab + "-image"}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={lookbookLooks[lookbookTab].image}
                      alt={lookbookLooks[lookbookTab].title}
                      fill
                      sizes="(max-width: 768px) 100vw, 55vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-transparent to-black/15" />
                  </motion.div>
                </AnimatePresence>

                {/* Floating jewellery detail chips */}
                <div className="absolute bottom-6 left-6 z-20 space-y-2">
                  {lookbookLooks[lookbookTab].jewellery.slice(0, 2).map((jewel, i) => (
                    <motion.div
                      key={jewel}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-2 glass-dark px-4 py-2 max-w-[220px]"
                    >
                      <div className="w-1.5 h-1.5 bg-[#C9A227] rounded-full shrink-0" />
                      <span className="text-[9px] text-white/90 font-light tracking-wide truncate">{jewel}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right — Content */}
              <div className="w-full lg:w-[45%] bg-white flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={lookbookTab + "-content"}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="p-10 lg:p-14"
                  >
                    <span className="label-luxury text-primary block mb-6">Radhika Exclusive Look</span>
                    <h3 className="font-playfair font-bold text-foreground mb-3 leading-tight" style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}>
                      {lookbookLooks[lookbookTab].title}
                    </h3>
                    <p className="text-primary italic text-sm font-medium mb-6">
                      {lookbookLooks[lookbookTab].subtitle}
                    </p>
                    <div className="w-10 h-px bg-[#C9A227] mb-6" />
                    <p className="text-muted-foreground text-sm font-light leading-[1.9] mb-8">
                      {lookbookLooks[lookbookTab].desc}
                    </p>

                    <div className="space-y-2.5 mb-10">
                      <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-foreground mb-3">Jewellery Coordinates</p>
                      {lookbookLooks[lookbookTab].jewellery.map((jewel, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="w-1 h-1 bg-[#C9A227] rounded-full shrink-0" />
                          <span>{jewel}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/shop?category=bridal-sets"
                      className="group/btn inline-flex items-center gap-3"
                    >
                      <span className="label-luxury text-foreground group-hover/btn:text-primary transition-colors duration-300">
                        Explore Bridal Looks
                      </span>
                      <span className="w-8 h-px bg-foreground group-hover/btn:w-16 group-hover/btn:bg-primary transition-all duration-500" />
                      <ArrowRight className="w-3.5 h-3.5 text-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all duration-300" />
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CRAFTING JOURNEY
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-pearl relative overflow-hidden border-y border-[rgba(201,162,39,0.1)]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-24"
            >
              <span className="label-luxury text-primary block mb-5">Our Process</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                The Crafting Journey
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            {/* Timeline */}
            <div className="relative">
              {/* Animated connector */}
              <div className="absolute top-10 left-0 right-0 h-px bg-border/30 hidden lg:block overflow-hidden">
                <motion.div
                  className="h-full bg-linear-to-r from-[#C9A227] via-[#E6C280] to-[#C9A227]"
                  initial={{ scaleX: 0, originX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6 relative z-10">
                {[
                  { title: "Inspiration", desc: "A creative vision takes root.", step: "01" },
                  { title: "Sketch", desc: "Designers sketch by hand.", step: "02" },
                  { title: "CAD Design", desc: "Digital micrometric models.", step: "03" },
                  { title: "Handcrafting", desc: "Master artisans mold alloys.", step: "04" },
                  { title: "Stone Setting", desc: "Precision gem placement.", step: "05" },
                  { title: "Quality Check", desc: "Microscopic assessment.", step: "06" },
                  { title: "Packaging", desc: "Velvet-lined signature cases.", step: "07" },
                  { title: "Delivered", desc: "To your doorstep securely.", step: "08" }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center text-center group cursor-default"
                  >
                    {/* Step circle */}
                    <motion.div
                      whileHover={{ scale: 1.1, y: -4 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="w-20 h-20 rounded-full bg-white border border-border/50 flex items-center justify-center relative z-10 mb-5 shadow-sm group-hover:border-[#C9A227] group-hover:shadow-[0_0_25px_rgba(201,162,39,0.2)] transition-all duration-500"
                    >
                      <span className="font-playfair text-lg font-bold text-muted-foreground group-hover:text-[#C9A227] transition-colors duration-400">
                        {item.step}
                      </span>
                    </motion.div>
                    <h4 className="font-playfair text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[120px] mx-auto font-light">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            GIFT FINDER
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-ivory relative">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <span className="label-luxury text-primary block mb-5">Curated Gifting</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                The Gift Finder
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto mb-6" />
              <p className="body-luxury text-muted-foreground mx-auto">
                Find the perfect jewellery for every moment and every budget.
              </p>
            </motion.div>

            {/* Filter bar — full width */}
            <div className="bg-white border border-border/30 p-8 mb-10 shadow-xs max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-foreground mb-5">1. Choose Occasion</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {["Birthday", "Anniversary", "Wedding", "Festival", "Valentine", "Mother's Day", "Engagement"].map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setSelectedOccasion(occ)}
                        className={`px-4 py-2 text-[9px] font-bold tracking-[0.25em] uppercase border transition-all duration-300 cursor-pointer ${
                          selectedOccasion === occ
                            ? "bg-[#1C1C1A] text-white border-[#1C1C1A]"
                            : "bg-transparent text-muted-foreground border-border/60 hover:border-foreground/40"
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="w-px bg-border/30 hidden md:block" />
                <div className="flex-1">
                  <h4 className="text-[9px] uppercase tracking-[0.4em] font-bold text-foreground mb-5">2. Select Budget</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {["₹499–₹999", "₹999–₹1999", "₹1999–₹2999", "₹2999–₹4999", "₹4999+"].map((bud) => (
                      <button
                        key={bud}
                        onClick={() => setSelectedBudget(bud)}
                        className={`px-4 py-2 text-[9px] font-bold tracking-[0.25em] uppercase border transition-all duration-300 cursor-pointer ${
                          selectedBudget === bud
                            ? "bg-[#C9A227] text-[#1C1C1A] border-[#C9A227]"
                            : "bg-transparent text-muted-foreground border-border/60 hover:border-[#C9A227]/60"
                        }`}
                      >
                        {bud}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="max-w-4xl mx-auto">
              <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-muted-foreground mb-8">
                Showing {filteredGifts.length} Perfect Matches
              </p>
              {filteredGifts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredGifts.map((gift) => (
                      <motion.div
                        key={gift.name}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-white border border-border/25 overflow-hidden group luxury-card"
                      >
                        <div className="relative h-64 w-full overflow-hidden">
                          <Image
                            src={gift.image}
                            alt={gift.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                          />
                          <div className="absolute top-4 left-4 z-10">
                            <span className="text-[8px] uppercase tracking-widest font-bold bg-white/90 text-primary px-3 py-1 border border-primary/20">
                              {gift.occasion}
                            </span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h4 className="font-playfair text-base font-bold text-foreground mb-1 truncate">
                            {gift.name}
                          </h4>
                          <p className="text-sm font-semibold text-[#C9A227] mb-5">₹{gift.price.toLocaleString('en-IN')}</p>
                          <Link
                            href="/shop"
                            className="group/btn inline-flex items-center gap-2"
                          >
                            <span className="label-luxury text-foreground group-hover/btn:text-primary transition-colors">Shop Gift</span>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-primary group-hover/btn:translate-x-1 transition-all duration-300" />
                          </Link>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center border border-dashed border-border/40 text-center p-8">
                  <HelpCircle className="w-8 h-8 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-light text-muted-foreground">No matches found. Try another combination.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            CUSTOMER GALLERY
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-champagne relative overflow-hidden">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <span className="label-luxury text-primary block mb-5">Social Spotlight</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                Styled by Our Customers
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {customerGems.map((cust, idx) => (
                <motion.div
                  key={cust.username}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative overflow-hidden luxury-card bg-white"
                >
                  {/* Portrait image */}
                  <div className="relative h-[480px] w-full overflow-hidden">
                    <Image
                      src={cust.image}
                      alt={cust.username}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-1200 ease-out group-hover:scale-[1.06]"
                    />

                    {/* Gold verified badge */}
                    <div className="absolute top-5 left-5 z-20">
                      <div className="flex items-center gap-1.5 bg-[#C9A227] px-3 py-1.5">
                        <Star className="w-2.5 h-2.5 fill-white text-white" />
                        <span className="text-[8px] uppercase tracking-wider font-bold text-white">Verified</span>
                      </div>
                    </div>

                    {/* Hover reveal overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/95 via-black/50 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-600 flex flex-col justify-end p-7 z-10">
                      {/* Stars */}
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: cust.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#C9A227] text-[#C9A227]" />
                        ))}
                      </div>

                      {/* Review */}
                      <p className="text-white/85 text-xs font-light leading-relaxed mb-4 italic">
                        "{cust.review}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-playfair text-sm font-bold text-white">{cust.username}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-[#C9A227]" />
                            <p className="text-[9px] text-white/60">{cust.location}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleLikeClick(idx)}
                          className="flex items-center gap-1.5 text-white hover:text-[#C9A227] transition-colors cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${likedCards[idx] ? 'fill-[#C9A227] text-[#C9A227]' : 'text-white'}`} />
                          <span className="text-xs font-semibold">{likesState[idx]}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom caption */}
                  <div className="p-5 border-t border-border/20">
                    <p className="text-[9px] uppercase tracking-[0.25em] font-bold text-muted-foreground">{cust.product}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            WHY CHOOSE RADHIKA
        ══════════════════════════════════════════════ */}
        <section className="py-32 bg-white border-y border-[rgba(201,162,39,0.1)]">
          <div className="container mx-auto px-6 max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
              className="max-w-2xl mx-auto text-center mb-20"
            >
              <span className="label-luxury text-primary block mb-5">Our Attributes</span>
              <h2 className="font-playfair font-bold text-foreground mb-5" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                Why Choose Radhika
              </h2>
              <div className="w-12 h-px bg-[#C9A227] mx-auto" />
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {whyChooseReasons.map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="group bg-[#FAFAF7] border border-border/30 p-8 text-center hover:border-[#C9A227]/40 hover:shadow-[0_8px_40px_rgba(201,162,39,0.1)] hover:-translate-y-1.5 transition-all duration-500 cursor-default"
                  >
                    <div className="w-14 h-14 rounded-full bg-white border border-border/40 flex items-center justify-center mx-auto mb-5 group-hover:border-[#C9A227]/50 group-hover:shadow-[0_0_20px_rgba(201,162,39,0.15)] transition-all duration-500">
                      <IconComponent className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h4 className="font-playfair text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-muted-foreground leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════ */}
        <section className="py-32 section-champagne relative overflow-hidden">
          {/* Large decorative background text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span className="font-playfair text-[20vw] font-bold text-[#C9A227]/4 leading-none">
              ❝
            </span>
          </div>

          <div className="container mx-auto px-6 max-w-4xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9 }}
            >
              <span className="label-luxury text-primary block mb-5">Client Reviews</span>
              <h2 className="font-playfair font-bold text-foreground mb-16" style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)", lineHeight: 1.05 }}>
                What They Say
              </h2>
            </motion.div>

            {/* Quote card */}
            <div className="relative">
              <AnimatePresence mode="wait" custom={testimonialDir}>
                <motion.div
                  key={activeTestimonial}
                  custom={testimonialDir}
                  initial={{ opacity: 0, x: testimonialDir * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: testimonialDir * -60 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/70 backdrop-blur-sm border border-white/80 p-10 md:p-14 shadow-lg relative"
                >
                  {/* Large quote mark */}
                  <div className="absolute top-6 left-8 font-playfair text-[80px] leading-none text-[#C9A227]/15 pointer-events-none select-none">
                    ❝
                  </div>

                  {/* Stars */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#C9A227] text-[#C9A227]" />
                    ))}
                  </div>

                  <p className="font-playfair text-xl md:text-2xl italic leading-relaxed text-foreground max-w-2xl mx-auto mb-10 relative z-10 font-medium">
                    &ldquo;{testimonials[activeTestimonial].comment}&rdquo;
                  </p>

                  {/* Author */}
                  <div className="flex items-center justify-center gap-4">
                    <div className="relative w-14 h-14 overflow-hidden border-2 border-[#C9A227]/40">
                      <Image
                        src={testimonials[activeTestimonial].avatar}
                        alt={testimonials[activeTestimonial].name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-foreground">{testimonials[activeTestimonial].name}</h4>
                        <span className="text-[8px] uppercase bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 border border-[#C9A227]/20 font-bold tracking-wider">
                          Verified Buyer
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{testimonials[activeTestimonial].location}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Arrow navigation */}
              <div className="flex items-center justify-center gap-4 mt-8">
                <button
                  onClick={() => changeTestimonial(-1)}
                  className="w-10 h-10 border border-border/60 flex items-center justify-center text-muted-foreground hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-300 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setTestimonialDir(idx > activeTestimonial ? 1 : -1); setActiveTestimonial(idx); }}
                      className={`h-0.5 rounded-full transition-all duration-400 cursor-pointer ${activeTestimonial === idx ? 'w-10 bg-[#C9A227]' : 'w-4 bg-border'}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => changeTestimonial(1)}
                  className="w-10 h-10 border border-border/60 flex items-center justify-center text-muted-foreground hover:border-[#C9A227] hover:text-[#C9A227] transition-all duration-300 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>



      </div>
    </>
  );
}
