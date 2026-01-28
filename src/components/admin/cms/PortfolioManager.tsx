import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit2, Trash2, Save, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PortfolioProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  featured_image: string | null;
  technologies: string[] | null;
  client_name: string | null;
  project_url: string | null;
  status: string;
  display_order: number;
  created_at: string;
}

const generateSlug = (title: string) => {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

export const PortfolioManager = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioProject | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    featured_image: '',
    technologies: '',
    client_name: '',
    project_url: '',
    status: 'draft',
  });

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({ title: 'Error', description: 'Failed to load projects', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const projectData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description || null,
        content: formData.content || null,
        featured_image: formData.featured_image || null,
        technologies: formData.technologies ? formData.technologies.split(',').map(t => t.trim()) : null,
        client_name: formData.client_name || null,
        project_url: formData.project_url || null,
        status: formData.status,
      };

      if (editingProject) {
        const { error } = await supabase.from('portfolio_projects').update(projectData).eq('id', editingProject.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Project updated' });
      } else {
        const { error } = await supabase.from('portfolio_projects').insert({ ...projectData, display_order: projects.length });
        if (error) throw error;
        toast({ title: 'Success', description: 'Project created' });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({ title: 'Error', description: 'Failed to save project', variant: 'destructive' });
    }
  };

  const handleEdit = (project: PortfolioProject) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      slug: project.slug,
      description: project.description || '',
      content: project.content || '',
      featured_image: project.featured_image || '',
      technologies: project.technologies?.join(', ') || '',
      client_name: project.client_name || '',
      project_url: project.project_url || '',
      status: project.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try {
      const { error } = await supabase.from('portfolio_projects').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted' });
      fetchProjects();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  const toggleStatus = async (project: PortfolioProject) => {
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    try {
      const { error } = await supabase.from('portfolio_projects').update({ status: newStatus }).eq('id', project.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Project ${newStatus}` });
      fetchProjects();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({ title: '', slug: '', description: '', content: '', featured_image: '', technologies: '', client_name: '', project_url: '', status: 'draft' });
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Portfolio Projects</h3>
          <p className="text-sm text-muted-foreground">Showcase your work</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />New Project</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Project title" />
                </div>
                <div>
                  <label className="text-sm font-medium">Slug</label>
                  <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="auto-generated" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description..." rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Detailed content..." rows={6} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Client Name</label>
                  <Input value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} placeholder="Client name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Project URL</label>
                  <Input value={formData.project_url} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Technologies (comma-separated)</label>
                <Input value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="React, Node.js, Tailwind" />
              </div>
              <div>
                <label className="text-sm font-medium">Featured Image URL</label>
                <Input value={formData.featured_image} onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}><X className="w-4 h-4 mr-2" />Cancel</Button>
                <Button onClick={handleSubmit}><Save className="w-4 h-4 mr-2" />Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {projects.length === 0 ? (
        <Card className="glass-card"><CardContent className="py-12 text-center"><p className="text-muted-foreground">No projects yet. Add your first project!</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{project.title}</h4>
                      <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>{project.status}</Badge>
                    </div>
                    {project.client_name && <p className="text-sm text-muted-foreground">Client: {project.client_name}</p>}
                    {project.technologies && <div className="flex gap-1 mt-1">{project.technologies.slice(0, 3).map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => toggleStatus(project)}>
                      {project.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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
