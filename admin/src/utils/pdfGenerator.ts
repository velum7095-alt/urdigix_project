import jsPDF from 'jspdf';
import { format } from 'date-fns';

// ============================================
// BRAND COLOR PALETTE & CONFIG
// ============================================
const BRAND_COLORS = {
    primary: [249, 115, 22] as [number, number, number],   // Vibrant Orange (#F97316)
    dark: [15, 23, 42] as [number, number, number],        // Slate-900 (#0F172A)
    slate: [71, 85, 105] as [number, number, number],      // Slate-600 (#475569)
    lightGray: [248, 250, 252] as [number, number, number], // Slate-50 (#F8FAFC)
    borderGray: [226, 232, 240] as [number, number, number], // Slate-200 (#E2E8F0)
    white: [255, 255, 255] as [number, number, number],
};

interface BusinessInfo {
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    gst_number?: string;
}

const DEFAULT_BUSINESS: BusinessInfo = {
    company_name: 'URDIGIX',
    company_address: 'Digital Design & Marketing Studio\nBangalore, Karnataka - 560102\nIndia',
    company_phone: '+91 81429 08550',
    company_email: 'hello@urdigix.com',
    company_website: 'www.urdigix.com',
    gst_number: '29ABCDE1234F1Z5',
};

// ============================================
// VECTOR ICON DRAWING UTILITIES
// ============================================

const drawDesktopIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.rect(x, y, 6, 4.5);
    doc.line(x + 1.5, y + 4.5, x + 1, y + 5.5);
    doc.line(x + 4.5, y + 4.5, x + 5, y + 5.5);
    doc.line(x + 1, y + 5.5, x + 5, y + 5.5);
};

const drawPencilIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.line(x, y + 5, x + 4, y + 1);
    doc.line(x + 1, y + 6, x + 5, y + 2);
    doc.line(x + 4, y + 1, x + 5, y + 2);
    doc.line(x, y + 5, x + 1, y + 6);
};

const drawFileTextIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.rect(x + 0.5, y, 5, 6);
    doc.line(x + 1.5, y + 1.8, x + 4.5, y + 1.8);
    doc.line(x + 1.5, y + 3.3, x + 4.5, y + 3.3);
    doc.line(x + 1.5, y + 4.8, x + 3.5, y + 4.8);
};

const drawRocketIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.line(x + 3, y, x + 1, y + 4.5);
    doc.line(x + 3, y, x + 5, y + 4.5);
    doc.line(x + 1, y + 4.5, x + 5, y + 4.5);
    doc.line(x + 3, y + 4.5, x + 3, y + 6);
};

const drawGearIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.circle(x + 3, y + 3, 2);
    doc.circle(x + 3, y + 3, 0.8);
    doc.line(x + 3, y + 0.5, x + 3, y + 5.5);
    doc.line(x + 0.5, y + 3, x + 5.5, y + 3);
};

const drawDefaultServiceIcon = (doc: jsPDF, x: number, y: number) => {
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.4);
    doc.circle(x + 3, y + 3, 2.5);
    doc.circle(x + 3, y + 3, 0.8);
};

const drawServiceIcon = (doc: jsPDF, serviceName: string, x: number, y: number) => {
    const name = serviceName.toLowerCase();
    if (name.includes('web') || name.includes('landing') || name.includes('seo')) {
        drawDesktopIcon(doc, x, y);
    } else if (name.includes('logo') || name.includes('banner') || name.includes('design')) {
        drawPencilIcon(doc, x, y);
    } else if (name.includes('content') || name.includes('copy') || name.includes('writing') || name.includes('social')) {
        drawFileTextIcon(doc, x, y);
    } else if (name.includes('ads') || name.includes('marketing') || name.includes('campaign') || name.includes('launch')) {
        drawRocketIcon(doc, x, y);
    } else if (name.includes('pack') || name.includes('setup') || name.includes('maintenance')) {
        drawGearIcon(doc, x, y);
    } else {
        drawDefaultServiceIcon(doc, x, y);
    }
};

// ============================================
// QR CODE GENERATOR (VECTOR PATHS)
// ============================================

const drawQRCode = (doc: jsPDF, x: number, y: number, size: number) => {
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(0.5);
    doc.rect(x, y, size, size);
    
    // Top-Left marker
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 1.5, y + 1.5, 4.5, 4.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 2.5, y + 2.5, 2.5, 2.5, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 3.25, y + 3.25, 1, 1, 'F');

    // Top-Right marker
    doc.setFillColor(15, 23, 42);
    doc.rect(x + size - 6, y + 1.5, 4.5, 4.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + size - 5, y + 2.5, 2.5, 2.5, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(x + size - 4.25, y + 3.25, 1, 1, 'F');

    // Bottom-Left marker
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 1.5, y + size - 6, 4.5, 4.5, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(x + 2.5, y + size - 5, 2.5, 2.5, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(x + 3.25, y + size - 4.25, 1, 1, 'F');

    doc.setFillColor(15, 23, 42);
    const steps = Math.floor(size / 2);
    for (let i = 0; i < steps; i++) {
        for (let j = 0; j < steps; j++) {
            if ((i < 3 && j < 3) || (i > steps - 4 && j < 3) || (i < 3 && j > steps - 4)) continue;
            const hashCode = (i * 13 + j * 37) % 7;
            if (hashCode === 1 || hashCode === 3 || hashCode === 5) {
                doc.rect(x + 2 + i * 1.8, y + 2 + j * 1.8, 1.4, 1.4, 'F');
            }
        }
    }
};

// ============================================
// MAIN GENERATION ENGINES
// ============================================

const drawHeaderAndFooter = (
    doc: jsPDF,
    type: 'INVOICE' | 'QUOTATION' | 'CONTRACT',
    number: string,
    dateStr: string,
    businessInfo: BusinessInfo,
    pageNumber: string
) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const yPos = margin;

    // 1. BRAND HEADER LOGO
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + 10, yPos + 10, 10, 'F');
    doc.setDrawColor(...BRAND_COLORS.white);
    doc.setLineWidth(1.2);
    doc.line(margin + 5, yPos + 12, margin + 10, yPos + 6);
    doc.line(margin + 10, yPos + 6, margin + 15, yPos + 12);
    doc.line(margin + 7, yPos + 15, margin + 10, yPos + 11);
    doc.line(margin + 10, yPos + 11, margin + 13, yPos + 15);

    // Brand Name & Taglines
    doc.setFontSize(26);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.dark);
    doc.text(businessInfo.company_name, margin + 24, yPos + 8);

    doc.setFontSize(9);
    doc.text('WE DESIGN. ', margin + 24, yPos + 14);
    const weDesignWidth = doc.getTextWidth('WE DESIGN. ');
    doc.setTextColor(...BRAND_COLORS.primary);
    doc.text('YOU GROW.', margin + 24 + weDesignWidth, yPos + 14);

    doc.setFontSize(8.5);
    doc.setTextColor(...BRAND_COLORS.primary);
    doc.text('Designs That Attract. Content That Converts.', margin + 24, yPos + 19);

    // Right Side Document Title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.dark);
    doc.text(type, pageWidth - margin, yPos + 6, { align: 'right' });

    // Number & Date Box Table
    const boxWidth = 55;
    const boxHeight = 16;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = yPos + 10;
    doc.setFillColor(...BRAND_COLORS.lightGray);
    doc.setDrawColor(...BRAND_COLORS.borderGray);
    doc.setLineWidth(0.3);
    doc.rect(boxX, boxY, boxWidth, boxHeight, 'FD');
    doc.line(boxX, boxY + boxHeight / 2, boxX + boxWidth, boxY + boxHeight / 2);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.slate);
    doc.text(`${type} NO:`, boxX + 3, boxY + 5);
    doc.setTextColor(...BRAND_COLORS.primary);
    doc.text(number, boxX + boxWidth - 3, boxY + 5, { align: 'right' });

    doc.setTextColor(...BRAND_COLORS.slate);
    doc.text('DATE:', boxX + 3, boxY + 12);
    doc.setTextColor(...BRAND_COLORS.dark);
    doc.text(format(new Date(dateStr), 'dd MMMM yyyy'), boxX + boxWidth - 3, boxY + 12, { align: 'right' });

    // Header divider line with decorative dots
    doc.setDrawColor(...BRAND_COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos + 28, pageWidth - margin, yPos + 28);
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(pageWidth / 2 - 2, yPos + 28, 1, 'F');
    doc.circle(pageWidth / 2 + 2, yPos + 28, 1, 'F');

    // 2. BOTTOM RIBBON
    const ribbonH = 10;
    const ribbonY = pageHeight - ribbonH;
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.rect(0, ribbonY, pageWidth, ribbonH, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_COLORS.white);
    doc.text('www.urdigix.com', pageWidth - margin, ribbonY + 6.5, { align: 'right' });
    doc.text('Socials: @urdigix | WhatsApp: +91 81429 08550', margin, ribbonY + 6.5);

    // Decorative page numbering badge
    if (pageNumber) {
        doc.setFillColor(...BRAND_COLORS.primary);
        doc.rect(pageWidth - margin - 15, ribbonY - 7, 8, 7, 'F');
        doc.setFontSize(8.5);
        doc.setTextColor(...BRAND_COLORS.white);
        doc.text(pageNumber, pageWidth - margin - 11, ribbonY - 2, { align: 'center' });
    }
};

// ============================================
// 1. INVOICE AND QUOTATION GENERATOR
// ============================================

const drawPremiumInvoiceOrQuotation = (
    type: 'INVOICE' | 'QUOTATION',
    data: any,
    businessInfo: BusinessInfo = DEFAULT_BUSINESS
): void => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    const addText = (
        text: string,
        x: number,
        y: number,
        options: {
            fontSize?: number;
            fontStyle?: 'normal' | 'bold' | 'italic';
            color?: [number, number, number];
            align?: 'left' | 'center' | 'right';
            maxWidth?: number;
        } = {}
    ) => {
        const {
            fontSize = 9,
            fontStyle = 'normal',
            color = BRAND_COLORS.dark,
            align = 'left',
            maxWidth,
        } = options;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);

        if (maxWidth) {
            doc.text(text, x, y, { align, maxWidth });
        } else {
            doc.text(text, x, y, { align });
        }
    };

    const docNo = type === 'INVOICE' ? data.invoice_number : data.quotation_number;
    const docDate = type === 'INVOICE' ? data.invoice_date : data.quotation_date;

    // Header & Footer Layout
    drawHeaderAndFooter(doc, type, docNo, docDate, businessInfo, '01');

    yPos += 28;

    // Bill To & From Grid Layout
    const colW = contentWidth / 3;
    
    // Left: Client Box
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + 3, yPos + 3, 3, 'F');
    doc.setFillColor(...BRAND_COLORS.white);
    doc.circle(margin + 3, yPos + 2.5, 1.2, 'F');
    doc.setLineWidth(0.5);
    doc.setDrawColor(...BRAND_COLORS.white);
    doc.line(margin + 1.5, yPos + 5, margin + 4.5, yPos + 5);

    addText('BILL TO:', margin + 8, yPos + 4, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText(data.client_name, margin, yPos + 10, { fontSize: 11, fontStyle: 'bold' });
    
    let clientY = yPos + 15;
    if (data.client_business_name) {
        addText(data.client_business_name, margin, clientY, { fontSize: 8.5, color: BRAND_COLORS.slate });
        clientY += 4.5;
    }
    if (data.client_address) {
        addText(data.client_address, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: colW - 5 });
        clientY += 9;
    }
    if (data.client_phone) {
        addText(`Phone: ${data.client_phone}`, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate });
        clientY += 4.5;
    }
    if (data.client_email) {
        addText(`Email: ${data.client_email}`, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: colW - 5 });
    }

    // Middle: Service Provider Box
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + colW + 3, yPos + 3, 3, 'F');
    doc.setFillColor(...BRAND_COLORS.white);
    doc.rect(margin + colW + 1.8, yPos + 1.6, 2.4, 3, 'F');

    addText('FROM:', margin + colW + 8, yPos + 4, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText(businessInfo.company_name, margin + colW, yPos + 10, { fontSize: 11, fontStyle: 'bold' });

    let businessLines = businessInfo.company_address.split('\n');
    let fromY = yPos + 15;
    businessLines.forEach(line => {
        addText(line, margin + colW, fromY, { fontSize: 8, color: BRAND_COLORS.slate });
        fromY += 4.5;
    });
    addText(`Phone: ${businessInfo.company_phone}`, margin + colW, fromY, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`Email: ${businessInfo.company_email}`, margin + colW, fromY + 4.5, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`Web: ${businessInfo.company_website}`, margin + colW, fromY + 9, { fontSize: 8, color: BRAND_COLORS.slate });

    // Right: Portfolio Callout Box
    const calloutX = margin + colW * 2;
    const calloutW = colW;
    const calloutH = 34;
    doc.setFillColor(...BRAND_COLORS.lightGray);
    doc.setDrawColor(...BRAND_COLORS.borderGray);
    doc.setLineWidth(0.3);
    doc.rect(calloutX, yPos, calloutW, calloutH, 'FD');

    addText('POWERFUL', calloutX + 4, yPos + 6, { fontSize: 11, fontStyle: 'bold', color: BRAND_COLORS.dark });
    addText('DESIGNS.', calloutX + 4, yPos + 11, { fontSize: 11, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText('STRONG BRANDS.', calloutX + 4, yPos + 17, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.dark });
    addText('REAL GROWTH.', calloutX + 4, yPos + 22, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.primary });

    // Embedded QR Code
    drawQRCode(doc, calloutX + calloutW - 19, yPos + 4, 15);
    addText('SCAN TO VISIT', calloutX + calloutW - 19, yPos + 22, { fontSize: 5, fontStyle: 'bold', color: BRAND_COLORS.slate });
    addText('OUR PORTFOLIO', calloutX + calloutW - 19, yPos + 24, { fontSize: 5, fontStyle: 'bold', color: BRAND_COLORS.slate });

    yPos += 45;

    // Deliverables Items Table
    const colWidths = {
        num: 12,
        desc: contentWidth - 12 - 16 - 28 - 28, // 96
        qty: 16,
        rate: 28,
        amount: 28,
    };

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.rect(margin, yPos, contentWidth, 8, 'F');

    let tableX = margin;
    addText('#', tableX + 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white });
    tableX += colWidths.num;

    addText('DESCRIPTION', tableX + 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white });
    tableX += colWidths.desc;

    addText('QTY', tableX + colWidths.qty / 2, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'center' });
    tableX += colWidths.qty;

    addText('RATE (INR)', tableX + colWidths.rate - 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'right' });
    tableX += colWidths.rate;

    addText('AMOUNT (INR)', pageWidth - margin - 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'right' });

    yPos += 8;

    data.items?.forEach((item: any, index: number) => {
        if (yPos > pageHeight - 90) {
            doc.addPage();
            yPos = margin + 10;
        }

        const rowHeight = item.description ? 15 : 10;
        doc.setFillColor(...BRAND_COLORS.lightGray);
        doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

        tableX = margin;
        
        addText(String(index + 1), tableX + 3, yPos + 6, { fontSize: 8.5, color: BRAND_COLORS.slate });
        tableX += colWidths.num;

        drawServiceIcon(doc, item.service_name, tableX + 3, yPos + 3.5);
        addText(item.service_name, tableX + 11, yPos + 5.5, { fontSize: 8.5, fontStyle: 'bold' });
        if (item.description) {
            addText(item.description, tableX + 11, yPos + 10, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: colWidths.desc - 13 });
        }
        tableX += colWidths.desc;

        addText(String(item.quantity), tableX + colWidths.qty / 2, yPos + 6, { fontSize: 8.5, align: 'center' });
        tableX += colWidths.qty;

        addText(`₹${item.rate.toLocaleString('en-IN')}`, tableX + colWidths.rate - 3, yPos + 6, { fontSize: 8.5, align: 'right' });
        tableX += colWidths.rate;

        addText(`₹${item.amount.toLocaleString('en-IN')}`, pageWidth - margin - 3, yPos + 6, { fontSize: 9, fontStyle: 'bold', align: 'right' });

        yPos += rowHeight;

        doc.setDrawColor(...BRAND_COLORS.borderGray);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    });

    yPos += 5;

    // Totals Grid
    const summaryX = pageWidth - margin - 75;
    const summaryW = 75;

    addText('SUBTOTAL', summaryX + 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.slate });
    addText(`₹${data.subtotal.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', align: 'right' });
    yPos += 6;

    if (data.discount_amount > 0) {
        addText('DISCOUNT', summaryX + 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', color: [22, 163, 74] });
        addText(`- ₹${data.discount_amount.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', color: [22, 163, 74], align: 'right' });
        yPos += 6;
    }

    if (data.gst_amount > 0) {
        addText(`TAX (${data.gst_percentage}% GST)`, summaryX + 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.slate });
        addText(`₹${data.gst_amount.toLocaleString('en-IN')}`, pageWidth - margin - 2, yPos + 4, { fontSize: 8.5, fontStyle: 'bold', align: 'right' });
        yPos += 6;
    }

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.rect(summaryX, yPos + 1, summaryW, 7, 'F');
    addText('TOTAL', summaryX + 3, yPos + 6, { fontSize: 9.5, fontStyle: 'bold', color: BRAND_COLORS.white });
    addText(`₹ ${data.grand_total.toLocaleString('en-IN')}`, pageWidth - margin - 3, yPos + 6, { fontSize: 10.5, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'right' });
    
    let paymentBlockY = yPos + 10;
    if (type === 'INVOICE') {
        if (data.amount_paid > 0) {
            addText('AMOUNT PAID', summaryX + 2, paymentBlockY + 4, { fontSize: 8.5, fontStyle: 'bold', color: [22, 163, 74] });
            addText(`₹${data.amount_paid.toLocaleString('en-IN')}`, pageWidth - margin - 2, paymentBlockY + 4, { fontSize: 8.5, fontStyle: 'bold', color: [22, 163, 74], align: 'right' });
            paymentBlockY += 6;
        }
        addText('BALANCE DUE', summaryX + 2, paymentBlockY + 4, { fontSize: 9.5, fontStyle: 'bold', color: BRAND_COLORS.primary });
        addText(`₹${data.balance_due.toLocaleString('en-IN')}`, pageWidth - margin - 2, paymentBlockY + 4, { fontSize: 9.5, fontStyle: 'bold', color: BRAND_COLORS.primary, align: 'right' });
    }

    let bottomY = Math.max(yPos + 22, paymentBlockY + 12);
    if (bottomY > pageHeight - 75) {
        doc.addPage();
        bottomY = margin + 10;
    }

    // Notes, Terms & Bank payment coordinates
    const leftColW = 85;
    addText('NOTES:', margin, bottomY, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText(data.notes || 'Thank you for choosing URDIGIX.\nWe appreciate your business and look forward to working with you again.', margin, bottomY + 5, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: leftColW });
    
    addText('TERMS & CONDITIONS:', margin, bottomY + 16, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.primary });
    const terms = data.payment_terms || '• Payment is due within 7 days of invoice date.\n• Late payments may incur additional charges.\n• Work will be delivered after payment confirmation.\n• No refund once work has been initiated.';
    addText(terms, margin, bottomY + 21, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: leftColW });

    const payX = margin + leftColW + 6;
    const payW = 52;
    doc.setFillColor(...BRAND_COLORS.lightGray);
    doc.setDrawColor(...BRAND_COLORS.borderGray);
    doc.rect(payX, bottomY, payW, 36, 'FD');
    
    addText('PAYMENT DETAILS:', payX + 3, bottomY + 5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText('Bank Name', payX + 3, bottomY + 10, { fontSize: 7, color: BRAND_COLORS.slate });
    addText(': HDFC Bank', payX + 16, bottomY + 10, { fontSize: 7, fontStyle: 'bold' });
    
    addText('Account Name', payX + 3, bottomY + 14, { fontSize: 7, color: BRAND_COLORS.slate });
    addText(': URDIGIX', payX + 16, bottomY + 14, { fontSize: 7, fontStyle: 'bold' });
    
    addText('Account No.', payX + 3, bottomY + 18, { fontSize: 7, color: BRAND_COLORS.slate });
    addText(': 502000XXXX1234', payX + 16, bottomY + 18, { fontSize: 7, fontStyle: 'bold' });
    
    addText('IFSC Code', payX + 3, bottomY + 22, { fontSize: 7, color: BRAND_COLORS.slate });
    addText(': HDFC0001234', payX + 16, bottomY + 22, { fontSize: 7, fontStyle: 'bold' });
    
    addText('UPI ID', payX + 3, bottomY + 26, { fontSize: 7, color: BRAND_COLORS.slate });
    addText(': urdigix@upi', payX + 16, bottomY + 26, { fontSize: 7, fontStyle: 'bold', color: BRAND_COLORS.primary });

    const scanPayX = payX + payW + 4;
    addText('SCAN TO PAY', scanPayX, bottomY + 5, { fontSize: 7, fontStyle: 'bold', color: BRAND_COLORS.primary });
    drawQRCode(doc, scanPayX, bottomY + 8, 20);

    const sigX = pageWidth - margin - 35;
    doc.setDrawColor(...BRAND_COLORS.dark);
    doc.setLineWidth(0.5);
    doc.line(sigX - 5, bottomY + 23, sigX + 30, bottomY + 23);
    
    doc.setLineWidth(0.4);
    doc.line(sigX + 2, bottomY + 18, sigX + 8, bottomY + 14);
    doc.line(sigX + 8, bottomY + 14, sigX + 12, bottomY + 22);
    doc.line(sigX + 12, bottomY + 22, sigX + 18, bottomY + 12);
    doc.line(sigX + 18, bottomY + 12, sigX + 22, bottomY + 20);
    doc.line(sigX + 22, bottomY + 20, sigX + 28, bottomY + 16);

    addText('Authorized Signatory', sigX - 5, bottomY + 27, { fontSize: 7.5, fontStyle: 'bold', align: 'center', maxWidth: 45 });
    addText('URDIGIX', sigX - 5, bottomY + 31, { fontSize: 7.5, fontStyle: 'bold', color: BRAND_COLORS.primary, align: 'center', maxWidth: 45 });

    const sealsY = pageHeight - 30;
    doc.setDrawColor(...BRAND_COLORS.borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, sealsY - 3, pageWidth - margin, sealsY - 3);

    const sealW = contentWidth / 4;
    
    // Strategic designs seals
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + 5, sealsY + 3, 2.5, 'F');
    addText('STRATEGIC DESIGNS', margin + 10, sealsY + 2, { fontSize: 7, fontStyle: 'bold' });
    addText('That Get Noticed', margin + 10, sealsY + 5, { fontSize: 6.5, color: BRAND_COLORS.slate });

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + sealW + 5, sealsY + 3, 2.5, 'F');
    addText('CONTENT THAT', margin + sealW + 10, sealsY + 2, { fontSize: 7, fontStyle: 'bold' });
    addText('CONVERTS', margin + sealW + 10, sealsY + 5, { fontSize: 6.5, color: BRAND_COLORS.primary });

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + sealW * 2 + 5, sealsY + 3, 2.5, 'F');
    addText('STRONG BRANDS', margin + sealW * 2 + 10, sealsY + 2, { fontSize: 7, fontStyle: 'bold' });
    addText('That Build Trust', margin + sealW * 2 + 10, sealsY + 5, { fontSize: 6.5, color: BRAND_COLORS.slate });

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + sealW * 3 + 5, sealsY + 3, 2.5, 'F');
    addText('DIGITAL GROWTH', margin + sealW * 3 + 10, sealsY + 2, { fontSize: 7, fontStyle: 'bold' });
    addText('That Lasts', margin + sealW * 3 + 10, sealsY + 5, { fontSize: 6.5, color: BRAND_COLORS.slate });

    addText('THANK YOU FOR YOUR BUSINESS!', pageWidth / 2, sealsY - 6, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.primary, align: 'center' });

    doc.save(`${docNo}.pdf`);
};

// ============================================
// 2. PREMIUM TWO-PAGE CONTRACT GENERATOR
// ============================================

export const generateContractPDF = (
    contract: any,
    businessInfo: BusinessInfo = DEFAULT_BUSINESS
): void => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    const addText = (
        text: string,
        x: number,
        y: number,
        options: {
            fontSize?: number;
            fontStyle?: 'normal' | 'bold' | 'italic';
            color?: [number, number, number];
            align?: 'left' | 'center' | 'right';
            maxWidth?: number;
        } = {}
    ) => {
        const {
            fontSize = 9,
            fontStyle = 'normal',
            color = BRAND_COLORS.dark,
            align = 'left',
            maxWidth,
        } = options;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);

        if (maxWidth) {
            doc.text(text, x, y, { align, maxWidth });
        } else {
            doc.text(text, x, y, { align });
        }
    };

    const drawSectionHeader = (number: string, title: string, x: number, y: number) => {
        doc.setFillColor(...BRAND_COLORS.primary);
        doc.circle(x + 3, y + 2.5, 3, 'F');
        addText(number, x + 3, y + 3.5, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'center' });
        addText(title, x + 8, y + 3.5, { fontSize: 10, fontStyle: 'bold', color: BRAND_COLORS.primary });
    };

    // ==================== PAGE 1 ====================
    let yPos = margin;
    drawHeaderAndFooter(doc, 'CONTRACT', contract.contract_number, contract.contract_date, businessInfo, '01');
    yPos += 28;

    // CLIENT & SERVICE PROVIDER SECTION
    const colW = contentWidth / 3;

    // Left: Client Box
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + 3, yPos + 3, 3, 'F');
    doc.setFillColor(...BRAND_COLORS.white);
    doc.circle(margin + 3, yPos + 2.5, 1.2, 'F');
    doc.setLineWidth(0.5);
    doc.setDrawColor(...BRAND_COLORS.white);
    doc.line(margin + 1.5, yPos + 5, margin + 4.5, yPos + 5);

    addText('CLIENT:', margin + 8, yPos + 4, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText(contract.client_name, margin, yPos + 10, { fontSize: 11, fontStyle: 'bold' });
    
    let clientY = yPos + 15;
    if (contract.client_business_name) {
        addText(contract.client_business_name, margin, clientY, { fontSize: 8.5, color: BRAND_COLORS.slate });
        clientY += 4.5;
    }
    if (contract.client_address) {
        addText(contract.client_address, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: colW - 5 });
        clientY += 9;
    }
    if (contract.client_email) {
        addText(`Email: ${contract.client_email}`, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: colW - 5 });
        clientY += 4.5;
    }
    if (contract.client_phone) {
        addText(`Phone: ${contract.client_phone}`, margin, clientY, { fontSize: 8, color: BRAND_COLORS.slate });
    }

    // Middle: Service Provider Box
    doc.setFillColor(...BRAND_COLORS.primary);
    doc.circle(margin + colW + 3, yPos + 3, 3, 'F');
    doc.setFillColor(...BRAND_COLORS.white);
    doc.rect(margin + colW + 1.8, yPos + 1.6, 2.4, 3, 'F');

    addText('SERVICE PROVIDER:', margin + colW + 8, yPos + 4, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText(businessInfo.company_name, margin + colW, yPos + 10, { fontSize: 11, fontStyle: 'bold' });

    let businessLines = businessInfo.company_address.split('\n');
    let fromY = yPos + 15;
    businessLines.forEach(line => {
        addText(line, margin + colW, fromY, { fontSize: 8, color: BRAND_COLORS.slate });
        fromY += 4.5;
    });
    addText(`Email: ${businessInfo.company_email}`, margin + colW, fromY, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`Website: ${businessInfo.company_website}`, margin + colW, fromY + 4.5, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`GSTIN: ${businessInfo.gst_number || '29ABCDE1234F1Z5'}`, margin + colW, fromY + 9, { fontSize: 8, color: BRAND_COLORS.slate });

    // Right: Marketing Callout Box
    const calloutX = margin + colW * 2;
    const calloutW = colW;
    const calloutH = 34;
    doc.setFillColor(...BRAND_COLORS.lightGray);
    doc.setDrawColor(...BRAND_COLORS.borderGray);
    doc.setLineWidth(0.3);
    doc.rect(calloutX, yPos, calloutW, calloutH, 'FD');

    addText('POWERFUL', calloutX + 4, yPos + 6, { fontSize: 11, fontStyle: 'bold', color: BRAND_COLORS.dark });
    addText('DESIGNS.', calloutX + 4, yPos + 11, { fontSize: 11, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText('STRONG BRANDS.', calloutX + 4, yPos + 17, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.dark });
    addText('REAL GROWTH.', calloutX + 4, yPos + 22, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.primary });

    yPos += 45;

    // 1. PROJECT SCOPE
    drawSectionHeader('1', 'PROJECT SCOPE', margin, yPos);
    yPos += 7;
    addText(contract.project_scope || 'The Service Provider agrees to provide the design and marketing services as per the approved proposal and scope of work mutually agreed upon by both parties.', margin, yPos, { fontSize: 8.5, color: BRAND_COLORS.slate, maxWidth: contentWidth });
    
    yPos += 14;

    // DELIVERABLES / TABLE
    const colWidths = {
        num: 12,
        service: 50,
        desc: contentWidth - 12 - 50 - 32, // 86
        delivery: 32,
    };

    doc.setFillColor(...BRAND_COLORS.primary);
    doc.rect(margin, yPos, contentWidth, 8, 'F');

    let tableX = margin;
    addText('#', tableX + 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white });
    tableX += colWidths.num;

    addText('SERVICE / DELIVERABLES', tableX + 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white });
    tableX += colWidths.service;

    addText('DESCRIPTION', tableX + 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white });
    tableX += colWidths.desc;

    addText('DELIVERY TIME', pageWidth - margin - 3, yPos + 5.5, { fontSize: 8, fontStyle: 'bold', color: BRAND_COLORS.white, align: 'right' });

    yPos += 8;

    contract.items?.forEach((item: any, index: number) => {
        if (yPos > pageHeight - 90) {
            doc.addPage();
            yPos = margin + 10;
        }

        const rowHeight = item.description ? 15 : 10;
        doc.setFillColor(...BRAND_COLORS.lightGray);
        doc.rect(margin, yPos, contentWidth, rowHeight, 'F');

        tableX = margin;
        
        addText(String(index + 1), tableX + 3, yPos + 6, { fontSize: 8.5, color: BRAND_COLORS.slate });
        tableX += colWidths.num;

        drawServiceIcon(doc, item.service_name, tableX + 3, yPos + 3.5);
        addText(item.service_name, tableX + 11, yPos + 5.5, { fontSize: 8.5, fontStyle: 'bold' });
        tableX += colWidths.service;

        if (item.description) {
            addText(item.description, tableX + 3, yPos + 5.5, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: colWidths.desc - 6 });
        }
        tableX += colWidths.desc;

        addText(item.delivery_time || '3-5 Days', pageWidth - margin - 3, yPos + 6, { fontSize: 8.5, fontStyle: 'bold', align: 'right', color: BRAND_COLORS.primary });

        yPos += rowHeight;

        doc.setDrawColor(...BRAND_COLORS.borderGray);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
    });

    yPos += 10;

    // Split bottom page 1 layout: 2 & 3 vs 4 & 5
    const halfW = contentWidth / 2 - 5;
    
    // Column Left: Payment terms & Timeline
    let colY1 = yPos;
    drawSectionHeader('2', 'PAYMENT TERMS', margin, colY1);
    addText(contract.payment_terms || '• 50% advance payment is required to initiate the project.\n• 50% balance payment upon completion before final delivery.\n• All payments are non-refundable once work has been initiated.\n• Payments can be made via bank transfer / UPI as shared by the provider.', margin, colY1 + 7, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: halfW });
    
    colY1 += 26;
    drawSectionHeader('3', 'PROJECT TIMELINE', margin, colY1);
    addText(contract.project_timeline || 'The project timeline will be confirmed after finalizing the requirements and receiving the advance payment.\nDelays in providing content or feedback may affect delivery timelines.', margin, colY1 + 7, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: halfW });

    // Column Right: Confidentiality & Ownership
    let colY2 = yPos;
    drawSectionHeader('4', 'CONFIDENTIALITY', margin + halfW + 10, colY2);
    addText(contract.confidentiality_terms || 'Both parties agree to keep all confidential information shared during the project strictly private and not disclose it to any third party.', margin + halfW + 10, colY2 + 7, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: halfW });

    colY2 += 20;
    drawSectionHeader('5', 'OWNERSHIP', margin + halfW + 10, colY2);
    addText(contract.ownership_terms || 'Upon full payment, the client will own the final deliverables. The provider retains the right to showcase the work in the portfolio.', margin + halfW + 10, colY2 + 7, { fontSize: 7.5, color: BRAND_COLORS.slate, maxWidth: halfW });

    // Page 1 Let's Grow section
    const sealsY = pageHeight - 30;
    addText("LET'S GROW TOGETHER!", margin, sealsY - 3, { fontSize: 10, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText("We don't just design, we build brands\nthat grow your business.", margin, sealsY + 2, { fontSize: 7.5, color: BRAND_COLORS.slate });

    addText("WHATSAPP US\n+91 81429 08550", margin + 55, sealsY + 2, { fontSize: 7.5, fontStyle: 'bold' });
    addText("VISIT OUR PORTFOLIO\nwww.urdigix.com", margin + 110, sealsY + 2, { fontSize: 7.5, fontStyle: 'bold' });
    addText("FOLLOW US\n@urdigix", margin + 160, sealsY + 2, { fontSize: 7.5, fontStyle: 'bold' });

    // ==================== PAGE 2 ====================
    doc.addPage();
    yPos = margin;
    
    drawHeaderAndFooter(doc, 'CONTRACT', contract.contract_number, contract.contract_date, businessInfo, '02');
    yPos += 35;

    // 6. REVISIONS & FEEDBACK
    drawSectionHeader('6', 'REVISIONS & FEEDBACK', margin, yPos);
    yPos += 7;
    addText(contract.revisions_terms || '• Each deliverable includes up to 2 rounds of revisions.\n• Additional revisions beyond the included rounds will be chargeable.\n• Feedback should be provided within the agreed timeline to avoid delays.', margin, yPos, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: contentWidth });

    yPos += 20;

    // 7. CANCELLATION POLICY
    drawSectionHeader('7', 'CANCELLATION POLICY', margin, yPos);
    yPos += 7;
    addText(contract.cancellation_policy || '• If the client cancels the project before completion, the advance payment is non-refundable.\n• If cancellation is made after work has started, charges will be calculated based on the work completed.', margin, yPos, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: contentWidth });

    yPos += 20;

    // 8. LIMITATION OF LIABILITY
    drawSectionHeader('8', 'LIMITATION OF LIABILITY', margin, yPos);
    yPos += 7;
    addText(contract.liability_terms || 'The Service Provider shall not be liable for any indirect, incidental, or consequential damages arising from the use of the deliverables or any delay in delivery due to circumstances beyond control.', margin, yPos, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: contentWidth });

    yPos += 18;

    // 9. GOVERNING LAW
    drawSectionHeader('9', 'GOVERNING LAW', margin, yPos);
    yPos += 7;
    addText(contract.governing_law || 'This contract shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Bangalore, Karnataka.', margin, yPos, { fontSize: 8, color: BRAND_COLORS.slate, maxWidth: contentWidth });

    yPos += 18;

    // 10. AGREEMENT
    drawSectionHeader('10', 'AGREEMENT', margin, yPos);
    yPos += 7;
    addText('By signing below, both parties agree to the terms and conditions outlined in this contract and confirm their acceptance.', margin, yPos, { fontSize: 8.5, fontStyle: 'bold', color: BRAND_COLORS.dark });

    yPos += 12;

    // Signee Signature Columns Layout
    const sigColW = contentWidth / 2;

    // FOR CLIENT
    addText('FOR CLIENT', margin, yPos, { fontSize: 9, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText('Name', margin, yPos + 6, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`: ${contract.client_signee_name || '__________________________'}`, margin + 18, yPos + 6, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Designation', margin, yPos + 12, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`: ${contract.client_signee_designation || '__________________________'}`, margin + 18, yPos + 12, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Company', margin, yPos + 18, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`: ${contract.client_signee_company || '__________________________'}`, margin + 18, yPos + 18, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Signature', margin, yPos + 24, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(': __________________________', margin + 18, yPos + 24, { fontSize: 8 });

    addText('Date', margin, yPos + 30, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(': __________________________', margin + 18, yPos + 30, { fontSize: 8 });

    // FOR URDIGIX
    addText('FOR URDIGIX', margin + sigColW, yPos, { fontSize: 9, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText('Name', margin + sigColW, yPos + 6, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(': Aarav Mehta', margin + sigColW + 18, yPos + 6, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Designation', margin + sigColW, yPos + 12, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(': Founder & CEO', margin + sigColW + 18, yPos + 12, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Company', margin + sigColW, yPos + 18, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(': URDIGIX', margin + sigColW + 18, yPos + 18, { fontSize: 8, fontStyle: 'bold' });
    
    addText('Signature', margin + sigColW, yPos + 24, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(':', margin + sigColW + 18, yPos + 24, { fontSize: 8 });
    
    // Draw vector signature path for URDIGIX
    doc.setDrawColor(...BRAND_COLORS.dark);
    doc.setLineWidth(0.4);
    doc.line(margin + sigColW + 22, yPos + 23, margin + sigColW + 28, yPos + 19);
    doc.line(margin + sigColW + 28, yPos + 19, margin + sigColW + 32, yPos + 26);
    doc.line(margin + sigColW + 32, yPos + 26, margin + sigColW + 37, yPos + 16);
    doc.line(margin + sigColW + 37, yPos + 16, margin + sigColW + 41, yPos + 24);
    doc.line(margin + sigColW + 41, yPos + 24, margin + sigColW + 46, yPos + 20);

    addText('Date', margin + sigColW, yPos + 30, { fontSize: 8, color: BRAND_COLORS.slate });
    addText(`: ${format(new Date(contract.contract_date), 'dd MMM yyyy')}`, margin + sigColW + 18, yPos + 30, { fontSize: 8, fontStyle: 'bold' });

    // Page 2 Bottom Thank you Callouts & Address
    addText("THANK YOU!", margin, sealsY - 3, { fontSize: 10, fontStyle: 'bold', color: BRAND_COLORS.primary });
    addText("We value your trust in URDIGIX.\nLet's create something amazing together!", margin, sealsY + 2, { fontSize: 7.5, color: BRAND_COLORS.slate });

    drawQRCode(doc, margin + 70, sealsY - 4, 18);
    addText('SCAN TO VISIT\nOUR PORTFOLIO', margin + 91, sealsY + 3, { fontSize: 6.5, fontStyle: 'bold', color: BRAND_COLORS.slate });

    // Bangalore Address Block
    addText("+91 81429 08550", pageWidth - margin, sealsY - 2, { fontSize: 7.5, fontStyle: 'bold', align: 'right' });
    addText("hello@urdigix.com", pageWidth - margin, sealsY + 2, { fontSize: 7.5, fontStyle: 'bold', align: 'right' });
    addText("www.urdigix.com", pageWidth - margin, sealsY + 6, { fontSize: 7.5, fontStyle: 'bold', align: 'right' });
    addText("Bangalore, Karnataka - 560102, India", pageWidth - margin, sealsY + 10, { fontSize: 7.5, color: BRAND_COLORS.slate, align: 'right' });

    // Save triggers download
    doc.save(`${contract.contract_number}.pdf`);
};

export const generateQuotationPDF = (
    quotation: any,
    businessInfo: BusinessInfo = DEFAULT_BUSINESS
): void => {
    drawPremiumInvoiceOrQuotation('QUOTATION', quotation, businessInfo);
};

export const generateInvoicePDF = (
    invoice: any,
    businessInfo: BusinessInfo = DEFAULT_BUSINESS
): void => {
    drawPremiumInvoiceOrQuotation('INVOICE', invoice, businessInfo);
};
