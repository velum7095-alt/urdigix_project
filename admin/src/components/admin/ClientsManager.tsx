import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Search, Filter, Calendar, MessageSquare, Phone,
    Mail, CheckCircle, Clock, Trash2, Edit, FileText, Check,
    ExternalLink, AlertCircle, MapPin, Send, MessageCircle, RefreshCw, TrendingUp,
    Facebook, Instagram, Globe
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

// ============================================
// TYPES & SCHEMAS
// ============================================

export interface Client {
    id: string;
    name: string;
    business_name: string;
    phone: string;
    email: string;
    address: string;
    status: 'lead' | 'active' | 'inactive' | 'completed';
    facebook_url?: string;
    instagram_url?: string;
    whatsapp_number?: string;
    website_url?: string;
    referral_source?: string;
    contact_type?: 'direct' | 'facebook' | 'instagram' | 'whatsapp' | 'website' | 'referral' | 'other';
    created_at: string;
}

export interface FollowUp {
    id: string;
    client_id: string;
    follow_up_date: string;
    notes: string;
    status: 'pending' | 'completed' | 'cancelled' | 'rescheduled';
    medium: 'phone' | 'whatsapp' | 'email' | 'in_person';
    created_at: string;
}

const CLIENT_STATUS_CONFIG = {
    lead: { label: 'Lead / Prospect', color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100' },
    active: { label: 'Active Client', color: 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-100' },
    inactive: { label: 'Inactive / Cold', color: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100' },
    completed: { label: 'Project Completed', color: 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100' },
};

const FOLLOW_UP_STATUS_CONFIG = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Trash2 },
    rescheduled: { label: 'Rescheduled', color: 'bg-indigo-100 text-indigo-800', icon: RefreshCw },
};

const MEDIUM_ICONS = {
    phone: Phone,
    whatsapp: MessageCircle,
    email: Mail,
    in_person: MapPin,
};

// ============================================
// MOCK DATA (Fallback for missing tables)
// ============================================

const MOCK_CLIENTS: Client[] = [
    {
        id: 'mock-1',
        name: 'Aarav Mehta',
        business_name: 'Mehta Jewelers',
        phone: '+919876543210',
        email: 'aarav@mehtajewelers.com',
        address: 'MG Road, Bangalore, Karnataka',
        status: 'active',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-2',
        name: 'Priya Sharma',
        business_name: 'Shine Digital Solutions',
        phone: '+918765432109',
        email: 'priya@shinedigital.com',
        address: 'Hitech City, Hyderabad, Telangana',
        status: 'lead',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'mock-3',
        name: 'Rohan Das',
        business_name: 'Das Foods & Spices',
        phone: '+917654321098',
        email: 'rohan@dasfoods.in',
        address: 'Salt Lake Sector V, Kolkata, West Bengal',
        status: 'completed',
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    }
];

const MOCK_FOLLOW_UPS: FollowUp[] = [
    {
        id: 'fup-1',
        client_id: 'mock-1',
        follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Review social media marketing proposal and ad budget estimates.',
        status: 'pending',
        medium: 'phone',
        created_at: new Date().toISOString(),
    },
    {
        id: 'fup-2',
        client_id: 'mock-2',
        follow_up_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Send WhatsApp quote for custom web app development contract.',
        status: 'pending',
        medium: 'whatsapp',
        created_at: new Date().toISOString(),
    },
    {
        id: 'fup-3',
        client_id: 'mock-1',
        follow_up_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Initial strategy meeting - aligned on logo requirements.',
        status: 'completed',
        medium: 'in_person',
        created_at: new Date().toISOString(),
    }
];

export const ClientsManager = () => {
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [followUps, setFollowUps] = useState<FollowUp[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [dbMissing, setDbMissing] = useState(false);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Dialog Modals
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

    // Form states
    const [clientForm, setClientForm] = useState<Partial<Client>>({
        name: '', business_name: '', phone: '', email: '', address: '', status: 'lead',
        facebook_url: '', instagram_url: '', whatsapp_number: '', website_url: '',
        referral_source: '', contact_type: 'direct'
    });
    const [followUpForm, setFollowUpForm] = useState<Partial<FollowUp>>({
        follow_up_date: '', notes: '', status: 'pending', medium: 'phone'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setDbMissing(false);

            // Fetch Clients
            const { data: clientsData, error: clientsError } = await supabase
                .from('clients')
                .select('*')
                .order('created_at', { ascending: false });

            // Fetch Follow-ups
            const { data: followUpsData, error: followUpsError } = await supabase
                .from('client_follow_ups')
                .select('*')
                .order('follow_up_date', { ascending: true });

            if (clientsError || followUpsError) {
                // If tables do not exist yet, trigger fallback
                console.warn('Database tables not found. Using local/fallback mode.');
                setDbMissing(true);
                setClients(MOCK_CLIENTS);
                setFollowUps(MOCK_FOLLOW_UPS);
                if (MOCK_CLIENTS.length > 0) {
                    setSelectedClient(MOCK_CLIENTS[0]);
                }
            } else {
                setClients(clientsData || []);
                setFollowUps(followUpsData || []);
                if (clientsData && clientsData.length > 0) {
                    setSelectedClient(clientsData[0]);
                }
            }
        } catch (error) {
            console.error('Error loading CRM data:', error);
            setDbMissing(true);
            setClients(MOCK_CLIENTS);
            setFollowUps(MOCK_FOLLOW_UPS);
        } finally {
            setIsLoading(false);
        }
    };

    // ============================================
    // CLIENT ACTIONS
    // ============================================

    const handleOpenClientModal = (client: Client | null = null) => {
        if (client) {
            setEditingClient(client);
            setClientForm(client);
        } else {
            setEditingClient(null);
            setClientForm({
                name: '', business_name: '', phone: '', email: '', address: '', status: 'lead',
                facebook_url: '', instagram_url: '', whatsapp_number: '', website_url: '',
                referral_source: '', contact_type: 'direct'
            });
        }
        setIsClientModalOpen(true);
    };

    const handleSaveClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!clientForm.name?.trim()) {
            toast({ title: 'Name is required', variant: 'destructive' });
            return;
        }

        try {
            if (dbMissing) {
                // Local mock fallback
                if (editingClient) {
                    const updated = clients.map(c => c.id === editingClient.id ? { ...c, ...clientForm } as Client : c);
                    setClients(updated);
                    if (selectedClient?.id === editingClient.id) {
                        setSelectedClient({ ...selectedClient, ...clientForm } as Client);
                    }
                    toast({ title: 'Client details updated (Demo Mode)' });
                } else {
                    const newClient: Client = {
                        id: `mock-${Date.now()}`,
                        name: clientForm.name,
                        business_name: clientForm.business_name || '',
                        phone: clientForm.phone || '',
                        email: clientForm.email || '',
                        address: clientForm.address || '',
                        status: clientForm.status as any || 'lead',
                        facebook_url: clientForm.facebook_url || '',
                        instagram_url: clientForm.instagram_url || '',
                        whatsapp_number: clientForm.whatsapp_number || '',
                        website_url: clientForm.website_url || '',
                        referral_source: clientForm.referral_source || '',
                        contact_type: clientForm.contact_type as any || 'direct',
                        created_at: new Date().toISOString()
                    };
                    setClients([newClient, ...clients]);
                    setSelectedClient(newClient);
                    toast({ title: 'Client added successfully (Demo Mode)' });
                }
                setIsClientModalOpen(false);
                return;
            }

            // Real DB Save
            if (editingClient) {
                const { data, error } = await supabase
                    .from('clients')
                    .update(clientForm)
                    .eq('id', editingClient.id)
                    .select()
                    .single();

                if (error) throw error;
                const updated = clients.map(c => c.id === editingClient.id ? data : c);
                setClients(updated);
                setSelectedClient(data);
                toast({ title: 'Client details updated successfully' });
            } else {
                const { data, error } = await supabase
                    .from('clients')
                    .insert([clientForm])
                    .select()
                    .single();

                if (error) throw error;
                setClients([data, ...clients]);
                setSelectedClient(data);
                toast({ title: 'Client registered successfully' });
            }
            setIsClientModalOpen(false);
        } catch (err: any) {
            toast({ title: 'Save failed', description: err.message, variant: 'destructive' });
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm('Are you sure you want to delete this client and all associated follow-ups?')) return;

        try {
            if (dbMissing) {
                setClients(clients.filter(c => c.id !== id));
                setFollowUps(followUps.filter(f => f.client_id !== id));
                setSelectedClient(null);
                toast({ title: 'Client deleted (Demo Mode)' });
                return;
            }

            const { error } = await supabase.from('clients').delete().eq('id', id);
            if (error) throw error;

            setClients(clients.filter(c => c.id !== id));
            setFollowUps(followUps.filter(f => f.client_id !== id));
            setSelectedClient(null);
            toast({ title: 'Client removed successfully' });
        } catch (err: any) {
            toast({ title: 'Delete failed', description: err.message, variant: 'destructive' });
        }
    };

    // ============================================
    // FOLLOW-UP ACTIONS
    // ============================================

    const handleOpenFollowUpModal = () => {
        if (!selectedClient) {
            toast({ title: 'Select a client first', variant: 'destructive' });
            return;
        }
        setFollowUpForm({
            follow_up_date: new Date().toISOString().slice(0, 16),
            notes: '',
            status: 'pending',
            medium: 'phone'
        });
        setIsFollowUpModalOpen(true);
    };

    const handleSaveFollowUp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!followUpForm.follow_up_date || !followUpForm.notes?.trim()) {
            toast({ title: 'Please complete all required fields', variant: 'destructive' });
            return;
        }

        try {
            const payload = {
                client_id: selectedClient!.id,
                follow_up_date: new Date(followUpForm.follow_up_date).toISOString(),
                notes: followUpForm.notes,
                status: followUpForm.status || 'pending',
                medium: followUpForm.medium || 'phone'
            };

            if (dbMissing) {
                const newFup: FollowUp = {
                    id: `fup-${Date.now()}`,
                    ...payload,
                    created_at: new Date().toISOString()
                } as FollowUp;
                setFollowUps([...followUps, newFup]);
                toast({ title: 'Follow-up scheduled (Demo Mode)' });
                setIsFollowUpModalOpen(false);
                return;
            }

            const { data, error } = await supabase
                .from('client_follow_ups')
                .insert([payload])
                .select()
                .single();

            if (error) throw error;
            setFollowUps([...followUps, data]);
            toast({ title: 'Follow-up scheduled successfully' });
            setIsFollowUpModalOpen(false);
        } catch (err: any) {
            toast({ title: 'Scheduling failed', description: err.message, variant: 'destructive' });
        }
    };

    const handleUpdateFollowUpStatus = async (fupId: string, status: FollowUp['status']) => {
        try {
            if (dbMissing) {
                setFollowUps(followUps.map(f => f.id === fupId ? { ...f, status } : f));
                toast({ title: `Follow-up marked as ${status} (Demo Mode)` });
                return;
            }

            const { error } = await supabase
                .from('client_follow_ups')
                .update({ status })
                .eq('id', fupId);

            if (error) throw error;
            setFollowUps(followUps.map(f => f.id === fupId ? { ...f, status } : f));
            toast({ title: `Follow-up status set to ${status}` });
        } catch (err: any) {
            toast({ title: 'Status update failed', description: err.message, variant: 'destructive' });
        }
    };

    // ============================================
    // UTILITIES & SEND LAUNCHERS
    // ============================================

    const handleSendWhatsApp = (client: Client, messageText: string = '') => {
        const phoneClean = client.phone.replace(/[^0-9+]/g, '');
        const text = encodeURIComponent(messageText || `Hi ${client.name}, this is URDIGIX. Checking in to see if you had any updates regarding our last discussion?`);
        window.open(`https://wa.me/${phoneClean}?text=${text}`, '_blank');
    };

    const handleSendEmail = (client: Client) => {
        window.open(`mailto:${client.email}?subject=Follow%20up%20-%20URDIGIX&body=Hi%20${client.name},%0D%0A%0D%0AHope%20you%20are%20doing%20well.%20I%20wanted%20to%20follow%20up%20on%20our%20last%20discussion...`, '_blank');
    };

    // Filter Logic
    const filteredClients = clients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeFollowUps = followUps.filter(f => f.client_id === selectedClient?.id);

    return (
        <div className="space-y-6">
            {dbMissing && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                    <span>
                        <strong>Demo Mode Active:</strong> Database migrations have not been applied yet. Data will reset on reload. Apply SQL schemas to persist client entries.
                    </span>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-1">Client Management & Follow-ups</h2>
                    <p className="text-muted-foreground text-sm">Record customer details, track leads, and manage client communications.</p>
                </div>
                <Button onClick={() => handleOpenClientModal()} className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 shadow-md">
                    <Plus className="w-4 h-4 mr-2" /> Register Client
                </Button>
            </div>

            {/* Stats Dashboard Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Clients</p>
                                <h3 className="text-2xl font-bold mt-1 font-display">{clients.length}</h3>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-xl"><Users className="w-5 h-5 text-primary" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Leads</p>
                                <h3 className="text-2xl font-bold mt-1 font-display text-blue-600">{clients.filter(c => c.status === 'lead').length}</h3>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-xl"><TrendingUp className="w-5 h-5 text-blue-500" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Action</p>
                                <h3 className="text-2xl font-bold mt-1 font-display text-amber-600">{followUps.filter(f => f.status === 'pending').length}</h3>
                            </div>
                            <div className="p-2 bg-amber-50 rounded-xl"><Clock className="w-5 h-5 text-amber-500" /></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-border/50">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Tasks</p>
                                <h3 className="text-2xl font-bold mt-1 font-display text-emerald-600">{followUps.filter(f => f.status === 'completed').length}</h3>
                            </div>
                            <div className="p-2 bg-emerald-50 rounded-xl"><CheckCircle className="w-5 h-5 text-emerald-500" /></div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Split CRM Panel Layout */}
            <div className="grid lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side: Client Listing & Searches */}
                <div className="lg:col-span-5 space-y-4">
                    <Card className="border-border/50 shadow-sm">
                        <CardHeader className="pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold">Clients Registry</CardTitle>
                            <span className="text-xs text-muted-foreground">{filteredClients.length} matched</span>
                        </CardHeader>
                        <CardContent className="p-4 space-y-3">
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name, company..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-10 border-border/70 focus:border-primary/50"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-[140px] h-10">
                                        <SelectValue placeholder="All Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="lead">Leads</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Client List */}
                            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                                <AnimatePresence>
                                    {isLoading ? (
                                        <div className="py-12 text-center text-muted-foreground text-sm">Loading clients...</div>
                                    ) : filteredClients.length === 0 ? (
                                        <div className="py-12 text-center text-muted-foreground text-sm">No clients found matching query.</div>
                                    ) : (
                                        filteredClients.map((client) => {
                                            const statusCfg = CLIENT_STATUS_CONFIG[client.status];
                                            const hasPending = followUps.some(f => f.client_id === client.id && f.status === 'pending');
                                            return (
                                                <motion.div
                                                    key={client.id}
                                                    layoutId={`client-${client.id}`}
                                                    onClick={() => setSelectedClient(client)}
                                                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                        selectedClient?.id === client.id
                                                            ? 'border-primary bg-primary/5 shadow-sm'
                                                            : 'border-border/60 hover:border-primary/40 hover:bg-secondary/20'
                                                    }`}
                                                >
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div>
                                                            <h4 className="font-semibold text-sm leading-tight">{client.name}</h4>
                                                            {client.business_name && (
                                                                <p className="text-xs text-muted-foreground mt-0.5">{client.business_name}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            {hasPending && (
                                                                <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse" title="Pending follow-up" />
                                                            )}
                                                            <Badge className={`text-[10px] px-1.5 py-0.5 border ${statusCfg.color} font-medium`}>
                                                                {client.status.toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side: Selected Client Detail Panel */}
                <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                        {selectedClient ? (
                            <motion.div
                                key={selectedClient.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="space-y-4"
                            >
                                <Card className="border-border/50 shadow-sm overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary/10 to-orange-600/5 p-4 border-b border-border/40 flex justify-between items-center">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-display font-bold leading-tight">{selectedClient.name}</h3>
                                                <Badge className={`text-xs ${CLIENT_STATUS_CONFIG[selectedClient.status].color} border font-medium`}>
                                                    {selectedClient.status.toUpperCase()}
                                                </Badge>
                                            </div>
                                            {selectedClient.business_name && (
                                                <p className="text-xs text-muted-foreground mt-1">{selectedClient.business_name}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="icon" onClick={() => handleOpenClientModal(selectedClient)} title="Edit Client">
                                                <Edit className="w-4 h-4 text-muted-foreground" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => handleDeleteClient(selectedClient.id)} title="Delete Client" className="hover:border-red-200 hover:bg-red-50">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6 space-y-6">
                                        
                                        {/* Contact & Business Info */}
                                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-start gap-3">
                                                <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">Phone</span>
                                                    <span className="font-medium">{selectedClient.phone || 'Not Specified'}</span>
                                                    {selectedClient.phone && (
                                                        <div className="flex gap-2 mt-2">
                                                            <Button onClick={() => handleSendWhatsApp(selectedClient)} size="sm" variant="outline" className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 border-emerald-100 h-7 px-2">
                                                                <MessageCircle className="w-3.5 h-3.5 mr-1" /> WhatsApp
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">Email</span>
                                                    <span className="font-medium break-all">{selectedClient.email || 'Not Specified'}</span>
                                                    {selectedClient.email && (
                                                        <div className="mt-2">
                                                            <Button onClick={() => handleSendEmail(selectedClient)} size="sm" variant="outline" className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-800 border-blue-100 h-7 px-2">
                                                                <Mail className="w-3.5 h-3.5 mr-1" /> Send Mail
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            {/* Social Links & Web */}
                                            {(selectedClient.facebook_url || selectedClient.instagram_url || selectedClient.website_url || selectedClient.whatsapp_number) && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <Globe className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                    <div className="w-full">
                                                        <span className="text-xs text-muted-foreground block mb-1">Web & Social Profiles</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedClient.website_url && (
                                                                <a href={selectedClient.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-800 transition-colors">
                                                                    <Globe className="w-3.5 h-3.5 text-slate-600" /> Website
                                                                </a>
                                                            )}
                                                            {selectedClient.facebook_url && (
                                                                <a href={selectedClient.facebook_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-800 transition-colors">
                                                                    <Facebook className="w-3.5 h-3.5 text-blue-600" /> Facebook
                                                                </a>
                                                            )}
                                                            {selectedClient.instagram_url && (
                                                                <a href={selectedClient.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-50 border border-pink-200 hover:bg-pink-100 rounded-lg text-xs font-medium text-pink-800 transition-colors">
                                                                    <Instagram className="w-3.5 h-3.5 text-pink-600" /> Instagram
                                                                </a>
                                                            )}
                                                            {selectedClient.whatsapp_number && (
                                                                <a href={`https://wa.me/${selectedClient.whatsapp_number.replace(/[^0-9+]/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-medium text-emerald-800 transition-colors">
                                                                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp Direct
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Referral & Contact Type */}
                                            <div className="flex items-start gap-3">
                                                <Users className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                <div>
                                                    <span className="text-xs text-muted-foreground block">Contact Referral Type</span>
                                                    <Badge className={`text-xs mt-1 border font-medium ${
                                                        selectedClient.contact_type === 'instagram' ? 'bg-pink-100 text-pink-800 border-pink-200' :
                                                        selectedClient.contact_type === 'facebook' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                                        selectedClient.contact_type === 'whatsapp' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                        selectedClient.contact_type === 'website' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                                                        selectedClient.contact_type === 'referral' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                                        'bg-slate-100 text-slate-800 border-slate-200'
                                                    }`}>
                                                        {(selectedClient.contact_type || 'direct').toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {selectedClient.referral_source && (
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                    <div>
                                                        <span className="text-xs text-muted-foreground block">Referral Info / Link</span>
                                                        <span className="font-medium">{selectedClient.referral_source}</span>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedClient.address && (
                                                <div className="flex items-start gap-3 md:col-span-2">
                                                    <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                                                    <div>
                                                        <span className="text-xs text-muted-foreground block">Address</span>
                                                        <span className="font-medium text-muted-foreground">{selectedClient.address}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <hr className="border-border/40" />

                                        {/* Follow-up Timeline */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-sm font-semibold flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> Follow-up Timeline</h4>
                                                <Button size="sm" onClick={handleOpenFollowUpModal} className="h-8 text-xs bg-secondary hover:bg-secondary/80 text-foreground border border-border/40">
                                                    <Plus className="w-3.5 h-3.5 mr-1" /> Log Task
                                                </Button>
                                            </div>

                                            {/* Followups List */}
                                            <div className="space-y-3">
                                                {activeFollowUps.length === 0 ? (
                                                    <div className="p-6 text-center border border-dashed border-border/50 rounded-xl text-muted-foreground text-xs">
                                                        No follow-ups logged for this client yet. Click Log Task above to schedule.
                                                    </div>
                                                ) : (
                                                    activeFollowUps.map((fup) => {
                                                        const statusConfig = FOLLOW_UP_STATUS_CONFIG[fup.status];
                                                        const StatusIcon = statusConfig.icon;
                                                        const MediumIcon = MEDIUM_ICONS[fup.medium];
                                                        return (
                                                            <div key={fup.id} className="p-3 bg-secondary/30 border border-border/40 rounded-xl space-y-2">
                                                                <div className="flex justify-between items-center flex-wrap gap-2">
                                                                    <span className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                                                                        <MediumIcon className="w-3.5 h-3.5" />
                                                                        {new Date(fup.follow_up_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                                    </span>
                                                                    <Badge className={`text-[10px] px-1.5 py-0.5 border ${statusConfig.color} font-medium`}>
                                                                        <StatusIcon className="w-3 h-3 mr-1 inline" /> {fup.status.toUpperCase()}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-xs text-foreground leading-relaxed bg-white/50 p-2.5 rounded-lg border border-border/20">{fup.notes}</p>
                                                                
                                                                {fup.status === 'pending' && (
                                                                    <div className="flex justify-end gap-1.5 pt-1">
                                                                        <Button onClick={() => handleUpdateFollowUpStatus(fup.id, 'completed')} size="sm" variant="outline" className="h-6 text-[10px] border-green-200 text-green-700 bg-green-50 hover:bg-green-100 hover:text-green-800">
                                                                            <Check className="w-3 h-3 mr-1" /> Mark Done
                                                                        </Button>
                                                                        <Button onClick={() => handleUpdateFollowUpStatus(fup.id, 'cancelled')} size="sm" variant="outline" className="h-6 text-[10px] border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:text-red-800">
                                                                            <Trash2 className="w-3 h-3 mr-1" /> Cancel
                                                                        </Button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <div className="p-12 text-center border border-dashed border-border/50 rounded-2xl text-muted-foreground text-sm">
                                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                                Select a client from the registry to view details and follow-up schedules.
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ============================================
                DIALOG MODAL: ADD/EDIT CLIENT
               ============================================ */}
            <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? 'Edit Client Details' : 'Register New Client'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveClient} className="space-y-4 pt-2">
                        <div className="space-y-1">
                            <Label htmlFor="c-name">Full Name *</Label>
                            <Input
                                id="c-name"
                                value={clientForm.name}
                                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                                placeholder="E.g. Aarav Mehta"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="c-business">Business/Company</Label>
                                <Input
                                    id="c-business"
                                    value={clientForm.business_name}
                                    onChange={(e) => setClientForm({ ...clientForm, business_name: e.target.value })}
                                    placeholder="Company name"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-status">Status</Label>
                                <Select
                                    value={clientForm.status}
                                    onValueChange={(val) => setClientForm({ ...clientForm, status: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead / Prospect</SelectItem>
                                        <SelectItem value="active">Active Client</SelectItem>
                                        <SelectItem value="inactive">Inactive / Cold</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="c-phone">Phone Number</Label>
                                <Input
                                    id="c-phone"
                                    value={clientForm.phone}
                                    onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                                    placeholder="E.g. +918142908550"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-email">Email</Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    value={clientForm.email}
                                    onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                                    placeholder="client@company.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="c-facebook">Facebook Profile Link</Label>
                                <Input
                                    id="c-facebook"
                                    value={clientForm.facebook_url || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, facebook_url: e.target.value })}
                                    placeholder="https://facebook.com/username"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-instagram">Instagram Profile Link</Label>
                                <Input
                                    id="c-instagram"
                                    value={clientForm.instagram_url || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, instagram_url: e.target.value })}
                                    placeholder="https://instagram.com/username"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="c-whatsapp">WhatsApp Number</Label>
                                <Input
                                    id="c-whatsapp"
                                    value={clientForm.whatsapp_number || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, whatsapp_number: e.target.value })}
                                    placeholder="E.g. +918142908550"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-website">Website Link</Label>
                                <Input
                                    id="c-website"
                                    value={clientForm.website_url || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, website_url: e.target.value })}
                                    placeholder="https://company.com"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="c-referral">Referral Source / Link</Label>
                                <Input
                                    id="c-referral"
                                    value={clientForm.referral_source || ''}
                                    onChange={(e) => setClientForm({ ...clientForm, referral_source: e.target.value })}
                                    placeholder="Friend, Website, Ad..."
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-contact-type">Referral Contact Type</Label>
                                <Select
                                    value={clientForm.contact_type || 'direct'}
                                    onValueChange={(val) => setClientForm({ ...clientForm, contact_type: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="direct">Direct Outreach</SelectItem>
                                        <SelectItem value="facebook">Facebook</SelectItem>
                                        <SelectItem value="instagram">Instagram</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                        <SelectItem value="website">Website Form</SelectItem>
                                        <SelectItem value="referral">Referral</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="c-address">Address</Label>
                            <Textarea
                                id="c-address"
                                value={clientForm.address}
                                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                                placeholder="Business location or office address"
                                rows={2}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsClientModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Save Client</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ============================================
                DIALOG MODAL: SCHEDULE FOLLOW-UP
               ============================================ */}
            <Dialog open={isFollowUpModalOpen} onOpenChange={setIsFollowUpModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Log / Schedule Follow-up Tasks</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSaveFollowUp} className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label htmlFor="f-date">Date & Time *</Label>
                                <Input
                                    id="f-date"
                                    type="datetime-local"
                                    value={followUpForm.follow_up_date}
                                    onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_date: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="f-medium">Medium / Channel</Label>
                                <Select
                                    value={followUpForm.medium}
                                    onValueChange={(val) => setFollowUpForm({ ...followUpForm, medium: val as any })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="phone">Phone Call</SelectItem>
                                        <SelectItem value="whatsapp">WhatsApp Text</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="in_person">In-Person Meeting</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label htmlFor="f-notes">Task / Follow-up Notes *</Label>
                            <Textarea
                                id="f-notes"
                                value={followUpForm.notes}
                                onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                                placeholder="Record notes about what needs to be discussed, followed up on, or deliverables due..."
                                rows={4}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsFollowUpModalOpen(false)}>Cancel</Button>
                            <Button type="submit" className="bg-primary text-white hover:bg-primary/90">Log Task</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
