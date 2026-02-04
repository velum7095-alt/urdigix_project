import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, FileText, Send, CheckCircle, XCircle,
    Clock, MoreVertical, Download, Mail, Edit, Trash2, Eye,
    Calendar, User, Building, AlertCircle, CreditCard,
    IndianRupee, Receipt, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format, addDays } from 'date-fns';
import {
    Invoice, InvoiceItem, DEFAULT_INVOICE, DEFAULT_ITEM,
    INVOICE_STATUS_CONFIG, SERVICE_PRESETS
} from '@/types/billing';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { billingService } from '@/services/billingService';

// Mock data (Removed)
const MOCK_INVOICES: Invoice[] = [];
const StatusBadge = ({ status }: { status: string }) => {
    const config = INVOICE_STATUS_CONFIG[status as keyof typeof INVOICE_STATUS_CONFIG];
    return (
        <Badge className={`${config.color} font-medium`}>
            {config.label}
        </Badge>
    );
};

export const InvoicesManager = () => {
    const { toast } = useToast();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
    const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);

    // Form state
    const [formData, setFormData] = useState<Partial<Invoice>>(DEFAULT_INVOICE);
    const [items, setItems] = useState<Partial<InvoiceItem>[]>([{ ...DEFAULT_ITEM }]);
    const [enableGst, setEnableGst] = useState(true);
    const [enableDiscount, setEnableDiscount] = useState(false);

    // Fetch on mount
    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setIsLoading(true);
            const data = await billingService.getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to load invoices', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // Filter invoices
    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch =
            inv.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.client_business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate totals
    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);

        let discountAmount = 0;
        if (enableDiscount && formData.discount_value) {
            if (formData.discount_type === 'percentage') {
                discountAmount = (subtotal * formData.discount_value) / 100;
            } else {
                discountAmount = formData.discount_value;
            }
        }

        const taxableAmount = subtotal - discountAmount;
        const gstAmount = enableGst ? (taxableAmount * (formData.gst_percentage || 18)) / 100 : 0;
        const grandTotal = taxableAmount + gstAmount;
        const balanceDue = grandTotal - (formData.amount_paid || 0);

        setFormData(prev => ({
            ...prev,
            subtotal,
            discount_amount: discountAmount,
            taxable_amount: taxableAmount,
            gst_amount: gstAmount,
            grand_total: grandTotal,
            balance_due: balanceDue,
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [items, formData.discount_type, formData.discount_value, formData.gst_percentage, formData.amount_paid, enableGst, enableDiscount]);

    const handleAddItem = () => {
        setItems([...items, { ...DEFAULT_ITEM, sort_order: items.length }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };

        if (field === 'quantity' || field === 'rate') {
            const qty = field === 'quantity' ? value : newItems[index].quantity || 1;
            const rate = field === 'rate' ? value : newItems[index].rate || 0;
            newItems[index].amount = qty * rate;
        }

        setItems(newItems);
    };

    const handleSelectPreset = (index: number, preset: typeof SERVICE_PRESETS[0]) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            service_name: preset.name,
            description: preset.description,
        };
        setItems(newItems);
    };

    const handleNewInvoice = async () => {
        setEditingInvoice(null);
        try {
            const newNumber = await billingService.generateInvoiceNumber();
            const dueDate = addDays(new Date(), 15);
            setFormData({
                ...DEFAULT_INVOICE,
                invoice_number: newNumber,
                invoice_date: format(new Date(), 'yyyy-MM-dd'),
                due_date: format(dueDate, 'yyyy-MM-dd'),
            });
            setItems([{ ...DEFAULT_ITEM }]);
            setEnableGst(true);
            setEnableDiscount(false);
            setIsFormOpen(true);
        } catch (error) {
            toast({ title: 'Failed to generate invoice number', variant: 'destructive' });
        }
    };

    const handleEditInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setFormData(invoice);
        setItems(invoice.items || [{ ...DEFAULT_ITEM }]);
        setEnableGst(invoice.gst_amount > 0);
        setEnableDiscount(invoice.discount_amount > 0);
        setIsFormOpen(true);
    };

    const handleSaveInvoice = async () => {
        try {
            const invoiceData = { ...formData };
            if (editingInvoice && editingInvoice.id) {
                await billingService.updateInvoice(editingInvoice.id, invoiceData, items);
                toast({ title: 'Invoice updated successfully!' });
            } else {
                await billingService.createInvoice(invoiceData, items);
                toast({ title: 'Invoice created successfully!' });
            }
            setIsFormOpen(false);
            loadInvoices();
        } catch (error: any) {
            toast({
                title: 'Error saving invoice',
                description: error.message || 'Unknown error',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteInvoice = async (id: string) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await billingService.deleteInvoice(id);
            setInvoices(invoices.filter(inv => inv.id !== id));
            toast({ title: 'Invoice deleted' });
        } catch (error) {
            toast({ title: 'Error deleting invoice', variant: 'destructive' });
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await billingService.updateInvoice(id, { status: newStatus as any }, []); // Empty items means don't update items
            setInvoices(invoices.map(inv =>
                inv.id === id ? { ...inv, status: newStatus as Invoice['status'] } : inv
            ));
            toast({ title: `Status updated to ${INVOICE_STATUS_CONFIG[newStatus as keyof typeof INVOICE_STATUS_CONFIG].label}` });
        } catch (error) {
            toast({ title: 'Error updating status', variant: 'destructive' });
        }
    };

    const handlePreview = (invoice: Invoice) => {
        setPreviewInvoice(invoice);
        setIsPreviewOpen(true);
    };

    const handleDownloadPDF = (invoice: Invoice) => {
        // Generate and download PDF using jsPDF
        generateInvoicePDF(invoice);
        toast({ title: 'PDF downloaded successfully!' });
    };

    const handleRecordPayment = (invoice: Invoice) => {
        setPaymentInvoice(invoice);
        setPaymentAmount(invoice.balance_due);
        setIsPaymentOpen(true);
    };

    const handleSavePayment = () => {
        if (!paymentInvoice) return;

        const newAmountPaid = paymentInvoice.amount_paid + paymentAmount;
        const newBalanceDue = paymentInvoice.grand_total - newAmountPaid;
        const newStatus: Invoice['status'] = newBalanceDue <= 0 ? 'paid' : 'pending';

        setInvoices(invoices.map(inv =>
            inv.id === paymentInvoice.id
                ? {
                    ...inv,
                    amount_paid: newAmountPaid,
                    balance_due: Math.max(0, newBalanceDue),
                    status: newStatus,
                    paid_at: newStatus === 'paid' ? new Date().toISOString() : inv.paid_at,
                }
                : inv
        ));

        toast({
            title: newStatus === 'paid' ? 'Invoice marked as paid!' : 'Payment recorded successfully!',
        });
        setIsPaymentOpen(false);
    };

    // Stats
    const stats = {
        total: invoices.length,
        pending: invoices.filter(inv => inv.status === 'pending').length,
        paid: invoices.filter(inv => inv.status === 'paid').length,
        overdue: invoices.filter(inv => inv.status === 'overdue').length,
        totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.grand_total, 0),
        pendingAmount: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.balance_due, 0),
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
                    <p className="text-gray-500">Create and manage client invoices</p>
                </div>
                <Button
                    onClick={handleNewInvoice}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Invoice
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-yellow-600">Pending</p>
                        <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Paid</p>
                        <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-red-600">Overdue</p>
                        <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Revenue</p>
                        <p className="text-xl font-bold text-green-700">₹{stats.totalRevenue.toLocaleString()}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-600">Pending Amt</p>
                        <p className="text-xl font-bold text-orange-700">₹{stats.pendingAmount.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by client, business, or invoice number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredInvoices.map((invoice, index) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="hover:shadow-lg transition-shadow border-gray-200">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Left Section */}
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-bold text-gray-900">{invoice.invoice_number}</h3>
                                                <StatusBadge status={invoice.status} />
                                                {invoice.quotation_number && (
                                                    <Badge variant="outline" className="text-xs">
                                                        From: {invoice.quotation_number}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {invoice.client_name}
                                                </span>
                                                {invoice.client_business_name && (
                                                    <span className="flex items-center gap-1">
                                                        <Building className="w-4 h-4" />
                                                        {invoice.client_business_name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Due: {format(new Date(invoice.due_date), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Total</p>
                                                <p className="text-xl font-bold text-gray-900">₹{invoice.grand_total.toLocaleString()}</p>
                                                {invoice.balance_due > 0 && (
                                                    <p className="text-xs text-orange-600">
                                                        Due: ₹{invoice.balance_due.toLocaleString()}
                                                    </p>
                                                )}
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handlePreview(invoice)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="w-4 h-4 mr-2" /> Send Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {invoice.status !== 'paid' && (
                                                        <DropdownMenuItem onClick={() => handleRecordPayment(invoice)}>
                                                            <CreditCard className="w-4 h-4 mr-2" /> Record Payment
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem onClick={() => handleStatusChange(invoice.id!, 'sent')}>
                                                        <Send className="w-4 h-4 mr-2" /> Mark as Sent
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(invoice.id!, 'paid')}>
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Paid
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteInvoice(invoice.id!)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredInvoices.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-200">
                        <CardContent className="p-12 text-center">
                            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first invoice to get started'}
                            </p>
                            <Button onClick={handleNewInvoice}>
                                <Plus className="w-4 h-4 mr-2" /> Create Invoice
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Invoice Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Invoice Number</Label>
                                <Input
                                    value={formData.invoice_number}
                                    onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Invoice Date</Label>
                                <Input
                                    type="date"
                                    value={formData.invoice_date}
                                    onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Due Date</Label>
                                <Input
                                    type="date"
                                    value={formData.due_date}
                                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        {/* Client Details */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" /> Client Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Client Name *</Label>
                                    <Input
                                        value={formData.client_name}
                                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                        placeholder="John Doe"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Business Name</Label>
                                    <Input
                                        value={formData.client_business_name}
                                        onChange={(e) => setFormData({ ...formData, client_business_name: e.target.value })}
                                        placeholder="ABC Company"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={formData.client_phone}
                                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                        placeholder="+91 98765 43210"
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={formData.client_email}
                                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                        placeholder="client@example.com"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Address</Label>
                                    <Textarea
                                        value={formData.client_address}
                                        onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                                        placeholder="Full address"
                                        className="mt-1"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Services */}
                        <div className="border-t pt-4">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Receipt className="w-4 h-4" /> Services & Pricing
                            </h3>

                            <div className="space-y-4">
                                {items.map((item, index) => (
                                    <Card key={index} className="p-4 bg-gray-50">
                                        <div className="grid grid-cols-12 gap-3">
                                            <div className="col-span-12 md:col-span-4">
                                                <Label className="text-xs">Service</Label>
                                                <Select
                                                    value={item.service_name}
                                                    onValueChange={(v) => {
                                                        const preset = SERVICE_PRESETS.find(p => p.name === v);
                                                        if (preset) handleSelectPreset(index, preset);
                                                    }}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Select service" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {SERVICE_PRESETS.map(preset => (
                                                            <SelectItem key={preset.name} value={preset.name}>
                                                                {preset.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="col-span-12 md:col-span-3">
                                                <Label className="text-xs">Description</Label>
                                                <Input
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-1">
                                                <Label className="text-xs">Qty</Label>
                                                <Input
                                                    type="number"
                                                    value={item.quantity}
                                                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                    className="mt-1"
                                                    min={1}
                                                />
                                            </div>
                                            <div className="col-span-4 md:col-span-2">
                                                <Label className="text-xs">Rate (₹)</Label>
                                                <Input
                                                    type="number"
                                                    value={item.rate}
                                                    onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div className="col-span-3 md:col-span-1">
                                                <Label className="text-xs">Amount</Label>
                                                <p className="mt-1 py-2 font-semibold">₹{(item.amount || 0).toLocaleString()}</p>
                                            </div>
                                            <div className="col-span-1 flex items-end">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(index)}
                                                    disabled={items.length === 1}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                <Button variant="outline" onClick={handleAddItem} className="w-full">
                                    <Plus className="w-4 h-4 mr-2" /> Add Service
                                </Button>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t pt-4">
                            <div className="flex flex-col md:flex-row md:justify-between gap-6">
                                {/* Options */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enableDiscount}
                                                onChange={(e) => setEnableDiscount(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm">Enable Discount</span>
                                        </label>
                                        {enableDiscount && (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    value={formData.discount_value}
                                                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) || 0 })}
                                                    className="w-20"
                                                />
                                                <Select
                                                    value={formData.discount_type}
                                                    onValueChange={(v) => setFormData({ ...formData, discount_type: v as 'percentage' | 'fixed' })}
                                                >
                                                    <SelectTrigger className="w-24">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="percentage">%</SelectItem>
                                                        <SelectItem value="fixed">₹ Fixed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={enableGst}
                                                onChange={(e) => setEnableGst(e.target.checked)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                            <span className="text-sm">Apply GST</span>
                                        </label>
                                        {enableGst && (
                                            <Select
                                                value={String(formData.gst_percentage)}
                                                onValueChange={(v) => setFormData({ ...formData, gst_percentage: parseFloat(v) })}
                                            >
                                                <SelectTrigger className="w-28">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">5%</SelectItem>
                                                    <SelectItem value="12">12%</SelectItem>
                                                    <SelectItem value="18">18%</SelectItem>
                                                    <SelectItem value="28">28%</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    <div>
                                        <Label>Amount Already Paid</Label>
                                        <Input
                                            type="number"
                                            value={formData.amount_paid}
                                            onChange={(e) => setFormData({ ...formData, amount_paid: parseFloat(e.target.value) || 0 })}
                                            className="mt-1 w-40"
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <Card className="p-4 bg-gray-50 min-w-[250px]">
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Subtotal</span>
                                            <span>₹{formData.subtotal?.toLocaleString()}</span>
                                        </div>
                                        {enableDiscount && formData.discount_amount! > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>- ₹{formData.discount_amount?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {enableGst && (
                                            <div className="flex justify-between text-gray-500">
                                                <span>GST ({formData.gst_percentage}%)</span>
                                                <span>₹{formData.gst_amount?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold pt-2 border-t">
                                            <span>Grand Total</span>
                                            <span>₹{formData.grand_total?.toLocaleString()}</span>
                                        </div>
                                        {formData.amount_paid! > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Paid</span>
                                                <span>- ₹{formData.amount_paid?.toLocaleString()}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg text-orange-600 pt-2 border-t">
                                            <span>Balance Due</span>
                                            <span>₹{formData.balance_due?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Terms</Label>
                                    <Textarea
                                        value={formData.payment_terms}
                                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                        className="mt-1"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="mt-1"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveInvoice}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            >
                                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    {previewInvoice && (
                        <div className="invoice-preview p-8 bg-white">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-orange-500">
                                <div>
                                    <h1 className="text-3xl font-bold text-orange-600">URDIGIX</h1>
                                    <p className="text-gray-500 text-sm mt-1">Digital Marketing Agency</p>
                                    <p className="text-gray-500 text-sm">hello@urdigix.com | +91 78930 40375</p>
                                    <p className="text-gray-500 text-sm">India</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-gray-900">INVOICE</h2>
                                    <p className="text-gray-600 font-medium mt-2">{previewInvoice.invoice_number}</p>
                                    <p className="text-sm text-gray-500">Date: {format(new Date(previewInvoice.invoice_date), 'dd MMM yyyy')}</p>
                                    <p className="text-sm text-gray-500">Due: {format(new Date(previewInvoice.due_date), 'dd MMM yyyy')}</p>
                                    <StatusBadge status={previewInvoice.status} />
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                                <p className="font-bold text-gray-900">{previewInvoice.client_name}</p>
                                {previewInvoice.client_business_name && (
                                    <p className="text-gray-600">{previewInvoice.client_business_name}</p>
                                )}
                                {previewInvoice.client_email && (
                                    <p className="text-gray-500 text-sm">{previewInvoice.client_email}</p>
                                )}
                                {previewInvoice.client_phone && (
                                    <p className="text-gray-500 text-sm">{previewInvoice.client_phone}</p>
                                )}
                            </div>

                            {/* Items Table */}
                            <table className="w-full mb-8">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="text-left p-3 font-semibold text-gray-700">#</th>
                                        <th className="text-left p-3 font-semibold text-gray-700">Service</th>
                                        <th className="text-center p-3 font-semibold text-gray-700">Qty</th>
                                        <th className="text-right p-3 font-semibold text-gray-700">Rate</th>
                                        <th className="text-right p-3 font-semibold text-gray-700">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewInvoice.items?.map((item, index) => (
                                        <tr key={index} className="border-b">
                                            <td className="p-3 text-gray-600">{index + 1}</td>
                                            <td className="p-3">
                                                <p className="font-medium text-gray-900">{item.service_name}</p>
                                                {item.description && (
                                                    <p className="text-sm text-gray-500">{item.description}</p>
                                                )}
                                            </td>
                                            <td className="p-3 text-center text-gray-600">{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-600">₹{item.rate.toLocaleString()}</td>
                                            <td className="p-3 text-right font-medium text-gray-900">₹{item.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="flex justify-end mb-8">
                                <div className="w-64">
                                    <div className="flex justify-between py-2">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>₹{previewInvoice.subtotal.toLocaleString()}</span>
                                    </div>
                                    {previewInvoice.discount_amount > 0 && (
                                        <div className="flex justify-between py-2 text-green-600">
                                            <span>Discount</span>
                                            <span>- ₹{previewInvoice.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {previewInvoice.gst_amount > 0 && (
                                        <div className="flex justify-between py-2 text-gray-500">
                                            <span>GST ({previewInvoice.gst_percentage}%)</span>
                                            <span>₹{previewInvoice.gst_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-2 font-bold border-t">
                                        <span>Grand Total</span>
                                        <span>₹{previewInvoice.grand_total.toLocaleString()}</span>
                                    </div>
                                    {previewInvoice.amount_paid > 0 && (
                                        <div className="flex justify-between py-2 text-green-600">
                                            <span>Amount Paid</span>
                                            <span>- ₹{previewInvoice.amount_paid.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-orange-500 text-orange-600">
                                        <span>Balance Due</span>
                                        <span>₹{previewInvoice.balance_due.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
                                <p>Thank you for your business!</p>
                                <p className="mt-2">URDIGIX | www.urdigix.com | hello@urdigix.com</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => window.print()}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Record Payment</DialogTitle>
                    </DialogHeader>

                    {paymentInvoice && (
                        <div className="space-y-4 py-4">
                            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                <p className="font-medium">{paymentInvoice.invoice_number}</p>
                                <p className="text-sm text-gray-500">{paymentInvoice.client_name}</p>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-gray-500">Balance Due</span>
                                    <span className="font-bold text-orange-600">₹{paymentInvoice.balance_due.toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <Label>Payment Amount (₹)</Label>
                                <Input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                                    max={paymentInvoice.balance_due}
                                    className="mt-1"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSavePayment}
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={paymentAmount <= 0}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> Record Payment
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};
