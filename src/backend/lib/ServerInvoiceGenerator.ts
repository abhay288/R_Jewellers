/**
 * Server-side invoice PDF generator using jsPDF.
 * Returns a Buffer that can be attached to emails.
 * NOTE: jsPDF works in Node.js when imported with { jsPDF } from 'jspdf'
 */

// @ts-ignore — jsPDF has full Node.js support, types are fine
import { jsPDF } from 'jspdf';
// @ts-ignore
import autoTable from 'jspdf-autotable';

const BRAND = 'Radhika Jewellers';
const BRAND_GOLD = [140, 118, 92] as [number, number, number];
const DARK = [30, 30, 30] as [number, number, number];
const GRAY = [110, 110, 110] as [number, number, number];
const LIGHT_GRAY = [240, 238, 234] as [number, number, number];

export function generateServerInvoicePDF(order: any): Buffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();

  // ─── Gold header band ───────────────────────────────────────────
  doc.setFillColor(...BRAND_GOLD);
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(BRAND, 14, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Luxury Jewellery', 14, 20);
  doc.text('Email: radhikajewellers699@gmail.com', 14, 26);

  // TAX INVOICE label (right side of header)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('TAX INVOICE', pageW - 14, 14, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.text(`Invoice No: INV-${order.orderId}`, pageW - 14, 20, { align: 'right' });
  doc.text(`Date: ${dateStr}`, pageW - 14, 26, { align: 'right' });

  // ─── Billing section ────────────────────────────────────────────
  let y = 42;
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(14, y, 85, 50, 2, 2, 'F');
  doc.roundedRect(pageW / 2 + 5, y, 85, 50, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('BILL TO', 20, y + 8);

  const addr = order.shippingAddress;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  if (addr) {
    doc.text(addr.fullName || '', 20, y + 15);
    doc.text(`${addr.houseNo || ''}, ${addr.street || ''}`, 20, y + 21);
    doc.text(`${addr.area || ''}, ${addr.city || ''}`, 20, y + 27);
    doc.text(`${addr.state || ''} - ${addr.postalCode || ''}`, 20, y + 33);
    doc.text(`Phone: ${addr.phone || ''}`, 20, y + 39);
  } else {
    doc.text(order.user?.name || '', 20, y + 15);
    doc.text(order.user?.email || '', 20, y + 21);
  }

  // Order info box (right)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DARK);
  doc.text('ORDER INFO', pageW / 2 + 11, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text(`Order ID:  ${order.orderId}`, pageW / 2 + 11, y + 15);
  doc.text(`Payment:   ${order.paymentMethod}`, pageW / 2 + 11, y + 21);
  doc.text(`Status:    ${order.status}`, pageW / 2 + 11, y + 27);
  doc.text(`Items:     ${order.products?.length || 0}`, pageW / 2 + 11, y + 33);

  // ─── Items Table ────────────────────────────────────────────────
  y += 58;

  const tableRows = (order.products || []).map((item: any) => [
    item.name || '',
    item.quantity?.toString() || '1',
    `₹${item.price?.toFixed ? item.price.toFixed(2) : item.price}`,
    item.discount ? `₹${item.discount.toFixed ? item.discount.toFixed(2) : item.discount}` : '₹0.00',
    `₹${item.finalPrice?.toFixed ? (item.finalPrice * (item.quantity || 1)).toFixed(2) : (item.price * (item.quantity || 1))}`,
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Item', 'Qty', 'Unit Price', 'Discount', 'Total']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: BRAND_GOLD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: DARK },
    alternateRowStyles: { fillColor: LIGHT_GRAY },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'right', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY: number = (doc as any).lastAutoTable?.finalY ?? y + 20;

  // ─── Totals ──────────────────────────────────────────────────────
  const subtotal = (order.totalAmount + (order.discount || 0) - (order.deliveryCharges || 0));
  const totalsY = finalY + 8;

  // box
  doc.setFillColor(...LIGHT_GRAY);
  doc.roundedRect(pageW - 14 - 70, totalsY - 4, 70, 40, 2, 2, 'F');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...GRAY);
  doc.text('Subtotal:', pageW - 14 - 60, totalsY + 4);
  doc.text(`₹${subtotal.toFixed(2)}`, pageW - 14, totalsY + 4, { align: 'right' });

  doc.text('Discount:', pageW - 14 - 60, totalsY + 11);
  doc.text(`-₹${(order.discount || 0).toFixed(2)}`, pageW - 14, totalsY + 11, { align: 'right' });

  doc.text('Delivery:', pageW - 14 - 60, totalsY + 18);
  doc.text(`₹${(order.deliveryCharges || 0).toFixed(2)}`, pageW - 14, totalsY + 18, { align: 'right' });

  // Grand total row
  doc.setFillColor(...BRAND_GOLD);
  doc.roundedRect(pageW - 14 - 70, totalsY + 24, 70, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('Grand Total:', pageW - 14 - 60, totalsY + 31);
  doc.text(`₹${(order.totalAmount || 0).toFixed(2)}`, pageW - 14, totalsY + 31, { align: 'right' });

  // ─── Footer ──────────────────────────────────────────────────────
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BRAND_GOLD);
  doc.rect(0, pageH - 18, pageW, 18, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Thank you for shopping with Radhika Jewellers.', pageW / 2, pageH - 11, { align: 'center' });
  doc.text('This is a computer-generated invoice and does not require a physical signature.', pageW / 2, pageH - 6, { align: 'center' });

  // Return as Node.js Buffer
  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
