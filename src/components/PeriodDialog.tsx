import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Period } from '@/types';
import { Timestamp } from 'firebase/firestore';

const periodSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  startDate: z.string().min(1, 'La date de début est requise'),
  endDate: z.string().min(1, 'La date de fin est requise'),
  goal: z.number().min(0).max(20, 'L\'objectif doit être entre 0 et 20'),
  isActive: z.boolean(),
});

type PeriodFormValues = {
  name: string;
  startDate: string;
  endDate: string;
  goal: number;
  isActive: boolean;
};

interface PeriodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: Period;
}

const PeriodDialog: React.FC<PeriodDialogProps> = ({ open, onOpenChange, period }) => {
  const { addPeriod, updatePeriod } = useData();
  const { t } = useLanguage();

  const form = useForm<PeriodFormValues>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      name: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
      goal: 15,
      isActive: false,
    },
  });

  useEffect(() => {
    if (period) {
      form.reset({
        name: period.name,
        startDate: period.startDate.toDate().toISOString().split('T')[0],
        endDate: period.endDate.toDate().toISOString().split('T')[0],
        goal: period.goal,
        isActive: period.isActive || false,
      });
    } else {
      form.reset({
        name: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString().split('T')[0],
        goal: 15,
        isActive: false,
      });
    }
  }, [period, form, open]);

  const onSubmit = async (values: z.infer<typeof periodSchema>) => {
    const periodData = {
      ...values,
      startDate: Timestamp.fromDate(new Date(values.startDate)),
      endDate: Timestamp.fromDate(new Date(values.endDate)),
    };

    if (period) {
      await updatePeriod(period.id, periodData);
    } else {
      await addPeriod(periodData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{period ? t('edit') : t('add_period')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Trimestre 1" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('start_date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('end_date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('goal')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.5" 
                      {...field} 
                      className="rounded-xl"
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full rounded-xl">{t('save')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PeriodDialog;
