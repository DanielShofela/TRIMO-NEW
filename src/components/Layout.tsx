import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GraduationCap, Calendar, Settings, LogOut, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Button } from '@/components/ui/button';

import WelcomeGuide from './WelcomeGuide';
import PromoModal from './PromoModal';

const Layout: React.FC = () => {
  const { t } = useLanguage();
  const { logout, userProfile } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: t('dashboard') },
    ...(userProfile?.role === 'admin' ? [{ path: '/admin', icon: ShieldCheck, label: 'Admin Panel' }] : []),
    ...(userProfile?.role !== 'admin' ? [
      { path: '/subjects', icon: BookOpen, label: t('subjects') },
      { path: '/grades', icon: GraduationCap, label: t('grades') },
      { path: '/periods', icon: Calendar, label: t('periods') },
    ] : []),
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <WelcomeGuide />
      <PromoModal />
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card p-6 md:flex">
        <div className="mb-10 flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{t('app_name')}</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
              {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">{userProfile?.displayName}</span>
              <span className="truncate text-xs text-muted-foreground">{userProfile?.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={logout}
          >
            <LogOut size={20} />
            {t('logout')}
          </Button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t bg-card p-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-colors",
              location.pathname === item.path
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="mx-auto max-w-5xl p-6 md:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
