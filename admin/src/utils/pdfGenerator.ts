import jsPDF from 'jspdf';
import { Quotation } from '@/types/billing';
import { format } from 'date-fns';

// URDIGIX brand colors
const COLORS = {
    primary: [249, 115, 22] as [number, number, number], // Orange-500
    dark: [31, 41, 55] as [number, number, number], // Gray-800
    gray: [107, 114, 128] as [number, number, number], // Gray-500
    lightGray: [243, 244, 246] as [number, number, number], // Gray-100
    green: [22, 163, 74] as [number, number, number], // Green-600
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
    company_address: 'India',
    company_phone: '+91 78930 40375',
    company_email: 'hello@urdigix.com',
    company_website: 'www.urdigix.com',
    gst_number: '',
};

export const generateQuotationPDF = (
    quotation: Quotation,
    businessInfo: BusinessInfo = DEFAULT_BUSINESS
): void => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper function to add text
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
            fontSize = 10,
            fontStyle = 'normal',
            color = COLORS.dark,
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

    // ==================== HEADER ====================
    // Company Logo/Name
    addText(businessInfo.company_name, margin, yPos, {
        fontSize: 28,
        fontStyle: 'bold',
        color: COLORS.primary,
    });
    yPos += 8;

    // Company tagline
    addText('Digital Marketing Agency', margin, yPos, {
        fontSize: 10,
        color: COLORS.gray,
    });
    yPos += 5;

    // Company contact
    addText(`${businessInfo.company_email} | ${businessInfo.company_phone}`, margin, yPos, {
        fontSize: 9,
        color: COLORS.gray,
    });
    yPos += 5;

    addText(businessInfo.company_address, margin, yPos, {
        fontSize: 9,
        color: COLORS.gray,
    });

    // QUOTATION title - right side
    addText('QUOTATION', pageWidth - margin, margin, {
        fontSize: 22,
        fontStyle: 'bold',
        color: COLORS.dark,
        align: 'right',
    });

    // Quotation number and dates - right side
    addText(quotation.quotation_number, pageWidth - margin, margin + 10, {
        fontSize: 11,
        fontStyle: 'bold',
        color: COLORS.primary,
        align: 'right',
    });

    addText(`Date: ${format(new Date(quotation.quotation_date), 'dd MMM yyyy')}`, pageWidth - margin, margin + 17, {
        fontSize: 9,
        color: COLORS.gray,
        align: 'right',
    });

    addText(`Valid Until: ${format(new Date(quotation.valid_until), 'dd MMM yyyy')}`, pageWidth - margin, margin + 23, {
        fontSize: 9,
        color: COLORS.gray,
        align: 'right',
    });

    // Header line
    yPos += 12;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // ==================== CLIENT DETAILS ====================
    addText('BILL TO', margin, yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: COLORS.gray,
    });
    yPos += 6;

    addText(quotation.client_name, margin, yPos, {
        fontSize: 12,
        fontStyle: 'bold',
        color: COLORS.dark,
    });
    yPos += 6;

    if (quotation.client_business_name) {
        addText(quotation.client_business_name, margin, yPos, {
            fontSize: 10,
            color: COLORS.dark,
        });
        yPos += 5;
    }

    if (quotation.client_email) {
        addText(quotation.client_email, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
        });
        yPos += 5;
    }

    if (quotation.client_phone) {
        addText(quotation.client_phone, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
        });
        yPos += 5;
    }

    if (quotation.client_address) {
        addText(quotation.client_address, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
            maxWidth: 80,
        });
        yPos += 5;
    }

    yPos += 10;

    // ==================== ITEMS TABLE ====================
    const tableStartY = yPos;
    const colWidths = {
        num: 10,
        service: contentWidth * 0.4,
        qty: 20,
        rate: 35,
        amount: contentWidth - (10 + contentWidth * 0.4 + 20 + 35),
    };

    // Table header
    doc.setFillColor(...COLORS.lightGray);
    doc.rect(margin, yPos - 4, contentWidth, 10, 'F');

    let xPos = margin + 3;
    addText('#', xPos, yPos + 2, { fontSize: 9, fontStyle: 'bold' });
    xPos += colWidths.num;

    addText('Service', xPos, yPos + 2, { fontSize: 9, fontStyle: 'bold' });
    xPos += colWidths.service;

    addText('Qty', xPos + colWidths.qty / 2 - 5, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'center' });
    xPos += colWidths.qty;

    addText('Rate', xPos + colWidths.rate - 5, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'right' });
    xPos += colWidths.rate;

    addText('Amount', pageWidth - margin - 3, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'right' });

    yPos += 12;

    // Table rows
    quotation.items?.forEach((item, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = margin;
        }

        xPos = margin + 3;

        addText(String(index + 1), xPos, yPos, { fontSize: 9, color: COLORS.gray });
        xPos += colWidths.num;

        // Service name
        addText(item.service_name, xPos, yPos, { fontSize: 9, fontStyle: 'bold' });

        // Description on next line if exists
        if (item.description) {
            yPos += 4;
            addText(item.description, xPos, yPos, { fontSize: 8, color: COLORS.gray, maxWidth: colWidths.service - 5 });
        }

        yPos -= item.description ? 4 : 0;
        xPos += colWidths.service;

        addText(String(item.quantity), xPos + colWidths.qty / 2 - 5, yPos, { fontSize: 9, align: 'center' });
        xPos += colWidths.qty;

        addText(`₹${item.rate.toLocaleString('en-IN')}`, xPos + colWidths.rate - 5, yPos, { fontSize: 9, align: 'right' });

        addText(`₹${item.amount.toLocaleString('en-IN')}`, pageWidth - margin - 3, yPos, { fontSize: 9, fontStyle: 'bold', align: 'right' });

        yPos += item.description ? 12 : 8;

        // Row separator
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    });

    yPos += 5;

    // ==================== TOTALS ====================
    const totalsStartX = pageWidth - margin - 70;
    const totalsValueX = pageWidth - margin - 3;

    // Subtotal
    addText('Subtotal', totalsStartX, yPos, { fontSize: 9, color: COLORS.gray });
    addText(`₹${quotation.subtotal.toLocaleString('en-IN')}`, totalsValueX, yPos, { fontSize: 9, align: 'right' });
    yPos += 7;

    // Discount
    if (quotation.discount_amount > 0) {
        addText('Discount', totalsStartX, yPos, { fontSize: 9, color: COLORS.green });
        addText(`- ₹${quotation.discount_amount.toLocaleString('en-IN')}`, totalsValueX, yPos, {
            fontSize: 9,
            color: COLORS.green,
            align: 'right',
        });
        yPos += 7;
    }

    // GST
    if (quotation.gst_amount > 0) {
        addText(`GST (${quotation.gst_percentage}%)`, totalsStartX, yPos, { fontSize: 9, color: COLORS.gray });
        addText(`₹${quotation.gst_amount.toLocaleString('en-IN')}`, totalsValueX, yPos, { fontSize: 9, align: 'right' });
        yPos += 7;
    }

    // Grand Total line
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(totalsStartX - 5, yPos, pageWidth - margin, yPos);
    yPos += 7;

    // Grand Total
    addText('Grand Total', totalsStartX, yPos, { fontSize: 11, fontStyle: 'bold' });
    addText(`₹${quotation.grand_total.toLocaleString('en-IN')}`, totalsValueX, yPos, {
        fontSize: 12,
        fontStyle: 'bold',
        color: COLORS.primary,
        align: 'right',
    });

    yPos += 20;

    // ==================== TERMS & NOTES ====================
    // Check if we need a new page
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    if (quotation.payment_terms) {
        addText('Payment Terms', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
        yPos += 6;
        addText(quotation.payment_terms, margin, yPos, { fontSize: 9, color: COLORS.gray, maxWidth: contentWidth });
        yPos += 10;
    }

    if (quotation.notes) {
        addText('Notes', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
        yPos += 6;
        addText(quotation.notes, margin, yPos, { fontSize: 9, color: COLORS.gray, maxWidth: contentWidth });
        yPos += 10;
    }

    // ==================== FOOTER ====================
    const footerY = pageHeight - 20;

    // Add thank you message and company info
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    addText('Thank you for your business!', pageWidth / 2, footerY, {
        fontSize: 10,
        fontStyle: 'italic',
        color: COLORS.gray,
        align: 'center',
    });

    addText(
        `${businessInfo.company_name} | ${businessInfo.company_website} | ${businessInfo.company_email}`,
        pageWidth / 2,
        footerY + 6,
        {
            fontSize: 8,
            color: COLORS.gray,
            align: 'center',
        }
    );

    // Save the PDF
    doc.save(`${quotation.quotation_number}.pdf`);
};

export const generateInvoicePDF = (invoice: any, businessInfo: BusinessInfo = DEFAULT_BUSINESS): void => {
    // Similar implementation for invoices
    // Can be extended based on invoice structure
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper function to add text
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
            fontSize = 10,
            fontStyle = 'normal',
            color = COLORS.dark,
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

    // ==================== HEADER ====================
    addText(businessInfo.company_name, margin, yPos, {
        fontSize: 28,
        fontStyle: 'bold',
        color: COLORS.primary,
    });
    yPos += 8;

    addText('Digital Marketing Agency', margin, yPos, {
        fontSize: 10,
        color: COLORS.gray,
    });
    yPos += 5;

    addText(`${businessInfo.company_email} | ${businessInfo.company_phone}`, margin, yPos, {
        fontSize: 9,
        color: COLORS.gray,
    });
    yPos += 5;

    addText(businessInfo.company_address, margin, yPos, {
        fontSize: 9,
        color: COLORS.gray,
    });

    // INVOICE title - right side
    addText('INVOICE', pageWidth - margin, margin, {
        fontSize: 22,
        fontStyle: 'bold',
        color: COLORS.dark,
        align: 'right',
    });

    addText(invoice.invoice_number, pageWidth - margin, margin + 10, {
        fontSize: 11,
        fontStyle: 'bold',
        color: COLORS.primary,
        align: 'right',
    });

    addText(`Date: ${format(new Date(invoice.invoice_date), 'dd MMM yyyy')}`, pageWidth - margin, margin + 17, {
        fontSize: 9,
        color: COLORS.gray,
        align: 'right',
    });

    addText(`Due Date: ${format(new Date(invoice.due_date), 'dd MMM yyyy')}`, pageWidth - margin, margin + 23, {
        fontSize: 9,
        color: COLORS.gray,
        align: 'right',
    });

    // Header line
    yPos += 12;
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.8);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // ==================== CLIENT DETAILS ====================
    addText('BILL TO', margin, yPos, {
        fontSize: 9,
        fontStyle: 'bold',
        color: COLORS.gray,
    });
    yPos += 6;

    addText(invoice.client_name, margin, yPos, {
        fontSize: 12,
        fontStyle: 'bold',
        color: COLORS.dark,
    });
    yPos += 6;

    if (invoice.client_business_name) {
        addText(invoice.client_business_name, margin, yPos, {
            fontSize: 10,
            color: COLORS.dark,
        });
        yPos += 5;
    }

    if (invoice.client_email) {
        addText(invoice.client_email, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
        });
        yPos += 5;
    }

    if (invoice.client_phone) {
        addText(invoice.client_phone, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
        });
        yPos += 5;
    }

    if (invoice.client_address) {
        addText(invoice.client_address, margin, yPos, {
            fontSize: 9,
            color: COLORS.gray,
            maxWidth: 80,
        });
        yPos += 5;
    }

    yPos += 10;

    // ==================== ITEMS TABLE ====================
    const colWidths = {
        num: 10,
        service: contentWidth * 0.4,
        qty: 20,
        rate: 35,
        amount: contentWidth - (10 + contentWidth * 0.4 + 20 + 35),
    };

    // Table header
    doc.setFillColor(...COLORS.lightGray);
    doc.rect(margin, yPos - 4, contentWidth, 10, 'F');

    let xPos = margin + 3;
    addText('#', xPos, yPos + 2, { fontSize: 9, fontStyle: 'bold' });
    xPos += colWidths.num;

    addText('Service', xPos, yPos + 2, { fontSize: 9, fontStyle: 'bold' });
    xPos += colWidths.service;

    addText('Qty', xPos + colWidths.qty / 2 - 5, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'center' });
    xPos += colWidths.qty;

    addText('Rate', xPos + colWidths.rate - 5, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'right' });

    addText('Amount', pageWidth - margin - 3, yPos + 2, { fontSize: 9, fontStyle: 'bold', align: 'right' });

    yPos += 12;

    // Table rows
    invoice.items?.forEach((item: any, index: number) => {
        if (yPos > pageHeight - 80) {
            doc.addPage();
            yPos = margin;
        }

        xPos = margin + 3;

        addText(String(index + 1), xPos, yPos, { fontSize: 9, color: COLORS.gray });
        xPos += colWidths.num;

        addText(item.service_name, xPos, yPos, { fontSize: 9, fontStyle: 'bold' });

        if (item.description) {
            yPos += 4;
            addText(item.description, xPos, yPos, { fontSize: 8, color: COLORS.gray, maxWidth: colWidths.service - 5 });
        }

        yPos -= item.description ? 4 : 0;
        xPos += colWidths.service;

        addText(String(item.quantity), xPos + colWidths.qty / 2 - 5, yPos, { fontSize: 9, align: 'center' });
        xPos += colWidths.qty;

        addText(`₹${item.rate.toLocaleString('en-IN')}`, xPos + colWidths.rate - 5, yPos, { fontSize: 9, align: 'right' });

        addText(`₹${item.amount.toLocaleString('en-IN')}`, pageWidth - margin - 3, yPos, { fontSize: 9, fontStyle: 'bold', align: 'right' });

        yPos += item.description ? 12 : 8;

        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(margin, yPos - 2, pageWidth - margin, yPos - 2);
    });

    yPos += 5;

    // ==================== TOTALS ====================
    const totalsStartX = pageWidth - margin - 70;
    const totalsValueX = pageWidth - margin - 3;

    addText('Subtotal', totalsStartX, yPos, { fontSize: 9, color: COLORS.gray });
    addText(`₹${invoice.subtotal.toLocaleString('en-IN')}`, totalsValueX, yPos, { fontSize: 9, align: 'right' });
    yPos += 7;

    if (invoice.discount_amount > 0) {
        addText('Discount', totalsStartX, yPos, { fontSize: 9, color: COLORS.green });
        addText(`- ₹${invoice.discount_amount.toLocaleString('en-IN')}`, totalsValueX, yPos, {
            fontSize: 9,
            color: COLORS.green,
            align: 'right',
        });
        yPos += 7;
    }

    if (invoice.gst_amount > 0) {
        addText(`GST (${invoice.gst_percentage}%)`, totalsStartX, yPos, { fontSize: 9, color: COLORS.gray });
        addText(`₹${invoice.gst_amount.toLocaleString('en-IN')}`, totalsValueX, yPos, { fontSize: 9, align: 'right' });
        yPos += 7;
    }

    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.line(totalsStartX - 5, yPos, pageWidth - margin, yPos);
    yPos += 7;

    addText('Grand Total', totalsStartX, yPos, { fontSize: 11, fontStyle: 'bold' });
    addText(`₹${invoice.grand_total.toLocaleString('en-IN')}`, totalsValueX, yPos, {
        fontSize: 12,
        fontStyle: 'bold',
        color: COLORS.primary,
        align: 'right',
    });

    yPos += 12;

    // Payment status
    const statusColors: Record<string, [number, number, number]> = {
        paid: [22, 163, 74],
        pending: [245, 158, 11],
        overdue: [220, 38, 38],
        partial: [59, 130, 246],
    };

    const statusColor = statusColors[invoice.status] || COLORS.gray;
    addText(`Status: ${invoice.status.toUpperCase()}`, totalsStartX, yPos, {
        fontSize: 10,
        fontStyle: 'bold',
        color: statusColor,
    });

    if (invoice.amount_paid > 0) {
        yPos += 6;
        addText(`Amount Paid: ₹${invoice.amount_paid.toLocaleString('en-IN')}`, totalsStartX, yPos, {
            fontSize: 9,
            color: COLORS.green,
        });
        yPos += 5;
        addText(`Balance Due: ₹${invoice.balance_due.toLocaleString('en-IN')}`, totalsStartX, yPos, {
            fontSize: 9,
            fontStyle: 'bold',
        });
    }

    yPos += 15;

    // ==================== TERMS & NOTES ====================
    if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = margin;
    }

    if (invoice.payment_terms) {
        addText('Payment Terms', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
        yPos += 6;
        addText(invoice.payment_terms, margin, yPos, { fontSize: 9, color: COLORS.gray, maxWidth: contentWidth });
        yPos += 10;
    }

    if (invoice.notes) {
        addText('Notes', margin, yPos, { fontSize: 10, fontStyle: 'bold' });
        yPos += 6;
        addText(invoice.notes, margin, yPos, { fontSize: 9, color: COLORS.gray, maxWidth: contentWidth });
    }

    // ==================== FOOTER ====================
    const footerY = pageHeight - 20;

    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

    addText('Thank you for your business!', pageWidth / 2, footerY, {
        fontSize: 10,
        fontStyle: 'italic',
        color: COLORS.gray,
        align: 'center',
    });

    addText(
        `${businessInfo.company_name} | ${businessInfo.company_website} | ${businessInfo.company_email}`,
        pageWidth / 2,
        footerY + 6,
        {
            fontSize: 8,
            color: COLORS.gray,
            align: 'center',
        }
    );

    doc.save(`${invoice.invoice_number}.pdf`);
};
