import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogOut, Trash2, Globe, Moon, Sun, User } from 'lucide-react';
import { motion } from 'motion/react';

const Settings: React.FC = () => {
  const { userProfile, updateProfile, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const handleThemeChange = (isDark: boolean) => {
    updateProfile({ preferences: { ...userProfile?.preferences, theme: isDark ? 'dark' : 'light' } as any });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">{t('settings')}</h2>

      <div className="grid gap-6 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profil
              </CardTitle>
              <CardDescription>Gérez vos informations personnelles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-accent/50">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold">{userProfile?.displayName}</span>
                  <span className="text-sm text-muted-foreground">{userProfile?.email}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} className="text-primary" />
                {t('language')} & {t('theme')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('theme')}</Label>
                  <p className="text-sm text-muted-foreground">Basculez entre le mode clair et sombre</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun size={16} className={userProfile?.preferences?.theme === 'light' ? 'text-primary' : 'text-muted-foreground'} />
                  <Switch 
                    checked={userProfile?.preferences?.theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                  />
                  <Moon size={16} className={userProfile?.preferences?.theme === 'dark' ? 'text-primary' : 'text-muted-foreground'} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{t('language')}</Label>
                  <p className="text-sm text-muted-foreground">Choisissez votre langue d'affichage</p>
                </div>
                <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                  <SelectTrigger className="w-[140px] rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">{t('french')}</SelectItem>
                    <SelectItem value="en">{t('english')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-destructive">Zone de danger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start gap-3 rounded-xl" onClick={logout}>
                <LogOut size={18} />
                {t('logout')}
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl">
                <Trash2 size={18} />
                Supprimer mon compte
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
