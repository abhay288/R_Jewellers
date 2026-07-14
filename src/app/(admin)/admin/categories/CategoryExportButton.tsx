"use client";

import { Download } from "lucide-react";
import { CategoryColumn } from "./columns";

export function CategoryExportButton({ data }: { data: CategoryColumn[] }) {
  const handleExport = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV Headers
    const headers = ["ID", "Name", "Slug", "Level", "Status", "Views", "Created At"];
    
    // Format rows
    const rows = data.map(cat => [
      cat.id,
      `"${cat.name.replace(/"/g, '""')}"`, // escape quotes
      cat.slug,
      cat.level.toString(),
      cat.isActive ? "Active" : "Disabled",
      cat.viewCount.toString(),
      cat.createdAt
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `categories_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center justify-center bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-border"
    >
      <Download className="w-4 h-4 mr-2" />
      Export CSV
    </button>
  );
}
