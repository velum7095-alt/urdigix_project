import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Eye, TrendingUp } from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalViews: 0,
    uniqueVisitors: 0,
    totalMessages: 0,
    unreadMessages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch page views
        const { data: pageViews } = await supabase
          .from('page_views')
          .select('id, visitor_id');

        // Fetch messages
        const { data: messages } = await supabase
          .from('contact_submissions')
          .select('id, is_read');

        const uniqueVisitors = new Set(pageViews?.map(v => v.visitor_id).filter(Boolean)).size;

        setStats({
          totalViews: pageViews?.length || 0,
          uniqueVisitors,
          totalMessages: messages?.length || 0,
          unreadMessages: messages?.filter(m => !m.is_read).length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Page Views',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      title: 'Unique Visitors',
      value: stats.uniqueVisitors,
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Total Messages',
      value: stats.totalMessages,
      icon: MessageSquare,
      color: 'text-purple-500',
    },
    {
      title: 'Unread Messages',
      value: stats.unreadMessages,
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

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
        <h2 className="text-2xl font-display font-bold mb-2">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to your admin panel</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-display font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
