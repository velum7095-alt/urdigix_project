# URDIGIX Quotation & Invoice Management System

## Overview
A professional quotation and invoice management system built for URDIGIX digital marketing agency operations.

## Features

### 1. Quotation Management
- **Create/Edit Quotations** with auto-generated quotation numbers (URD-Q-YYYYMM-XXX)
- **Client Details**: Name, business name, phone, email, address
- **Dynamic Service Items**: Add/remove services with preset options
- **Automatic Calculations**: Subtotal, discount, GST, grand total
- **Status Tracking**: Draft → Sent → Accepted/Rejected → Converted to Invoice
- **PDF Generation**: Professional branded PDF output via browser print
- **Email Integration**: Ready for email sending functionality

### 2. Invoice Management
- **Create from Scratch** or **Convert from Quotation**
- **Auto-generated Invoice Numbers** (URD-INV-YYYYMM-XXX)
- **Payment Tracking**: Amount paid, balance due
- **Status Management**: Draft → Sent → Pending → Paid/Overdue
- **Payment Recording**: Record partial or full payments
- **PDF Generation**: Print-ready invoice layout

### 3. Business Settings
- Company information (name, address, phone, email, website)
- Logo upload capability
- Currency selection (₹ INR / $ USD)
- GST configuration (enable/disable, percentage)
- Discount settings
- Bank account details for invoices
- UPI ID for digital payments
- Default payment terms and validity periods

## File Structure

```
src/
├── types/
│   └── billing.ts                    # TypeScript interfaces & constants
├── components/admin/
│   ├── QuotationsManager.tsx         # Quotation CRUD & management
│   ├── InvoicesManager.tsx           # Invoice CRUD & management
│   └── BusinessSettings.tsx          # Company settings configuration
├── pages/
│   └── Admin.tsx                     # Updated admin panel with new tabs
└── index.css                         # Added print styles for PDFs

supabase/migrations/
└── 20260203_quotation_invoice_system.sql   # Database schema
```

## Database Schema

### Tables
1. **business_settings** - Company configuration
2. **quotations** - Quotation records
3. **quotation_items** - Line items for quotations
4. **invoices** - Invoice records
5. **invoice_items** - Line items for invoices

### Functions
- `generate_quotation_number()` - Auto-increment quotation numbers
- `generate_invoice_number()` - Auto-increment invoice numbers

## Service Presets
Built-in service types for quick selection:
- Website Development
- Website Redesign
- E-commerce Website
- Landing Page
- SEO Optimization
- Meta Ads Management
- Google Ads Management
- Social Media Management
- Content Creation
- Logo Design
- Brand Identity
- Website Maintenance
- Domain & Hosting
- Email Setup
- Consultation

## Branding
All documents feature:
- URDIGIX logo and name
- Orange/amber brand colors
- Professional typography (Inter, Space Grotesk)
- Clean, modern agency-style layout
- Consistent gradient styling

## How to Access

1. Navigate to `/auth`
2. Login with dev credentials:
   - **Username**: admin
   - **Password**: admin123
3. Access the admin panel at `/admin`
4. Use the sidebar/tabs to navigate:
   - Dashboard
   - **Quotations** (NEW)
   - **Invoices** (NEW)
   - CMS
   - Messages
   - Analytics
   - **Settings** (NEW)

## PDF Generation
- Click "View" on any quotation/invoice
- Click "Download PDF" button
- Uses browser's native print-to-PDF functionality
- Styled with URDIGIX branding
- Print-optimized CSS ensures professional output

## Future Enhancements
- [ ] Connect to Supabase database (currently using mock data)
- [ ] Email sending integration
- [ ] Convert quotation to invoice with one click
- [ ] Client portal for viewing quotations/invoices
- [ ] Multiple currency support
- [ ] Custom invoice templates
- [ ] Payment gateway integration
- [ ] Automated payment reminders
