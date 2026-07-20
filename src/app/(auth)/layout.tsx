import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Left Panel: Content */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative">
        <Link href="/" className="absolute top-8 left-8 md:left-12 flex items-center text-sm font-medium tracking-wider uppercase text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Store
        </Link>
        {children}
      </div>

      {/* Right Panel: Image/Branding */}
      <div className="hidden md:flex w-1/2 bg-secondary/50 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-gold opacity-10" />
        
        {/* Abstract shapes mimicking the hero section */}
        <div className="absolute top-1/4 -left-32 w-100 h-100 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-125 h-125 bg-secondary/40 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 text-center px-12">
          <Link href="/" className="inline-block">
            <Image 
              src="/assets/logo.png" 
              alt="Radhika Jewellers" 
              width={360} 
              height={140} 
              className="object-contain drop-shadow-lg mx-auto mix-blend-multiply"
            />
          </Link>
          <p className="mt-8 text-lg font-light text-muted-foreground italic font-playfair max-w-sm mx-auto">
            "Adorn yourself in brilliance that lasts forever."
          </p>
        </div>
      </div>
    </div>
  );
}
