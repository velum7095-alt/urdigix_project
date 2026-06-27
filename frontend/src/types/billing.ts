// ============================================
// URDIGIX Quotation & Invoice Types
// ============================================

export interface BusinessSettings {
    id: string;
    company_name: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    company_website: string;
    logo_url: string | null;
    currency: string;
    currency_code: string;
    gst_number: string | null;
    gst_percentage: number;
    enable_gst: boolean;
    enable_discount: boolean;
    default_payment_terms: string;
    default_validity_days: number;
    bank_name: string | null;
    bank_account_number: string | null;
    bank_ifsc: string | null;
    upi_id: string | null;
    updated_at: string;
}

export interface QuotationItem {
    id?: string;
    quotation_id?: string;
    service_name: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sort_order: number;
}

export interface Quotation {
    id?: string;
    quotation_number: string;
    quotation_date: string;
    validity_days: number;
    valid_until: string;

    // Client
    client_name: string;
    client_business_name: string;
    client_phone: string;
    client_email: string;
    client_address: string;

    // Pricing
    subtotal: number;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discount_amount: number;
    taxable_amount: number;
    gst_percentage: number;
    gst_amount: number;
    grand_total: number;

    // Terms
    payment_terms: string;
    notes: string;

    // Status
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';

    // Meta
    created_at?: string;
    updated_at?: string;
    sent_at?: string;
    accepted_at?: string;
    converted_to_invoice?: boolean;
    invoice_id?: string;

    // Items (for form handling)
    items?: QuotationItem[];
}

export interface InvoiceItem {
    id?: string;
    invoice_id?: string;
    service_name: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    sort_order: number;
}

export interface Invoice {
    id?: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;

    // Link to quotation
    quotation_id?: string;
    quotation_number?: string;

    // Client
    client_name: string;
    client_business_name: string;
    client_phone: string;
    client_email: string;
    client_address: string;

    // Pricing
    subtotal: number;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    discount_amount: number;
    taxable_amount: number;
    gst_percentage: number;
    gst_amount: number;
    grand_total: number;

    // Payment
    amount_paid: number;
    balance_due: number;
    payment_terms: string;
    notes: string;

    // Status
    status: 'draft' | 'sent' | 'paid' | 'pending' | 'overdue' | 'cancelled';

    // Meta
    created_at?: string;
    updated_at?: string;
    sent_at?: string;
    paid_at?: string;

    // Items (for form handling)
    items?: InvoiceItem[];
}

// Status configurations
export const QUOTATION_STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: 'FileText' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: 'Send' },
    accepted: { label: 'Accepted', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: 'XCircle' },
    expired: { label: 'Expired', color: 'bg-orange-100 text-orange-700', icon: 'Clock' },
};

export const INVOICE_STATUS_CONFIG = {
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: 'FileText' },
    sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700', icon: 'Send' },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: 'Clock' },
    paid: { label: 'Paid', color: 'bg-green-100 text-green-700', icon: 'CheckCircle' },
    overdue: { label: 'Overdue', color: 'bg-red-100 text-red-700', icon: 'AlertCircle' },
    cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: 'XCircle' },
};

// Service presets for quick selection
export const SERVICE_PRESETS = [
    { name: 'Website Development', description: 'Custom website design and development' },
    { name: 'Website Redesign', description: 'Modern redesign of existing website' },
    { name: 'E-commerce Website', description: 'Full-featured online store development' },
    { name: 'Landing Page', description: 'High-converting single page design' },
    { name: 'SEO Optimization', description: 'Search engine optimization services' },
    { name: 'Meta Ads Management', description: 'Facebook & Instagram advertising' },
    { name: 'Google Ads Management', description: 'Google Ads campaign management' },
    { name: 'Social Media Management', description: 'Monthly social media handling' },
    { name: 'Content Creation', description: 'Graphics, reels, and content design' },
    { name: 'Logo Design', description: 'Professional brand logo design' },
    { name: 'Brand Identity', description: 'Complete brand identity package' },
    { name: 'Website Maintenance', description: 'Monthly website maintenance and updates' },
    { name: 'Domain & Hosting', description: 'Annual domain and hosting services' },
    { name: 'Email Setup', description: 'Professional email configuration' },
    { name: 'Consultation', description: 'Digital marketing consultation' },
];

// Default empty quotation
export const DEFAULT_QUOTATION: Partial<Quotation> = {
    quotation_number: '',
    quotation_date: new Date().toISOString().split('T')[0],
    validity_days: 15,
    valid_until: '',
    client_name: '',
    client_business_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    subtotal: 0,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    taxable_amount: 0,
    gst_percentage: 18,
    gst_amount: 0,
    grand_total: 0,
    payment_terms: '50% advance, balance on delivery',
    notes: '',
    status: 'draft',
    items: [],
};

// Default empty invoice
export const DEFAULT_INVOICE: Partial<Invoice> = {
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    client_name: '',
    client_business_name: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    subtotal: 0,
    discount_type: 'percentage',
    discount_value: 0,
    discount_amount: 0,
    taxable_amount: 0,
    gst_percentage: 18,
    gst_amount: 0,
    grand_total: 0,
    amount_paid: 0,
    balance_due: 0,
    payment_terms: '',
    notes: '',
    status: 'draft',
    items: [],
};

// Default empty item
export const DEFAULT_ITEM = {
    service_name: '',
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0,
    sort_order: 0,
};
