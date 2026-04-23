import jsPDF from 'jspdf';

// Function to convert number to words (Indian numbering system)
const numberToWords = (num) => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'And ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Only';
};

const convertDecimalToWords = (total) => {
  const [rupees, paise] = Number(total).toFixed(2).split('.');
  let res = numberToWords(parseInt(rupees));
  if (parseInt(paise) > 0) {
    if (res.includes('Only')) res = res.replace('Only', '').trim();
    res += ' And ' + numberToWords(parseInt(paise)).replace('Only', '').trim() + ' Paise Only';
  }
  return res;
};

/**
 * invoiceData object expected exactly like this:
 * {
 *   type: "TAX INVOICE" | "Debit Memo",
 *   invoiceNo: "GT/687",
 *   date: "31/03/2026",
 *   customerName: "YASH JAYESHBHAI VEKARIYA",
 *   placeOfSupply: "24-Gujarat",
 *   items: [
 *     { productName: "GROUND NUT OIL", hsn: "1508", qty: 15.000, rate: 3047.61, gstPercent: 5, amount: 45714.29 }
 *   ],
 *   subTotal: 45714.29,
 *   sgst: 1142.86,
 *   cgst: 1142.86,
 *   roundOff: -0.01,
 *   grandTotal: 48000.00
 * }
 */
export const generateTaxInvoice = (invoiceData, settings = null, download = true) => {
  const cfg = settings || {
    companyName: "DHARTI INDUSTRIES",
    addressLine1: "S.NO. 85P2, NEAR SIDDHESHWAR SOCIETY, OPP. UNIQUE SCHOOL, OPP. KALPVAN,",
    addressLine2: "KORAT CHOWK, GONDAL NATIONAL HIGHWAY, PARDI, RAJKOT - 360024",
    gstin: "24ESVPK3884F1Z5",
    bankName: "BANK OF BARODA",
    accountNo: "38720200000268",
    ifscCode: "BARB0PARDIR",
    terms1: "1. Our risk and responsibility ceases as soon as the goods leave our premises.",
    terms2: "2. Interest @18% p.a. will be charged if payment is not made within due date.",
    terms3: "3. Goods once sold will not be taken back.",
    terms4: "4. \"Subject to 'RAJKOT' Jurisdiction only. E.&.O.E\""
  };
  // A4 size: 210 x 297 mm
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;
  
  // Set default font to helvetica
  doc.setFont('helvetica');

  // Utility to draw lines relative to margins
  const line = (x1, y1, x2, y2) => doc.line(margin + x1, y1, margin + x2, y2);

  // START DRAWING MAIN OUTER BOX
  const boxTop = 15;
  const boxBottom = 260; // Leave space at bottom
  doc.setLineWidth(0.4);
  doc.rect(margin, boxTop, contentWidth, boxBottom - boxTop); // Main outer border
  doc.setLineWidth(0.2); // Inner lines

  // 1. HEADER SECTION
  let y = boxTop + 8;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const title = cfg.companyName || "DHARTI INDUSTRIES";
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  
  y += 5;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(cfg.addressLine1 || "", pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(cfg.addressLine2 || "", pageWidth / 2, y, { align: 'center' });

  // 2. DOCUMENT TYPE ROW
  y += 2;
  line(0, y, contentWidth, y);
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(invoiceData.type === 'Debit Memo' ? 'Debit Memo/Purchase' : 'TAX INVOICE', margin + 2, y);
  doc.setFontSize(12);
  doc.text(invoiceData.type || "TAX INVOICE", pageWidth / 2, y, { align: 'center' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Original", margin + contentWidth - 2, y, { align: 'right' });

  // 3. CUSTOMER INFO & INVOICE DETAILS
  y += 2;
  line(0, y, contentWidth, y);
  const infoStartY = y;
  
  // Vertical split line for Info box
  const infoSplitX = contentWidth * 0.55; 
  
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("M/s. :   " + (invoiceData.customerName || '').toUpperCase(), margin + 2, y);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("Invoice No.", margin + infoSplitX + 2, y);
  doc.text(":", margin + infoSplitX + 22, y);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.invoiceNo || 'N/A', margin + infoSplitX + 25, y);

  doc.setFont('helvetica', 'normal');
  doc.text("Date", margin + infoSplitX + 2, y + 5);
  doc.text(":", margin + infoSplitX + 22, y + 5);
  doc.text(invoiceData.date || 'N/A', margin + infoSplitX + 25, y + 5);
  
  y += 18;
  doc.setFont('helvetica', 'bold');
  doc.text("Place of Supply :", margin + 2, y);
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.placeOfSupply || "24-Gujarat", margin + 30, y);
  
  const endInfoY = y + 5;
  line(0, endInfoY, contentWidth, endInfoY);
  // Draw the vertical line partitioning info
  line(infoSplitX, infoStartY, infoSplitX, endInfoY);

  // 4. ITEM TABLE HEADER
  y = endInfoY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  
  // Table Columns Setup
  const cols = [
    { name: "SrNo", w: 10, align: 'center' },
    { name: "Product Name", w: 75, align: 'left' },
    { name: "HSN/SAC", w: 20, align: 'center' },
    { name: "Qty", w: 20, align: 'right' },
    { name: "Rate", w: 22, align: 'right' },
    { name: "GST %", w: 15, align: 'center' },
    { name: "Amount", w: contentWidth - 162, align: 'right' }
  ];

  let currentX = 0;
  cols.forEach(col => {
    let px = margin + currentX;
    if (col.align === 'center') doc.text(col.name, px + col.w / 2, y, { align: 'center' });
    else if (col.align === 'right') doc.text(col.name, px + col.w - 2, y, { align: 'right' });
    else doc.text(col.name, px + 2, y);
    currentX += col.w;
  });

  const tableHeaderY = endInfoY + 8;
  line(0, tableHeaderY, contentWidth, tableHeaderY);

  // 5. ITEM ROWS
  y = tableHeaderY + 5;
  doc.setFont('helvetica', 'normal');
  (invoiceData.items || []).forEach((item, index) => {
    currentX = 0;
    
    // SrNo
    doc.text((index + 1).toString(), margin + currentX + cols[0].w / 2, y, { align: 'center' });
    currentX += cols[0].w;
    // Product Name
    doc.text(item.productName || '', margin + currentX + 2, y);
    currentX += cols[1].w;
    // HSN/SAC
    doc.text(item.hsn || '', margin + currentX + cols[2].w / 2, y, { align: 'center' });
    currentX += cols[2].w;
    // Qty
    doc.text(Number(item.qty).toFixed(3), margin + currentX + cols[3].w - 2, y, { align: 'right' });
    currentX += cols[3].w;
    // Rate
    doc.text(Number(item.rate).toFixed(2), margin + currentX + cols[4].w - 2, y, { align: 'right' });
    currentX += cols[4].w;
    // GST %
    doc.text(Number(item.gstPercent).toFixed(2), margin + currentX + cols[5].w / 2, y, { align: 'center' });
    currentX += cols[5].w;
    // Amount
    doc.text(Number(item.amount).toFixed(2), margin + currentX + cols[6].w - 2, y, { align: 'right' });
    
    y += 6;
  });

  // 6. Draw Table vertical borders
  // Define end of items block
  const tableBottomY = 175; // Fixed height for items block
  currentX = 0;
  cols.forEach(col => {
    currentX += col.w;
    if (currentX < contentWidth) {
      line(currentX, endInfoY, currentX, tableBottomY);
    }
  });
  
  line(0, tableBottomY, contentWidth, tableBottomY);

  // 7. SUBTOTAL AND GSTIN ROW
  y = tableBottomY + 5;
  doc.setFont('helvetica', 'bold');
  doc.text("GSTIN No.:   " + (cfg.gstin || "24ESVPK3884F1Z5"), margin + 2, y);
  
  // Total of columns logic
  const itemsAreaSplitX = contentWidth - cols[6].w - cols[5].w - cols[4].w;
  doc.text("Sub Total", margin + itemsAreaSplitX + 2, y);
  doc.text(Number(invoiceData.subTotal).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });
  
  const subTotalRowY = tableBottomY + 7;
  line(0, subTotalRowY, contentWidth, subTotalRowY);
  
  // Vertical line separating GSTIN from Subtotal
  line(itemsAreaSplitX, tableBottomY, itemsAreaSplitX, subTotalRowY);

  // 8. TAX CALCULATIONS AND BANK DETAILS
  const taxSectionBottomY = 225;
  line(itemsAreaSplitX, subTotalRowY, itemsAreaSplitX, taxSectionBottomY); // Vertical split
  
  // LEFT: Bank Details
  y = subTotalRowY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("Bank Name", margin + 2, y); doc.text(`:   ${cfg.bankName || 'BANK OF BARODA'}`, margin + 25, y);
  doc.text("Bank A/c. No.", margin + 2, y + 5); doc.text(`:   ${cfg.accountNo || '38720200000268'}`, margin + 25, y + 5);
  doc.text("RTGS/IFSC Code", margin + 2, y + 10); doc.text(`:   ${cfg.ifscCode || 'BARB0PARDIR'}`, margin + 25, y + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text("Note :", margin + itemsAreaSplitX - 30, y);
  
  // LEFT: Text Amounts
  line(0, subTotalRowY + 15, itemsAreaSplitX, subTotalRowY + 15);
  y = subTotalRowY + 20;
  const totalGst = invoiceData.sgst + invoiceData.cgst;
  const gstInWords = convertDecimalToWords(totalGst);
  doc.text("Total GST : ", margin + 2, y);
  doc.setFont('helvetica', 'italic');
  doc.text(gstInWords, margin + 20, y);

  line(0, y + 3, itemsAreaSplitX, y + 3);
  y = y + 8;
  const billInWords = convertDecimalToWords(invoiceData.grandTotal);
  doc.setFont('helvetica', 'bold');
  doc.text("Bill Amount : ", margin + 2, y);
  doc.setFont('helvetica', 'italic');
  doc.text(billInWords, margin + 22, y);

  // RIGHT: Calculations
  y = subTotalRowY + 20;
  doc.setFont('helvetica', 'bold');
  doc.text("Taxable Amount", margin + itemsAreaSplitX + 2, y);
  doc.text(Number(invoiceData.subTotal).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });
  
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.text("Central Tax", margin + itemsAreaSplitX + 2, y);
  const cgstPercentText = ((invoiceData.items && invoiceData.items.length > 0) ? invoiceData.items[0].gstPercent / 2 : 2.5).toFixed(2) + "%";
  doc.text(cgstPercentText, margin + itemsAreaSplitX + 32, y);
  doc.text(Number(invoiceData.cgst).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });

  y += 5;
  doc.text("State/UT Tax", margin + itemsAreaSplitX + 2, y);
  doc.text(cgstPercentText, margin + itemsAreaSplitX + 32, y);
  doc.text(Number(invoiceData.sgst).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });

  y += 5;
  doc.text("Round Off", margin + itemsAreaSplitX + 2, y);
  doc.text(Number(invoiceData.roundOff).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });

  line(itemsAreaSplitX, y + 2, contentWidth, y + 2);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text("Grand Total", margin + itemsAreaSplitX + 2, y);
  doc.text(Number(invoiceData.grandTotal).toFixed(2), margin + contentWidth - 2, y, { align: 'right' });
  
  line(0, taxSectionBottomY, contentWidth, taxSectionBottomY);

  // 9. TERMS AND CONDITIONS AND SIGNATURE
  y = taxSectionBottomY + 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text("Terms & Condition :", margin + 2, y);
  
  doc.setFont('helvetica', 'italic');
  doc.text(cfg.terms1 || "", margin + 2, y + 5);
  doc.text(cfg.terms2 || "", margin + 2, y + 10);
  doc.text(`${cfg.terms3 || ""}   ${cfg.terms4 || ""}`, margin + 2, y + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text("For, " + (cfg.companyName || "DHARTI INDUSTRIES"), margin + contentWidth - 2, y, { align: 'right' });
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.text("(Authorised Signatory)", margin + contentWidth - 6, y + 18, { align: 'right' });

  // SAVE OR RETURN
  const fileName = `${invoiceData.invoiceNo.replace(/\//g, '_')}_Invoice.pdf`;
  if (download) {
    doc.save(fileName);
  } else {
    return doc;
  }
};
