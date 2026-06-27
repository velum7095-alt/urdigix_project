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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  is_active: boolean;
  display_order: number;
}

export const TeamManager = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    bio: '',
    photo_url: '',
    email: '',
    linkedin_url: '',
    twitter_url: '',
    is_active: true,
  });

  useEffect(() => { fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({ title: 'Error', description: 'Failed to load team members', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const memberData = {
        name: formData.name,
        role: formData.role,
        bio: formData.bio || null,
        photo_url: formData.photo_url || null,
        email: formData.email || null,
        linkedin_url: formData.linkedin_url || null,
        twitter_url: formData.twitter_url || null,
        is_active: formData.is_active,
      };

      if (editingMember) {
        const { error } = await supabase.from('team_members').update(memberData).eq('id', editingMember.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Team member updated' });
      } else {
        const { error } = await supabase.from('team_members').insert({ ...memberData, display_order: members.length });
        if (error) throw error;
        toast({ title: 'Success', description: 'Team member added' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchMembers();
    } catch (error) {
      console.error('Error saving member:', error);
      toast({ title: 'Error', description: 'Failed to save team member', variant: 'destructive' });
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      bio: member.bio || '',
      photo_url: member.photo_url || '',
      email: member.email || '',
      linkedin_url: member.linkedin_url || '',
      twitter_url: member.twitter_url || '',
      is_active: member.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this team member?')) return;
    try {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Team member deleted' });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete team member', variant: 'destructive' });
    }
  };

  const toggleActive = async (member: TeamMember) => {
    try {
      const { error } = await supabase.from('team_members').update({ is_active: !member.is_active }).eq('id', member.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Member ${!member.is_active ? 'activated' : 'deactivated'}` });
      fetchMembers();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', bio: '', photo_url: '', email: '', linkedin_url: '', twitter_url: '', is_active: true });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">Manage your team profiles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Input value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="Job title" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} placeholder="Brief bio..." rows={3} />
              </div>
              <div>
                <label className="text-sm font-medium">Photo URL</label>
                <Input value={formData.photo_url} onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input value={formData.linkedin_url} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Twitter URL</label>
                  <Input value={formData.twitter_url} onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })} placeholder="https://twitter.com/..." />
                </div>
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

      {members.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No team members yet. Add your first member!</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {members.map((member) => (
            <Card key={member.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.photo_url || undefined} />
                    <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{member.name}</h4>
                      <Badge variant={member.is_active ? 'default' : 'secondary'}>{member.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={member.is_active} onCheckedChange={() => toggleActive(member)} />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(member)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
