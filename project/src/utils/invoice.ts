import { jsPDF } from 'jspdf';

interface InvoiceItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  items: InvoiceItem[];
  totalAmount: number;
}

export const generateInvoicePDF = (data: InvoiceData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(20);
  doc.text('FACTURE', pageWidth / 2, 20, { align: 'center' });
  
  // Company Info
  doc.setFontSize(12);
  doc.text('FruitExpress', 20, 40);
  doc.text('123 Rue des Fruits', 20, 45);
  doc.text('75001 Paris, France', 20, 50);
  
  // Invoice Details
  doc.text(`Facture N°: ${data.invoiceNumber}`, pageWidth - 60, 40);
  doc.text(`Date: ${data.date}`, pageWidth - 60, 45);
  
  // Customer Info
  doc.text('Facturé à:', 20, 70);
  doc.text(data.customerName, 20, 75);
  doc.text(data.customerAddress, 20, 80);
  
  // Items Table
  const tableTop = 100;
  const tableHeaders = ['Produit', 'Quantité', 'Prix unitaire', 'Total'];
  const columnWidths = [80, 30, 40, 40];
  
  // Headers
  let xPos = 20;
  doc.setFillColor(240, 240, 240);
  doc.rect(xPos, tableTop - 5, pageWidth - 40, 10, 'F');
  tableHeaders.forEach((header, i) => {
    doc.text(header, xPos, tableTop);
    xPos += columnWidths[i];
  });
  
  // Items
  let yPos = tableTop + 15;
  data.items.forEach(item => {
    xPos = 20;
    doc.text(item.product, xPos, yPos);
    doc.text(item.quantity.toString(), xPos + columnWidths[0], yPos);
    doc.text(item.unitPrice.toFixed(2) + ' €', xPos + columnWidths[0] + columnWidths[1], yPos);
    doc.text(item.total.toFixed(2) + ' €', xPos + columnWidths[0] + columnWidths[1] + columnWidths[2], yPos);
    yPos += 10;
  });
  
  // Total
  doc.setFillColor(240, 240, 240);
  doc.rect(pageWidth - 80, yPos + 10, 60, 10, 'F');
  doc.text('Total:', pageWidth - 75, yPos + 16);
  doc.text(data.totalAmount.toFixed(2) + ' €', pageWidth - 30, yPos + 16);
  
  // Footer
  const footerText = 'Merci de votre confiance !';
  doc.text(footerText, pageWidth / 2, doc.internal.pageSize.height - 20, { align: 'center' });
  
  return doc.output('datauristring');
};