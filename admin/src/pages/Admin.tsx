import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  BarChart3,
  LogOut,
  Home,
  Receipt,
  FileCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Briefcase
} from 'lucide-react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminCMS } from '@/components/admin/AdminCMS';
import { AdminMessages } from '@/components/admin/AdminMessages';
import { AdminAnalytics } from '@/components/admin/AdminAnalytics';
import { QuotationsManager } from '@/components/admin/QuotationsManager';
import { InvoicesManager } from '@/components/admin/InvoicesManager';
import { BusinessSettings } from '@/components/admin/BusinessSettings';
import { ClientsManager } from '@/components/admin/ClientsManager';
import { ContractsManager } from '@/components/admin/ContractsManager';

const Admin = () => {
  const { user, isAdmin, isLoading, isDevMode, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading CRM workspace...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // In dev mode, grant admin access
  if (!isAdmin && !isDevMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center p-8 max-w-md"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-7 h-7 text-red-500 rotate-180" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have admin privileges. Contact the site administrator if you believe this is an error.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/')} variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button onClick={handleSignOut} variant="ghost">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'contracts', label: 'Contracts', icon: Briefcase },
    { id: 'quotations', label: 'Quotations', icon: FileCheck },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'cms', label: 'CMS', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/70 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-bold shadow-lg shadow-primary/20">
                U
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">
                  <span className="text-gradient">UR</span>DIGIX
                </h1>
                <p className="hidden sm:block text-xs text-muted-foreground -mt-1">Website + CRM workspace</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {isDevMode && (
              <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Dev Mode
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} title="View Site" aria-label="View Site">
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">View Site</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar for larger screens */}
        <aside className={`hidden lg:block ${sidebarCollapsed ? 'w-20' : 'w-72'} border-r border-border/70 bg-white/75 backdrop-blur-xl min-h-[calc(100vh-4rem)] transition-all duration-300`}>
          <div className="p-4 space-y-2">
            <div className={`mb-4 ${sidebarCollapsed ? 'flex justify-center' : 'space-y-3'}`}>
              {!sidebarCollapsed && (
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-[0.18em]">CRM</span>
                  </div>
                  <p className="text-sm font-medium">Manage leads, content, quotes, invoices, and analytics beside the live website.</p>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-muted-foreground hover:text-foreground"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>

            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
              >
                <tab.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{tab.label}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Mobile Tabs */}
        <div className="flex-1">
          <div className="lg:hidden sticky top-16 z-40 bg-white/90 backdrop-blur-xl border-b border-border/70 overflow-x-auto">
            <div className="flex p-2 gap-1 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <main className="relative p-4 md:p-6 lg:p-8">
            <div className="absolute inset-0 bg-gradient-radial opacity-60 pointer-events-none" />
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {activeTab === 'dashboard' && <AdminDashboard />}
              {activeTab === 'clients' && <ClientsManager />}
              {activeTab === 'contracts' && <ContractsManager />}
              {activeTab === 'quotations' && <QuotationsManager />}
              {activeTab === 'invoices' && <InvoicesManager />}
              {activeTab === 'cms' && <AdminCMS />}
              {activeTab === 'messages' && <AdminMessages />}
              {activeTab === 'analytics' && <AdminAnalytics />}
              {activeTab === 'settings' && <BusinessSettings />}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Admin;
