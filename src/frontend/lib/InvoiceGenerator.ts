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

  const formatMoney = (amount: number) => {
    const num = Number(amount || 0);
    return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Table Data
  const tableColumn = ["Item", "Quantity", "Unit Price", "Discount", "Total"];
  const tableRows: any[][] = [];

  (order.products || []).forEach((item: any) => {
    const itemData = [
      item.name || '',
      (item.quantity || 1).toString(),
      formatMoney(item.price),
      formatMoney(item.discount || 0),
      formatMoney((item.finalPrice || item.price) * (item.quantity || 1)),
    ];
    tableRows.push(itemData);
  });

  // Render Table
  autoTable(doc, {
    startY: 85,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [140, 118, 92], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 65 },
      1: { halign: 'center', cellWidth: 16 },
      2: { halign: 'right', cellWidth: 33 },
      3: { halign: 'right', cellWidth: 33 },
      4: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 85;
  const pageW = doc.internal.pageSize.getWidth();
  const subtotal = order.totalAmount + (order.discount || 0) - (order.deliveryCharges || 0);

  // Totals Section
  doc.setFontSize(9);
  doc.setTextColor(40);
  doc.text('Subtotal:', pageW - 80, finalY + 10);
  doc.text(formatMoney(subtotal), pageW - 18, finalY + 10, { align: 'right' });
  
  doc.text('Discount:', pageW - 80, finalY + 17);
  doc.text(`-${formatMoney(order.discount || 0)}`, pageW - 18, finalY + 17, { align: 'right' });
  
  doc.text('Delivery Charges:', pageW - 80, finalY + 24);
  doc.text(formatMoney(order.deliveryCharges || 0), pageW - 18, finalY + 24, { align: 'right' });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text('Grand Total:', pageW - 80, finalY + 34);
  doc.text(formatMoney(order.totalAmount || 0), pageW - 18, finalY + 34, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150);
  doc.text('Thank you for shopping with Radhika Jewellers.', 105, 280, { align: 'center' });
  doc.text('This is a computer generated invoice and does not require a signature.', 105, 285, { align: 'center' });

  // Save the PDF
  doc.save(`Invoice_${order.orderId}.pdf`);
};
