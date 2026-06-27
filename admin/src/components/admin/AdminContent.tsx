import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Plus, Trash2 } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface HeroContent {
  title: string;
  subtitle: string;
}

interface ServiceItem {
  title: string;
  description: string;
}

interface TestimonialItem {
  name: string;
  role: string;
  text: string;
}

interface SiteContent {
  section_key: string;
  content: Json;
}

export const AdminContent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [heroContent, setHeroContent] = useState<HeroContent>({ title: '', subtitle: '' });
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('section_key, content');

        if (error) throw error;

        data?.forEach((item: SiteContent) => {
          const content = item.content as Record<string, unknown>;
          if (item.section_key === 'hero') {
            setHeroContent(content as unknown as HeroContent);
          } else if (item.section_key === 'services') {
            setServices((content.items as ServiceItem[]) || []);
          } else if (item.section_key === 'testimonials') {
            setTestimonials((content.items as TestimonialItem[]) || []);
          }
        });
      } catch (error) {
        console.error('Error fetching content:', error);
        toast({
          title: 'Error',
          description: 'Failed to load content',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [toast]);

  const saveContent = async (sectionKey: string, content: Json) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ 
          content, 
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('section_key', sectionKey);

      if (error) throw error;

      toast({
        title: 'Saved!',
        description: 'Content updated successfully',
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: 'Error',
        description: 'Failed to save content',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addService = () => {
    setServices([...services, { title: 'New Service', description: 'Description here' }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const addTestimonial = () => {
    setTestimonials([...testimonials, { name: 'New Client', role: 'Role', text: 'Testimonial text' }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-display font-bold mb-2">Content Management</h2>
        <p className="text-muted-foreground">Edit your website content</p>
      </div>

      {/* Hero Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={heroContent.title}
              onChange={(e) => setHeroContent({ ...heroContent, title: e.target.value })}
              className="bg-secondary/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Subtitle</label>
            <Textarea
              value={heroContent.subtitle}
              onChange={(e) => setHeroContent({ ...heroContent, subtitle: e.target.value })}
              className="bg-secondary/50"
              rows={3}
            />
          </div>
          <Button
            onClick={() => saveContent('hero', heroContent as unknown as Json)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Hero
          </Button>
        </CardContent>
      </Card>

      {/* Services Section */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Services</CardTitle>
          <Button onClick={addService} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {services.map((service, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Service {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeService(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Input
                value={service.title}
                onChange={(e) => {
                  const updated = [...services];
                  updated[index].title = e.target.value;
                  setServices(updated);
                }}
                placeholder="Title"
                className="bg-secondary/50"
              />
              <Textarea
                value={service.description}
                onChange={(e) => {
                  const updated = [...services];
                  updated[index].description = e.target.value;
                  setServices(updated);
                }}
                placeholder="Description"
                className="bg-secondary/50"
                rows={2}
              />
            </div>
          ))}
          <Button
            onClick={() => saveContent('services', { items: services } as unknown as Json)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Services
          </Button>
        </CardContent>
      </Card>

      {/* Testimonials Section */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Testimonials</CardTitle>
          <Button onClick={addTestimonial} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-4 border border-border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Testimonial {index + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTestimonial(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input
                  value={testimonial.name}
                  onChange={(e) => {
                    const updated = [...testimonials];
                    updated[index].name = e.target.value;
                    setTestimonials(updated);
                  }}
                  placeholder="Name"
                  className="bg-secondary/50"
                />
                <Input
                  value={testimonial.role}
                  onChange={(e) => {
                    const updated = [...testimonials];
                    updated[index].role = e.target.value;
                    setTestimonials(updated);
                  }}
                  placeholder="Role"
                  className="bg-secondary/50"
                />
              </div>
              <Textarea
                value={testimonial.text}
                onChange={(e) => {
                  const updated = [...testimonials];
                  updated[index].text = e.target.value;
                  setTestimonials(updated);
                }}
                placeholder="Testimonial text"
                className="bg-secondary/50"
                rows={3}
              />
            </div>
          ))}
          <Button
            onClick={() => saveContent('testimonials', { items: testimonials } as unknown as Json)}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Testimonials
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};
