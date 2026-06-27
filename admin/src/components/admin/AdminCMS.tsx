import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Briefcase, Users, Settings } from 'lucide-react';
import { BlogManager } from './cms/BlogManager';
import { PortfolioManager } from './cms/PortfolioManager';
import { TeamManager } from './cms/TeamManager';
import { ServicesManager } from './cms/ServicesManager';

export const AdminCMS = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold mb-2">Content Management</h2>
        <p className="text-muted-foreground">Manage all your website content in one place</p>
      </div>

      <Tabs defaultValue="blog" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-4 bg-secondary/50">
          <TabsTrigger value="blog" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Services</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <BlogManager />
        </TabsContent>
        <TabsContent value="portfolio">
          <PortfolioManager />
        </TabsContent>
        <TabsContent value="team">
          <TeamManager />
        </TabsContent>
        <TabsContent value="services">
          <ServicesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
