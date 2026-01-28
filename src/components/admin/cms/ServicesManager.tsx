import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Service {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  features: unknown;
  price_from: number | null;
  is_active: boolean;
  display_order: number;
}

export const ServicesManager = () => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '',
    features: '',
    price_from: '',
    is_active: true,
  });

  useEffect(() => { fetchServices(); }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast({ title: 'Error', description: 'Failed to load services', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const serviceData = {
        title: formData.title,
        description: formData.description || null,
        icon: formData.icon || null,
        features: formData.features ? formData.features.split('\n').map(f => f.trim()).filter(Boolean) : null,
        price_from: formData.price_from ? parseFloat(formData.price_from) : null,
        is_active: formData.is_active,
      };

      if (editingService) {
        const { error } = await supabase.from('services').update(serviceData).eq('id', editingService.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Service updated' });
      } else {
        const { error } = await supabase.from('services').insert({ ...serviceData, display_order: services.length });
        if (error) throw error;
        toast({ title: 'Success', description: 'Service created' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast({ title: 'Error', description: 'Failed to save service', variant: 'destructive' });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    const featuresArray = Array.isArray(service.features) ? service.features as string[] : [];
    setFormData({
      title: service.title,
      description: service.description || '',
      icon: service.icon || '',
      features: featuresArray.join('\n'),
      price_from: service.price_from?.toString() || '',
      is_active: service.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Service deleted' });
      fetchServices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete service', variant: 'destructive' });
    }
  };

  const toggleActive = async (service: Service) => {
    try {
      const { error } = await supabase.from('services').update({ is_active: !service.is_active }).eq('id', service.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Service ${!service.is_active ? 'activated' : 'deactivated'}` });
      fetchServices();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ title: '', description: '', icon: '', features: '', price_from: '', is_active: true });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Services</h3>
          <p className="text-sm text-muted-foreground">Manage your service offerings</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Service</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Service name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Icon (Lucide name)</label>
                  <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} placeholder="e.g., Palette, Code, Smartphone" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Service description..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Features (one per line)</label>
                <Textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="Feature 1&#10;Feature 2&#10;Feature 3" rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Starting Price ($)</label>
                <Input type="number" value={formData.price_from} onChange={(e) => setFormData({ ...formData, price_from: e.target.value })} placeholder="0.00" />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={formData.is_active} onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })} />
                <label className="text-sm font-medium">Active</label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}><X className="w-4 h-4 mr-2" />Cancel</Button>
                <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" />Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No services yet. Add your first service!</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <Card key={service.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{service.title}</h4>
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? 'Active' : 'Inactive'}</Badge>
                      {service.price_from && <Badge variant="outline">From ${service.price_from}</Badge>}
                    </div>
                    {service.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{service.description}</p>}
                    {Array.isArray(service.features) && <p className="text-xs text-muted-foreground mt-1">{(service.features as string[]).length} features</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={service.is_active} onCheckedChange={() => toggleActive(service)} />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(service)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(service.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
