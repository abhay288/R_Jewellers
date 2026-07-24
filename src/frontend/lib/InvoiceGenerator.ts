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

  // Billing / Shipping Details
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Billed To:', 14, 50);
  
  doc.setFontSize(10);
  doc.setTextColor(100);

  const addrObj = (typeof order.shippingAddress === 'object' && order.shippingAddress)
    ? order.shippingAddress
    : (order.shippingAddressSnapshot || null);
  const userObj = (typeof order.user === 'object' && order.user) ? order.user : null;

  const customerName = (addrObj?.fullName && addrObj.fullName !== 'undefined')
    ? addrObj.fullName
    : ((userObj?.name && userObj.name !== 'undefined') ? userObj.name : 'Valued Customer');

  const customerPhone = (addrObj?.phone && addrObj.phone !== 'undefined')
    ? addrObj.phone
    : ((userObj?.phone && userObj.phone !== 'undefined') ? userObj.phone : '');

  const customerEmail = (addrObj?.email && addrObj.email !== 'undefined')
    ? addrObj.email
    : ((userObj?.email && userObj.email !== 'undefined') ? userObj.email : '');

  let addressLines: string[] = [];
  if (addrObj) {
    const l1 = [addrObj.houseNo, addrObj.street]
      .filter((s: any) => Boolean(s) && String(s).trim() !== 'undefined')
      .join(', ');
    if (l1) addressLines.push(l1);

    const l2 = [addrObj.area, addrObj.city]
      .filter((s: any) => Boolean(s) && String(s).trim() !== 'undefined')
      .join(', ');
    if (l2) addressLines.push(l2);

    const l3 = [addrObj.state, addrObj.postalCode]
      .filter((s: any) => Boolean(s) && String(s).trim() !== 'undefined')
      .join(' - ');
    if (l3) addressLines.push(l3);
  }

  let currentY = 56;
  doc.text(`${customerName}`, 14, currentY);
  currentY += 5;

  addressLines.forEach((line) => {
    doc.text(line, 14, currentY);
    currentY += 5;
  });

  if (customerPhone) {
    doc.text(`Phone: ${customerPhone}`, 14, currentY);
    currentY += 5;
  } else if (customerEmail) {
    doc.text(`Email: ${customerEmail}`, 14, currentY);
    currentY += 5;
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
