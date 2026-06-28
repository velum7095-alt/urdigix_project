import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileCheck, Plus, Search, Filter, Calendar, MessageSquare, Phone,
    Mail, CheckCircle, Clock, Trash2, Edit, FileText, Check,
    ExternalLink, AlertCircle, MapPin, Send, Download, RefreshCw, Briefcase, Award, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { supabase } from '@/integrations/supabase/client';
import { generateContractPDF } from '@/utils/pdfGenerator';

// ============================================
// TYPES & SCHEMAS
// ============================================

export interface ContractItem {
    id?: string;
    contract_id?: string;
    service_name: string;
    description: string;
    delivery_time: string;
}

export interface Contract {
    id: string;
    contract_number: string;
    contract_date: string;
    
    // Client info
    client_name: string;
    client_business_name: string;
    client_phone: string;
    client_email: string;
    client_address: string;
    
    // Terms
    project_scope: string;
    payment_terms: string;
    project_timeline: string;
    confidentiality_terms: string;
    ownership_terms: string;
    revisions_terms: string;
    cancellation_policy: string;
    liability_terms: string;
    governing_law: string;
    
    // Signee
    client_signee_name: string;
    client_signee_designation: string;
    client_signee_company: string;
    
    created_at: string;
    items?: ContractItem[];
}

const DEFAULT_SCOPE = 'The Service Provider agrees to provide the design and marketing services as per the approved proposal and scope of work mutually agreed upon by both parties.';
const DEFAULT_PAYMENT = '• 50% advance payment is required to initiate the project.\n• 50% balance payment upon completion before final delivery.\n• All payments are non-refundable once work has been initiated.\n• Payments can be made via bank transfer / UPI as shared by the provider.';
const DEFAULT_TIMELINE = 'The project timeline will be confirmed after finalizing the requirements and receiving the advance payment. Delays in providing content or feedback may affect delivery timelines.';
const DEFAULT_CONFIDENTIALITY = 'Both parties agree to keep all confidential information shared during the project strictly private and not disclose it to any third party.';
const DEFAULT_OWNERSHIP = 'Upon full payment, the client will own the final deliverables. The provider retains the right to showcase the work in the portfolio.';
const DEFAULT_REVISIONS = '• Each deliverable includes up to 2 rounds of revisions.\n• Additional revisions beyond the included rounds will be chargeable.\n• Feedback should be provided within the agreed timeline to avoid delays.';
const DEFAULT_CANCELLATION = '• If the client cancels the project before completion, the advance payment is non-refundable.\n• If cancellation is made after work has started, charges will be calculated based on the work completed.';
const DEFAULT_LIABILITY = 'The Service Provider shall not be liable for any indirect, incidental, or consequential damages arising from the use of the deliverables or any delay in delivery due to circumstances beyond control.';
const DEFAULT_LAW = 'This contract shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the jurisdiction of the courts in Bangalore, Karnataka.';

// ============================================
// MOCK DATA FALLBACK
// ============================================

const MOCK_CONTRACTS: Contract[] = [
    {
        id: 'con-1',
        contract_number: 'UDX-CON-2026-0001',
        contract_date: '2026-06-27',
        client_name: 'John Doe',
        client_business_name: 'ABC Technologies Pvt. Ltd.',
        client_phone: '+919876543210',
        client_email: 'johndoe@abctechnologies.com',
        client_address: '123 Business Park, Bangalore, Karnataka - 560001',
        project_scope: DEFAULT_SCOPE,
        payment_terms: DEFAULT_PAYMENT,
        project_timeline: DEFAULT_TIMELINE,
        confidentiality_terms: DEFAULT_CONFIDENTIALITY,
        ownership_terms: DEFAULT_OWNERSHIP,
        revisions_terms: DEFAULT_REVISIONS,
        cancellation_policy: DEFAULT_CANCELLATION,
        liability_terms: DEFAULT_LIABILITY,
        governing_law: DEFAULT_LAW,
        client_signee_name: 'John Doe',
        client_signee_designation: 'Marketing Manager',
        client_signee_company: 'ABC Technologies Pvt. Ltd.',
        created_at: new Date().toISOString(),
        items: [
            { service_name: 'Social Media Poster Design', description: 'High-quality custom poster for social media', delivery_time: '3-5 Days' },
            { service_name: 'Creative Banner Design', description: 'Custom banner for website / promotions', delivery_time: '3-5 Days' },
            { service_name: 'Content Design & Copy Writing', description: 'Engaging content with design', delivery_time: '5-7 Days' },
            { service_name: 'Branding Design Package', description: 'Logo, color palette, typography & more', delivery_time: '7-10 Days' },
            { service_name: 'Ad Creative Pack', description: 'Multiple ad creatives for campaigns', delivery_time: '4-6 Days' }
        ]
    }
];

export const ContractsManager = () => {
    const { toast } = useToast();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dbMissing, setDbMissing] = useState(false);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');

    // Dialog Modal
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingContract, setEditingContract] = useState<Contract | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewContract, setPreviewContract] = useState<Contract | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Contract>>({});
    const [items, setItems] = useState<ContractItem[]>([{ service_name: '', description: '', delivery_time: '' }]);

    useEffect(() => {
        loadContracts();
    }, []);

    const loadContracts = async () => {
        try {
            setIsLoading(true);
            setDbMissing(false);

            // Fetch contracts
            const { data: contractsData, error: contractsError } = await supabase
                .from('contracts')
                .select('*')
                .order('created_at', { ascending: false });

            if (contractsError) {
                console.warn('Contracts tables not found. Activating offline mode.');
                setDbMissing(true);
                setContracts(MOCK_CONTRACTS);
                if (MOCK_CONTRACTS.length > 0) setSelectedContract(MOCK_CONTRACTS[0]);
            } else {
                // Fetch items for each contract
                const enrichedContracts = await Promise.all(
                    (contractsData || []).map(async (con) => {
                        const { data: itemsData } = await supabase
                            .from('contract_items')
                            .select('*')
                            .eq('contract_id', con.id)
                            .order('sort_order', { ascending: true });
                        return { ...con, items: itemsData || [] };
                    })
                );
                setContracts(enrichedContracts);
                if (enrichedContracts.length > 0) setSelectedContract(enrichedContracts[0]);
            }
        } catch (error) {
            console.error('Error loading contracts:', error);
            setDbMissing(true);
            setContracts(MOCK_CONTRACTS);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate contract number
    const getNextContractNumber = () => {
        const year = new Date().getFullYear();
        const yearContracts = contracts.filter(c => c.contract_number.startsWith(`UDX-CON-${year}-`));
        const maxNum = yearContracts.reduce((max, c) => {
            const numPart = parseInt(c.contract_number.split('-').pop() || '0');
            return numPart > max ? numPart : max;
        }, 0);
        const nextNum = String(maxNum + 1).padStart(4, '0');
        return `UDX-CON-${year}-${nextNum}`;
    };

    const handleNewContract = () => {
        setEditingContract(null);
        setFormData({
            contract_number: getNextContractNumber(),
            contract_date: new Date().toISOString().split('T')[0],
            client_name: '',
            client_business_name: '',
            client_phone: '',
            client_email: '',
            client_address: '',
            project_scope: DEFAULT_SCOPE,
            payment_terms: DEFAULT_PAYMENT,
            project_timeline: DEFAULT_TIMELINE,
            confidentiality_terms: DEFAULT_CONFIDENTIALITY,
            ownership_terms: DEFAULT_OWNERSHIP,
            revisions_terms: DEFAULT_REVISIONS,
            cancellation_policy: DEFAULT_CANCELLATION,
            liability_terms: DEFAULT_LIABILITY,
            governing_law: DEFAULT_LAW,
            client_signee_name: '',
            client_signee_designation: '',
            client_signee_company: '',
        });
        setItems([{ service_name: '', description: '', delivery_time: '' }]);
        setIsFormOpen(true);
    };

    const handleEditContract = (contract: Contract) => {
        setEditingContract(contract);
        setFormData(contract);
        setItems(contract.items || [{ service_name: '', description: '', delivery_time: '' }]);
        setIsFormOpen(true);
    };

    const handleAddItem = () => {
        setItems([...items, { service_name: '', description: '', delivery_time: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ContractItem, value: string) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    const handleSaveContract = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.client_name?.trim()) {
            toast({ title: 'Client name is required', variant: 'destructive' });
            return;
        }
        if (items.some(it => !it.service_name.trim())) {
            toast({ title: 'Service name is required for all deliverables', variant: 'destructive' });
            return;
        }

        try {
            if (dbMissing) {
                if (editingContract) {
                    const updated = contracts.map(c => c.id === editingContract.id ? { ...c, ...formData, items } as Contract : c);
                    setContracts(updated);
                    setSelectedContract({ ...selectedContract, ...formData, items } as Contract);
                    toast({ title: 'Contract updated (Demo Mode)' });
                } else {
                    const newCon: Contract = {
                        id: `con-${Date.now()}`,
                        ...formData,
                        items,
                        created_at: new Date().toISOString()
                    } as Contract;
                    setContracts([newCon, ...contracts]);
                    setSelectedContract(newCon);
                    toast({ title: 'Contract registered (Demo Mode)' });
                }
                setIsFormOpen(false);
                return;
            }

            // Real DB insert/update
            if (editingContract) {
                const { data, error } = await supabase
                    .from('contracts')
                    .update(formData)
                    .eq('id', editingContract.id)
                    .select()
                    .single();

                if (error) throw error;

                // Delete old items & insert new
                await supabase.from('contract_items').delete().eq('contract_id', editingContract.id);
                await supabase.from('contract_items').insert(
                    items.map((it, idx) => ({ ...it, contract_id: editingContract.id, sort_order: idx }))
                );

                toast({ title: 'Contract updated successfully' });
            } else {
                const { data, error } = await supabase
                    .from('contracts')
                    .insert([formData])
                    .select()
                    .single();

                if (error) throw error;

                await supabase.from('contract_items').insert(
                    items.map((it, idx) => ({ ...it, contract_id: data.id, sort_order: idx }))
                );

                toast({ title: 'Contract created successfully' });
            }
            setIsFormOpen(false);
            loadContracts();
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    const handleDeleteContract = async (id: string) => {
        if (!confirm('Are you sure you want to delete this contract?')) return;
        try {
            if (dbMissing) {
                setContracts(contracts.filter(c => c.id !== id));
                setSelectedContract(null);
                toast({ title: 'Contract deleted (Demo Mode)' });
                return;
            }

            const { error } = await supabase.from('contracts').delete().eq('id', id);
            if (error) throw error;
            setContracts(contracts.filter(c => c.id !== id));
            setSelectedContract(null);
            toast({ title: 'Contract removed successfully' });
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        }
    };

    const handleDownloadPDF = (contract: Contract) => {
        generateContractPDF(contract);
        toast({ title: 'Contract PDF Downloaded' });
    };

    const handlePreview = (contract: Contract) => {
        setPreviewContract(contract);
        setIsPreviewOpen(true);
    };

    // Filtered lists
    const filteredContracts = contracts.filter(c => {
        const query = searchQuery.toLowerCase();
        return c.client_name.toLowerCase().includes(query) ||
            c.contract_number.toLowerCase().includes(query) ||
            c.client_business_name.toLowerCase().includes(query) ||
            (c.items || []).some(it => it.service_name.toLowerCase().includes(query));
    });

    return (
        <div className="space-y-6">
            {dbMissing && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <span>
                        <strong>Demo Mode Active:</strong> Database migrations have not been applied yet. Data will reset on reload. Apply SQL schemas to persist contract records.
                    </span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-1">Contract Management</h2>
                    <p className="text-muted-foreground text-sm">Generate project service agreements, deliverable timelines, and legal sign-off terms.</p>
                </div>
                <Button onClick={handleNewContract} className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 shadow-md">
                    <Plus className="w-4 h-4 mr-2" /> Create Contract
                </Button>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Agreements</p>
                                <h3 className="text-2xl font-bold mt-1 font-display">{contracts.length}</h3>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-xl"><Briefcase className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Sign-off</p>
                                <h3 className="text-2xl font-bold mt-1 font-display text-blue-600">
                                    {contracts.filter(c => !c.client_signee_name).length}
                                </h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-xl"><Clock className="w-5 h-5 text-blue-500" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signed / Active</p>
                                <h3 className="text-2xl font-bold mt-1 font-display text-emerald-600">
                                    {contracts.filter(c => c.client_signee_name).length}
                                </h3>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-xl"><Award className="w-5 h-5 text-emerald-500" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split CRM panel layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Listing */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold">Contract Registry</CardTitle>
                            <span className="text-xs text-muted-foreground">{filteredContracts.length} matched</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by ID, client, service..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-10 border-border/70 focus:border-primary/50"
                                />
                            </div>

                            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                                <AnimatePresence>
                                    {isLoading ? (
                                        <div className="py-12 text-center text-muted-foreground text-sm">Loading contracts...</div>
                                    ) : filteredContracts.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground text-sm">No contract agreements found.</div>
                                    ) : (
                                        filteredContracts.map((c) => (
                                            <motion.div
                                                key={c.id}
                                                layoutId={`contract-${c.id}`}
                                                onClick={() => setSelectedContract(c)}
                                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                    selectedContract?.id === c.id
                                                        ? 'border-primary bg-primary/5 shadow-sm'
                                                        : 'border-border/60 hover:border-primary/40 hover:bg-secondary/20'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="font-semibold text-sm leading-tight">{c.client_name}</h4>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{c.contract_number}</p>
                                                    </div>
                                                    <Badge className={`text-[10px] px-1.5 py-0.5 border ${
                                                        c.client_signee_name ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    } font-medium`}>
                                                        {c.client_signee_name ? 'SIGNED' : 'DRAFT'}
                                                    </Badge>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Details Panel */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {selectedContract ? (
                            <motion.div
                                key={selectedContract.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4"
                            >
                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary/10 to-orange-600/5 p-4 border-b border-border/40 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-display font-bold leading-tight">{selectedContract.client_name}</h3>
                                                <Badge className={`text-xs ${
                                                    selectedContract.client_signee_name ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'
                                                } border font-medium`}>
                                                    {selectedContract.contract_number}
                                                </Badge>
                                            </div>
                                            {selectedContract.client_business_name && (
                                                <p className="text-xs text-muted-foreground mt-1">{selectedContract.client_business_name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handlePreview(selectedContract)} title="Preview Agreement">
                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDownloadPDF(selectedContract)} title="Download PDF">
                                                <Download className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleEditContract(selectedContract)} title="Edit Contract">
                                                <Edit className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDeleteContract(selectedContract.id)} title="Delete Contract" className="hover:border-red-200 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        {/* Deliverables summary */}
                                        <div className="space-y-3">
                                            <h4 className="text-sm font-semibold flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-primary" /> Deliverables Schedule</h4>
                                            <div className="border border-border/40 rounded-xl overflow-hidden text-xs">
                                                <table className="w-full">
                                                    <thead>
                                                        <tr className="bg-secondary/40 border-b border-border/40 text-muted-foreground font-semibold">
                                                            <th className="p-2.5 text-left">Deliverable</th>
                                                            <th className="p-2.5 text-right">Delivery Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedContract.items?.map((it, i) => (
                                                            <tr key={i} className="border-b border-border/20 last:border-0 hover:bg-secondary/10">
                                                                <td className="p-2.5">
                                                                    <p className="font-semibold text-foreground">{it.service_name}</p>
                                                                    {it.description && <p className="text-[10px] text-muted-foreground mt-0.5">{it.description}</p>}
                                                                </td>
                                                                <td className="p-2.5 text-right font-medium text-primary">{it.delivery_time || '3-5 Days'}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <hr className="border-border/40" />

                                        {/* Client Signee Info */}
                                        <div className="grid md:grid-cols-2 gap-4 text-sm bg-secondary/20 p-4 rounded-xl border border-border/30">
                                            <div className="md:col-span-2">
                                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Client Sign-Off Status</h4>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground block">Signee Name</span>
                                                <span className="font-semibold">{selectedContract.client_signee_name || 'Not Signed Yet'}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs text-muted-foreground block">Designation</span>
                                                <span className="font-medium">{selectedContract.client_signee_designation || 'Not Specified'}</span>
                                            </div>
                                            <div className="md:col-span-2">
                                                <span className="text-xs text-muted-foreground block">Signing Company</span>
                                                <span className="font-medium">{selectedContract.client_signee_company || 'Not Specified'}</span>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="p-12 text-center border border-dashed border-border/50 rounded-2xl text-muted-foreground text-sm">
                                <Briefcase className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                Select an agreement from the registry to view details, terms, and signature sheets.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ============================================
                DIALOG MODAL: CREATE/EDIT CONTRACT
               ============================================ */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingContract ? 'Edit Service Agreement' : 'Generate Project Contract'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveContract} className="space-y-6 pt-2 text-sm">
                        
                        {/* Meta Fields */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="con-number">Contract Number *</Label>
                                <Input id="con-number" value={formData.contract_number || ''} readOnly />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="con-date">Contract Date *</Label>
                                <Input
                                    id="con-date"
                                    type="date"
                                    value={formData.contract_date || ''}
                                    onChange={(e) => setFormData({ ...formData, contract_date: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Client details */}
                        <div className="border-t pt-4 space-y-3">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Client Identity</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="client-n">Client Name *</Label>
                                    <Input
                                        id="client-n"
                                        value={formData.client_name || ''}
                                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                        placeholder="Full client name"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="client-b">Business / Company</Label>
                                    <Input
                                        id="client-b"
                                        value={formData.client_business_name || ''}
                                        onChange={(e) => setFormData({ ...formData, client_business_name: e.target.value })}
                                        placeholder="ABC Technologies"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="client-p">Phone</Label>
                                    <Input
                                        id="client-p"
                                        value={formData.client_phone || ''}
                                        onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="client-e">Email</Label>
                                    <Input
                                        id="client-e"
                                        type="email"
                                        value={formData.client_email || ''}
                                        onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="client-a">Address</Label>
                                <Input
                                    id="client-a"
                                    value={formData.client_address || ''}
                                    onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Deliverables / Scope list */}
                        <div className="border-t pt-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Service Deliverables Schedule</h4>
                                <Button type="button" size="sm" onClick={handleAddItem} variant="outline" className="h-7 text-[10px]">
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Deliverable
                                </Button>
                            </div>
                            
                            <div className="space-y-2">
                                {items.map((item, idx) => (
                                    <div key={idx} className="flex gap-2 items-start border p-3 rounded-lg bg-secondary/10">
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder="Service Name (e.g. Website Design)"
                                                    value={item.service_name}
                                                    onChange={(e) => handleItemChange(idx, 'service_name', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder="Description (optional)"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Input
                                                    placeholder="Delivery Time (e.g. 3-5 Days)"
                                                    value={item.delivery_time}
                                                    onChange={(e) => handleItemChange(idx, 'delivery_time', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveItem(idx)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            disabled={items.length === 1}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Project Terms */}
                        <div className="border-t pt-4 space-y-3">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Agreement Clauses & Terms</h4>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>1. Project Scope</Label>
                                    <Textarea
                                        value={formData.project_scope || ''}
                                        onChange={(e) => setFormData({ ...formData, project_scope: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>2. Payment Terms</Label>
                                    <Textarea
                                        value={formData.payment_terms || ''}
                                        onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>3. Project Timeline</Label>
                                    <Textarea
                                        value={formData.project_timeline || ''}
                                        onChange={(e) => setFormData({ ...formData, project_timeline: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>4. Confidentiality</Label>
                                    <Textarea
                                        value={formData.confidentiality_terms || ''}
                                        onChange={(e) => setFormData({ ...formData, confidentiality_terms: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>5. Ownership</Label>
                                    <Textarea
                                        value={formData.ownership_terms || ''}
                                        onChange={(e) => setFormData({ ...formData, ownership_terms: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>6. Revisions & Feedback</Label>
                                    <Textarea
                                        value={formData.revisions_terms || ''}
                                        onChange={(e) => setFormData({ ...formData, revisions_terms: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label>7. Cancellation Policy</Label>
                                    <Textarea
                                        value={formData.cancellation_policy || ''}
                                        onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>8. Liability Terms</Label>
                                    <Textarea
                                        value={formData.liability_terms || ''}
                                        onChange={(e) => setFormData({ ...formData, liability_terms: e.target.value })}
                                        rows={2}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label>9. Governing Law</Label>
                                <Textarea
                                    value={formData.governing_law || ''}
                                    onChange={(e) => setFormData({ ...formData, governing_law: e.target.value })}
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Sign-Off details */}
                        <div className="border-t pt-4 space-y-3">
                            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Client Authorized Signee (Agreement execution)</h4>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="sig-name">Signee Name</Label>
                                    <Input
                                        id="sig-name"
                                        value={formData.client_signee_name || ''}
                                        onChange={(e) => setFormData({ ...formData, client_signee_name: e.target.value })}
                                        placeholder="E.g. John Doe"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="sig-des">Signee Designation</Label>
                                    <Input
                                        id="sig-des"
                                        value={formData.client_signee_designation || ''}
                                        onChange={(e) => setFormData({ ...formData, client_signee_designation: e.target.value })}
                                        placeholder="E.g. Marketing Director"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="sig-comp">Signee Company</Label>
                                    <Input
                                        id="sig-comp"
                                        value={formData.client_signee_company || ''}
                                        onChange={(e) => setFormData({ ...formData, client_signee_company: e.target.value })}
                                        placeholder="E.g. ABC Technologies"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Save Agreement</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================
                DIALOG MODAL: CONTRACT PREVIEW
               ============================================ */}
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 text-slate-100 p-0 border-slate-700">
                    <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center sticky top-0 z-50">
                        <DialogTitle className="text-slate-100 font-display">Agreement Document Preview</DialogTitle>
                        <div className="flex gap-2">
                            <Button onClick={() => handleDownloadPDF(previewContract!)} className="bg-primary hover:bg-primary/95 text-white">
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </Button>
                            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                                Close
                            </Button>
                        </div>
                    </div>
                    {previewContract && (
                        <div className="p-8 space-y-8 bg-white text-slate-900 max-w-3xl mx-auto my-4 shadow-xl border border-slate-200 text-sm">
                            {/* Page 1 Mock Preview */}
                            <div className="border border-slate-300 p-6 rounded-lg space-y-6">
                                <div className="flex justify-between items-start border-b pb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-orange-600">URDIGIX</h2>
                                        <p className="text-xs text-slate-500">WE DESIGN. YOU GROW.</p>
                                    </div>
                                    <div className="text-right">
                                        <h3 className="text-lg font-bold">CONTRACT</h3>
                                        <p className="text-xs text-slate-500">{previewContract.contract_number}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <span className="font-bold text-orange-600">CLIENT:</span>
                                        <p className="font-semibold">{previewContract.client_name}</p>
                                        <p className="text-slate-500">{previewContract.client_address}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-orange-600">SERVICE PROVIDER:</span>
                                        <p className="font-semibold">URDIGIX</p>
                                        <p className="text-slate-500">Bangalore, Karnataka, India</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-orange-600">1. PROJECT SCOPE</h4>
                                    <p className="text-xs text-slate-600">{previewContract.project_scope}</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-orange-600">DELIVERABLES / SERVICES</h4>
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-100 border-b">
                                                <th className="p-2 text-left">Service</th>
                                                <th className="p-2 text-left">Description</th>
                                                <th className="p-2 text-right">Delivery Time</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewContract.items?.map((it, i) => (
                                                <tr key={i} className="border-b">
                                                    <td className="p-2 font-semibold">{it.service_name}</td>
                                                    <td className="p-2 text-slate-500">{it.description}</td>
                                                    <td className="p-2 text-right text-orange-600 font-bold">{it.delivery_time}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <h5 className="font-bold text-orange-600">2. PAYMENT TERMS</h5>
                                        <p className="text-slate-500 whitespace-pre-line">{previewContract.payment_terms}</p>
                                    </div>
                                    <div>
                                        <h5 className="font-bold text-orange-600">3. PROJECT TIMELINE</h5>
                                        <p className="text-slate-500 whitespace-pre-line">{previewContract.project_timeline}</p>
                                    </div>
                                </div>
                                <div className="text-center text-[10px] text-slate-400 border-t pt-4">Page 01</div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};
