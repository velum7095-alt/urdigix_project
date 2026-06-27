import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';

interface PageView {
  id: string;
  page_path: string;
  visitor_id: string | null;
  referrer: string | null;
  created_at: string;
}

interface DailyViews {
  date: string;
  views: number;
}

interface PageStats {
  page: string;
  views: number;
}

const COLORS = ['hsl(var(--primary))', '#82ca9d', '#8884d8', '#ffc658', '#ff7300'];

export const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyViews, setDailyViews] = useState<DailyViews[]>([]);
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueVisitors, setUniqueVisitors] = useState(0);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('page_views')
          .select('*')
          .gte('created_at', subDays(new Date(), 30).toISOString())
          .order('created_at', { ascending: true });

        if (error) throw error;

        const pageViews = data as PageView[];
        setTotalViews(pageViews.length);
        setUniqueVisitors(new Set(pageViews.map(v => v.visitor_id).filter(Boolean)).size);

        // Calculate daily views
        const dailyMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const date = format(startOfDay(subDays(new Date(), i)), 'MMM d');
          dailyMap.set(date, 0);
        }

        pageViews.forEach(view => {
          const date = format(new Date(view.created_at), 'MMM d');
          if (dailyMap.has(date)) {
            dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
          }
        });

        setDailyViews(
          Array.from(dailyMap.entries()).map(([date, views]) => ({ date, views }))
        );

        // Calculate page stats
        const pageMap = new Map<string, number>();
        pageViews.forEach(view => {
          const count = pageMap.get(view.page_path) || 0;
          pageMap.set(view.page_path, count + 1);
        });

        setPageStats(
          Array.from(pageMap.entries())
            .map(([page, views]) => ({ page, views }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5)
        );
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

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
        <h2 className="text-2xl font-display font-bold mb-2">Analytics</h2>
        <p className="text-muted-foreground">Track your website performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Views (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold">{totalViews}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unique Visitors (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold">{uniqueVisitors}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Views Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Daily Page Views (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyViews}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Pages Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pageStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pageStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      type="category" 
                      dataKey="page" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="views" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No page view data yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};
