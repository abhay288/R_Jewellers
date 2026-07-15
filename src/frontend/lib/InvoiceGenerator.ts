import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (order: any, brandName: string = 'Radhika Jewellers') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(40);
  doc.text(brandName, 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Premium Luxury eCommerce', 14, 30);
  doc.text('GSTIN: 22AAAAA0000A1Z5', 14, 35);
  
  // Invoice Details
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text('TAX INVOICE', 140, 22);
  
  doc.setFontSize(10);
  doc.text(`Invoice No: INV-${order.orderId}`, 140, 30);
  doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 35);
  doc.text(`Payment: ${order.paymentMethod}`, 140, 40);

  // Billing / Shipping
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Billed To:', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  if (order.shippingAddress) {
    doc.text(`${order.shippingAddress.fullName}`, 14, 57);
    doc.text(`${order.shippingAddress.houseNo}, ${order.shippingAddress.street}`, 14, 62);
    doc.text(`${order.shippingAddress.area}, ${order.shippingAddress.city}`, 14, 67);
    doc.text(`${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`, 14, 72);
    doc.text(`Phone: ${order.shippingAddress.phone}`, 14, 77);
  } else if (order.user) {
    doc.text(`${order.user.name}`, 14, 57);
    doc.text(`${order.user.email}`, 14, 62);
  }

  // Table Data
  const tableColumn = ["Item", "Quantity", "Unit Price", "Discount", "Total"];
  const tableRows: any[][] = [];

  order.products.forEach((item: any) => {
    const itemData = [
      item.name,
      item.quantity.toString(),
      `INR ${item.price}`,
      `INR ${item.discount}`,
      `INR ${item.finalPrice * item.quantity}`,
    ];
    tableRows.push(itemData);
  });

  // Render Table
  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [40, 40, 40] },
    margin: { top: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY || 85;

  // Totals Section
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text('Subtotal:', 140, finalY + 10);
  doc.text(`INR ${order.totalAmount + order.discount - order.deliveryCharges}`, 170, finalY + 10);
  
  doc.text('Discount:', 140, finalY + 17);
  doc.text(`INR -${order.discount}`, 170, finalY + 17);
  
  doc.text('Delivery Charges:', 140, finalY + 24);
  doc.text(`INR ${order.deliveryCharges}`, 170, finalY + 24);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('Grand Total:', 140, finalY + 34);
  doc.text(`INR ${order.totalAmount}`, 170, finalY + 34);

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text('Thank you for shopping with Radhika Jewellers.', 105, 280, { align: 'center' });
  doc.text('This is a computer generated invoice and does not require a signature.', 105, 285, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${order.orderId}.pdf`);
};
