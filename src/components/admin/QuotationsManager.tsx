import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search, Filter, FileText, Send, CheckCircle, XCircle,
    Clock, MoreVertical, Download, Mail, Edit, Trash2, Eye,
    ChevronDown, Calendar, User, Building, Phone, MapPin,
    IndianRupee, Percent, FileCheck, Copy, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    Quotation, QuotationItem, DEFAULT_QUOTATION, DEFAULT_ITEM,
    QUOTATION_STATUS_CONFIG, SERVICE_PRESETS
} from '@/types/billing';
import { generateQuotationPDF } from '@/utils/pdfGenerator';
import { billingService } from '@/services/billingService';

// Mock data (Removed)
const MOCK_QUOTATIONS: Quotation[] = [];
const StatusBadge = ({ status }: { status: string }) => {
    const config = QUOTATION_STATUS_CONFIG[status as keyof typeof QUOTATION_STATUS_CONFIG];
    return (
        <Badge className={`${config.color} font-medium`}>
            {config.label}
        </Badge>
    );
};

export const QuotationsManager = () => {
    const { toast } = useToast();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
    const [previewQuotation, setPreviewQuotation] = useState<Quotation | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<Quotation>>(DEFAULT_QUOTATION);
    const [items, setItems] = useState<Partial<QuotationItem>[]>([{ ...DEFAULT_ITEM }]);
    const [enableGst, setEnableGst] = useState(true);
    const [enableDiscount, setEnableDiscount] = useState(false);

    // Fetch on mount
    useEffect(() => {
        loadQuotations();
    }, []);

    const loadQuotations = async () => {
        try {
            setIsLoading(true);
            const data = await billingService.getQuotations();
            setQuotations(data);
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to load quotations', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    // Filter quotations
    const filteredQuotations = quotations.filter(q => {
        const matchesSearch =
            q.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.client_business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.quotation_number.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
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

        setFormData(prev => ({
            ...prev,
            subtotal,
            discount_amount: discountAmount,
            taxable_amount: taxableAmount,
            gst_amount: gstAmount,
            grand_total: grandTotal,
        }));
    };

    useEffect(() => {
        calculateTotals();
    }, [items, formData.discount_type, formData.discount_value, formData.gst_percentage, enableGst, enableDiscount]);

    // Update valid_until when date or validity changes
    useEffect(() => {
        if (formData.quotation_date && formData.validity_days) {
            const validUntil = addDays(new Date(formData.quotation_date), formData.validity_days);
            setFormData(prev => ({
                ...prev,
                valid_until: format(validUntil, 'yyyy-MM-dd'),
            }));
        }
    }, [formData.quotation_date, formData.validity_days]);

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

        // Recalculate amount
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

    const handleNewQuotation = async () => {
        setEditingQuotation(null);
        try {
            const newNumber = await billingService.generateQuotationNumber();
            setFormData({
                ...DEFAULT_QUOTATION,
                quotation_number: newNumber,
                quotation_date: format(new Date(), 'yyyy-MM-dd'),
            });
            setItems([{ ...DEFAULT_ITEM }]);
            setEnableGst(true);
            setEnableDiscount(false);
            setIsFormOpen(true);
        } catch (error) {
            toast({ title: 'Failed to generate number', variant: 'destructive' });
        }
    };

    const handleEditQuotation = (quotation: Quotation) => {
        setEditingQuotation(quotation);
        setFormData(quotation);
        setItems(quotation.items || [{ ...DEFAULT_ITEM }]);
        setEnableGst(quotation.gst_amount > 0);
        setEnableDiscount(quotation.discount_amount > 0);
        setIsFormOpen(true);
    };

    const handleSaveQuotation = async () => {
        try {
            const quotationData = { ...formData };
            // Ensure numeric fields are numbers
            // @ts-ignore
            if (typeof quotationData.validity_days === 'string') quotationData.validity_days = parseInt(quotationData.validity_days);

            if (editingQuotation && editingQuotation.id) {
                await billingService.updateQuotation(editingQuotation.id, quotationData, items);
                toast({ title: 'Quotation updated successfully!' });
            } else {
                await billingService.createQuotation(quotationData, items);
                toast({ title: 'Quotation created successfully!' });
            }

            setIsFormOpen(false);
            loadQuotations(); // Reload
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Error saving quotation',
                description: error.message || 'Unknown error',
                variant: 'destructive'
            });
        }
    };

    const handleDeleteQuotation = async (id: string) => {
        if (!confirm('Are you sure you want to delete this quotation?')) return;
        try {
            await billingService.deleteQuotation(id);
            setQuotations(quotations.filter(q => q.id !== id));
            toast({ title: 'Quotation deleted' });
        } catch (error) {
            toast({ title: 'Error deleting quotation', variant: 'destructive' });
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await billingService.updateQuotation(id, { status: newStatus as any }, []);
            // Update local state optimizing for speed
            setQuotations(quotations.map(q =>
                q.id === id ? { ...q, status: newStatus as Quotation['status'] } : q
            ));

            // If accepted, maybe we should offer to generate invoice?
            toast({ title: `Status updated to ${QUOTATION_STATUS_CONFIG[newStatus as keyof typeof QUOTATION_STATUS_CONFIG].label}` });
        } catch (error) {
            toast({ title: 'Error updating status', variant: 'destructive' });
        }
    };

    const handlePreview = (quotation: Quotation) => {
        setPreviewQuotation(quotation);
        setIsPreviewOpen(true);
    };

    const handleDownloadPDF = (quotation: Quotation) => {
        // Generate and download PDF using jsPDF
        generateQuotationPDF(quotation);
        toast({ title: 'PDF downloaded successfully!' });
    };

    // Stats
    const stats = {
        total: quotations.length,
        draft: quotations.filter(q => q.status === 'draft').length,
        sent: quotations.filter(q => q.status === 'sent').length,
        accepted: quotations.filter(q => q.status === 'accepted').length,
        totalValue: quotations.reduce((sum, q) => sum + q.grand_total, 0),
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
                    <h2 className="text-2xl font-bold text-gray-900">Quotations</h2>
                    <p className="text-gray-500">Create and manage client quotations</p>
                </div>
                <Button
                    onClick={handleNewQuotation}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Quotation
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-blue-600">Sent</p>
                        <p className="text-2xl font-bold text-blue-700">{stats.sent}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-green-600">Accepted</p>
                        <p className="text-2xl font-bold text-green-700">{stats.accepted}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Draft</p>
                        <p className="text-2xl font-bold text-gray-700">{stats.draft}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-amber-100 border-orange-200">
                    <CardContent className="p-4">
                        <p className="text-sm text-orange-600">Total Value</p>
                        <p className="text-2xl font-bold text-orange-700">₹{stats.totalValue.toLocaleString()}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search by client, business, or quotation number..."
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
                        <SelectItem value="accepted">Accepted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Quotations List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredQuotations.map((quotation, index) => (
                        <motion.div
                            key={quotation.id}
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
                                                <h3 className="font-bold text-gray-900">{quotation.quotation_number}</h3>
                                                <StatusBadge status={quotation.status} />
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    {quotation.client_name}
                                                </span>
                                                {quotation.client_business_name && (
                                                    <span className="flex items-center gap-1">
                                                        <Building className="w-4 h-4" />
                                                        {quotation.client_business_name}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {format(new Date(quotation.quotation_date), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right Section */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-500">Grand Total</p>
                                                <p className="text-xl font-bold text-gray-900">₹{quotation.grand_total.toLocaleString()}</p>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                    <DropdownMenuItem onClick={() => handlePreview(quotation)}>
                                                        <Eye className="w-4 h-4 mr-2" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleEditQuotation(quotation)}>
                                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDownloadPDF(quotation)}>
                                                        <Download className="w-4 h-4 mr-2" /> Download PDF
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Mail className="w-4 h-4 mr-2" /> Send Email
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStatusChange(quotation.id!, 'sent')}>
                                                        <Send className="w-4 h-4 mr-2" /> Mark as Sent
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusChange(quotation.id!, 'accepted')}>
                                                        <CheckCircle className="w-4 h-4 mr-2" /> Mark as Accepted
                                                    </DropdownMenuItem>
                                                    {quotation.status === 'accepted' && (
                                                        <DropdownMenuItem>
                                                            <ArrowRight className="w-4 h-4 mr-2" /> Convert to Invoice
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleDeleteQuotation(quotation.id!)}
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

                {filteredQuotations.length === 0 && (
                    <Card className="border-dashed border-2 border-gray-200">
                        <CardContent className="p-12 text-center">
                            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first quotation to get started'}
                            </p>
                            <Button onClick={handleNewQuotation}>
                                <Plus className="w-4 h-4 mr-2" /> Create Quotation
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
                            {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Quotation Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label>Quotation Number</Label>
                                <Input
                                    value={formData.quotation_number}
                                    onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={formData.quotation_date}
                                    onChange={(e) => setFormData({ ...formData, quotation_date: e.target.value })}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>Valid for (days)</Label>
                                <Select
                                    value={String(formData.validity_days)}
                                    onValueChange={(v) => setFormData({ ...formData, validity_days: parseInt(v) })}
                                >
                                    <SelectTrigger className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7">7 days</SelectItem>
                                        <SelectItem value="15">15 days</SelectItem>
                                        <SelectItem value="30">30 days</SelectItem>
                                        <SelectItem value="45">45 days</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                <FileCheck className="w-4 h-4" /> Services & Pricing
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
                                        <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                            <span>Grand Total</span>
                                            <span className="text-orange-600">₹{formData.grand_total?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        {/* Terms */}
                        <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Terms</Label>
                                    <Textarea
                                        value={formData.payment_terms}
                                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="e.g., 50% advance, balance on delivery"
                                    />
                                </div>
                                <div>
                                    <Label>Notes</Label>
                                    <Textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="mt-1"
                                        rows={2}
                                        placeholder="Additional notes for the client"
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
                                onClick={handleSaveQuotation}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                            >
                                {editingQuotation ? 'Update Quotation' : 'Create Quotation'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Preview Dialog */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:m-0 print:shadow-none">
                    {previewQuotation && (
                        <div className="quotation-preview p-8 bg-white print:p-0">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-orange-500">
                                <div>
                                    <h1 className="text-3xl font-bold text-orange-600">URDIGIX</h1>
                                    <p className="text-gray-500 text-sm mt-1">Digital Marketing Agency</p>
                                    <p className="text-gray-500 text-sm">hello@urdigix.com | +91 78930 40375</p>
                                    <p className="text-gray-500 text-sm">India</p>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-2xl font-bold text-gray-900">QUOTATION</h2>
                                    <p className="text-gray-600 font-medium mt-2">{previewQuotation.quotation_number}</p>
                                    <p className="text-sm text-gray-500">Date: {format(new Date(previewQuotation.quotation_date), 'dd MMM yyyy')}</p>
                                    <p className="text-sm text-gray-500">Valid Until: {format(new Date(previewQuotation.valid_until), 'dd MMM yyyy')}</p>
                                </div>
                            </div>

                            {/* Client Info */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Bill To</h3>
                                <p className="font-bold text-gray-900">{previewQuotation.client_name}</p>
                                {previewQuotation.client_business_name && (
                                    <p className="text-gray-600">{previewQuotation.client_business_name}</p>
                                )}
                                {previewQuotation.client_email && (
                                    <p className="text-gray-500 text-sm">{previewQuotation.client_email}</p>
                                )}
                                {previewQuotation.client_phone && (
                                    <p className="text-gray-500 text-sm">{previewQuotation.client_phone}</p>
                                )}
                                {previewQuotation.client_address && (
                                    <p className="text-gray-500 text-sm">{previewQuotation.client_address}</p>
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
                                    {previewQuotation.items?.map((item, index) => (
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
                                        <span>₹{previewQuotation.subtotal.toLocaleString()}</span>
                                    </div>
                                    {previewQuotation.discount_amount > 0 && (
                                        <div className="flex justify-between py-2 text-green-600">
                                            <span>Discount</span>
                                            <span>- ₹{previewQuotation.discount_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {previewQuotation.gst_amount > 0 && (
                                        <div className="flex justify-between py-2 text-gray-500">
                                            <span>GST ({previewQuotation.gst_percentage}%)</span>
                                            <span>₹{previewQuotation.gst_amount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 font-bold text-lg border-t-2 border-orange-500">
                                        <span>Grand Total</span>
                                        <span className="text-orange-600">₹{previewQuotation.grand_total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            {previewQuotation.payment_terms && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Payment Terms</h3>
                                    <p className="text-gray-600 text-sm">{previewQuotation.payment_terms}</p>
                                </div>
                            )}

                            {previewQuotation.notes && (
                                <div className="mb-6">
                                    <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                                    <p className="text-gray-600 text-sm">{previewQuotation.notes}</p>
                                </div>
                            )}

                            {/* Footer */}
                            <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
                                <p>Thank you for your business!</p>
                                <p className="mt-2">URDIGIX | www.urdigix.com | hello@urdigix.com</p>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4 print:hidden">
                        <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={() => window.print()}>
                            <Download className="w-4 h-4 mr-2" /> Download PDF
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
};
