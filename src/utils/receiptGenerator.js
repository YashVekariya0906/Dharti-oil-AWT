import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to load image from URL as Base64/Image
const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = url;
  });
};

export const generateReceipt = async (orderData, user, logoUrl = null, download = true) => {
  try {
    const doc = new jsPDF();
    
    // 1. Draw Watermark Transparent Logo
    if (logoUrl) {
      try {
        const logo = await loadImage(logoUrl);
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const logoSize = 120; // Size of the large circular logo
        const x = (pageWidth - logoSize) / 2;
        const y = (pageHeight - logoSize) / 2;
        
        // Circular watermark logo from their branding
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.1 })); // Make it very subtle as a watermark
        doc.addImage(logo, 'PNG', x, y, logoSize, logoSize);
        doc.restoreGraphicsState();
      } catch (err) {
        console.warn("Could not load logo for watermark:", err);
      }
    }
    
    // Header DHARTI INDUSTRIES
    doc.setFontSize(24);
    doc.setTextColor(138, 172, 224);
    doc.setFont('helvetica', 'bold');
    const title = 'DHARTI INDUSTRIES';
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (doc.internal.pageSize.getWidth() - titleWidth) / 2, 20);

    // Address
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const address = 'Dharti Oil Mill, 150, 2nd Ring Rd, PARDI, Rajkot, Gujarat 360022';
    const addressWidth = doc.getTextWidth(address);
    doc.text(address, (doc.internal.pageSize.getWidth() - addressWidth) / 2, 28);

    // Detailed Order Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Order Details:', 14, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order ID: ${orderData.order_id}`, 14, 52);
    const dateStr = new Date(orderData.created_at || new Date()).toLocaleDateString();
    const timeStr = new Date(orderData.created_at || new Date()).toLocaleTimeString();
    doc.text(`Date: ${dateStr} ${timeStr}`, 14, 59);

    // Customer Info
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Details:', 120, 45);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${user?.username || ''}`, 120, 52);
    doc.text(`Phone: ${orderData.contact_number || user?.moblie_no || ''}`, 120, 59);
    doc.text(`Address: ${orderData.shipping_address}`, 120, 66, { maxWidth: 80 });

    // Items Table
    const tableColumn = ["Sr No", "Product Name", "Quantity", "Price", "Total"];
    const tableRows = [];

    let items = orderData.items || [];
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        items = [];
      }
    }

    items.forEach((item, index) => {
      const itemData = [
        index + 1,
        item.product_name,
        item.quantity,
        `Rs ${Number(item.product_price).toFixed(2)}`,
        `Rs ${(Number(item.product_price) * Number(item.quantity)).toFixed(2)}`
      ];
      tableRows.push(itemData);
    });

    const cartTotal = items.reduce((total, item) => total + (Number(item.product_price) * Number(item.quantity)), 0);
    
    // Summing calculations for taxes and delivery
    tableRows.push(["", "", "", "Subtotal", `Rs ${cartTotal.toFixed(2)}`]);
    if (orderData.cgst) tableRows.push(["", "", "", "CGST (2.5%)", `Rs ${Number(orderData.cgst).toFixed(2)}`]);
    if (orderData.sgst) tableRows.push(["", "", "", "SGST (2.5%)", `Rs ${Number(orderData.sgst).toFixed(2)}`]);
    if (orderData.delivery_charge) tableRows.push(["", "", "", "Delivery Charge", `Rs ${Number(orderData.delivery_charge).toFixed(2)}`]);
    
    tableRows.push(["", "", "", "Total Amount", `Rs ${Number(orderData.total_amount).toFixed(2)}`]);

    // TABLE TRANSPARENCY: Use transparent backgrounds so watermark is visible
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 85,
      theme: 'grid',
      styles: { 
        fontSize: 10, 
        halign: 'center',
        fillColor: false, // Make body rows transparent
        textColor: [0, 0, 0]
      },
      headStyles: { 
        fillColor: [138, 172, 224], 
        textColor: [255, 255, 255] 
      },
      alternateRowStyles: { 
        fillColor: false // Disable alternating backgrounds
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 70, halign: 'left' },
        2: { cellWidth: 25 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Footer section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'bold');
    const footerContact = 'Contact: +917096701212 | Email: dhartiamrut@gmail.com';
    const footerContactWidth = doc.getTextWidth(footerContact);
    doc.text(footerContact, (doc.internal.pageSize.getWidth() - footerContactWidth) / 2, doc.internal.pageSize.getHeight() - 25);

    const footerGst = 'GSTIN: 24ESVPK3884F1Z5';
    const footerGstWidth = doc.getTextWidth(footerGst);
    doc.text(footerGst, (doc.internal.pageSize.getWidth() - footerGstWidth) / 2, doc.internal.pageSize.getHeight() - 18);

    const fileName = `Receipt_${orderData.order_id}.pdf`;

    if (download) {
      doc.save(fileName);
    } else {
      return doc;
    }
  } catch (error) {
    console.error("Error generating receipt:", error);
    alert("Sorry, could not generate the receipt right now.");
  }
};
