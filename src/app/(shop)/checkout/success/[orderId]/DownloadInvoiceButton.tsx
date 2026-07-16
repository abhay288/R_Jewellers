"use client";

import { generateInvoicePDF } from '@/frontend/lib/InvoiceGenerator';
import { Download } from 'lucide-react';

interface DownloadInvoiceButtonProps {
  order: any;
}

export default function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  const handleDownload = () => {
    generateInvoicePDF(order);
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full sm:w-auto py-4 px-8 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity text-sm uppercase tracking-wider flex items-center justify-center"
    >
      <Download className="w-4 h-4 mr-2" />
      Download Invoice
    </button>
  );
}
