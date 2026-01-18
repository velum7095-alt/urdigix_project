import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Mail, Check, Trash2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const AdminMessages = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }

      toast({
        title: 'Marked as read',
      });
    } catch (error) {
      console.error('Error marking as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to update message',
        variant: 'destructive',
      });
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessages(messages.filter(m => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }

      toast({
        title: 'Message deleted',
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive',
      });
    }
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
        <h2 className="text-2xl font-display font-bold mb-2">Contact Messages</h2>
        <p className="text-muted-foreground">View and manage contact form submissions</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1 space-y-3">
          {messages.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-8 text-center text-muted-foreground">
                No messages yet
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card
                key={message.id}
                className={`glass-card cursor-pointer transition-all hover:border-primary/30 ${
                  selectedMessage?.id === message.id ? 'border-primary' : ''
                } ${!message.is_read ? 'border-l-4 border-l-primary' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium truncate">{message.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{message.email}</p>
                    </div>
                    {!message.is_read && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {message.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {format(new Date(message.created_at), 'MMM d, yyyy')}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <Card className="glass-card">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{selectedMessage.name}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {selectedMessage.email}
                      </a>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedMessage.created_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!selectedMessage.is_read && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => markAsRead(selectedMessage.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteMessage(selectedMessage.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedMessage.phone && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Phone: {selectedMessage.phone}
                  </p>
                )}
                <div className="bg-secondary/30 rounded-lg p-4">
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
                <div className="mt-4">
                  <Button asChild>
                    <a href={`mailto:${selectedMessage.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Reply via Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-card h-full min-h-[300px] flex items-center justify-center">
              <CardContent className="text-center text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a message to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};
