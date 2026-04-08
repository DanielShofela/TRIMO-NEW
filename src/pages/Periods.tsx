import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import PeriodDialog from '../components/PeriodDialog';
import { Period } from '../types';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '../lib/utils';

const Periods: React.FC = () => {
  const { periods, deletePeriod, updatePeriod, loading } = useData();
  const { t, language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingPeriod, setEditingPeriod] = React.useState<Period | undefined>(undefined);

  if (loading) return null;

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPeriod(undefined);
    setIsDialogOpen(true);
  };

  const handleSetActive = async (id: string) => {
    // Deactivate all others
    for (const p of periods) {
      if (p.id === id) {
        await updatePeriod(p.id, { isActive: true });
      } else if (p.isActive) {
        await updatePeriod(p.id, { isActive: false });
      }
    }
  };

  const dateLocale = language === 'fr' ? fr : enUS;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('periods')}</h2>
        <Button onClick={handleAdd} className="gap-2 rounded-xl">
          <Plus size={20} />
          {t('add_period')}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {periods.length > 0 ? (
          periods.map((period, index) => (
            <motion.div
              key={period.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "group relative overflow-hidden border-none shadow-sm transition-all hover:shadow-md",
                period.isActive && "ring-2 ring-primary"
              )}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold">{period.name}</CardTitle>
                    {period.isActive && (
                      <Badge className="bg-primary text-primary-foreground">
                        {t('active')}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!period.isActive && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleSetActive(period.id)}>
                        <CheckCircle2 size={14} />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(period)}>
                      <Edit2 size={14} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deletePeriod(period.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest">{t('start_date')}</span>
                        <span className="font-medium text-foreground">{format(period.startDate.toDate(), 'P', { locale: dateLocale })}</span>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest">{t('end_date')}</span>
                        <span className="font-medium text-foreground">{format(period.endDate.toDate(), 'P', { locale: dateLocale })}</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold tracking-widest">{t('goal')}</span>
                      <span className="text-2xl font-black text-primary">{period.goal}/20</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed text-muted-foreground">
            <CalendarIcon size={48} className="opacity-20" />
            <p>{t('no_data')}</p>
            <Button variant="outline" onClick={handleAdd}>{t('add_period')}</Button>
          </div>
        )}
      </div>

      <PeriodDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        period={editingPeriod} 
      />
    </div>
  );
};

export default Periods;
