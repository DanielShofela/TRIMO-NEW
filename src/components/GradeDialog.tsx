import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { Grade } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Switch } from '@/components/ui/switch';
import { getActivePeriod } from '@/utils/gradeUtils';

const gradeSchema = z.object({
  subjectId: z.string().min(1, 'La matière est requise'),
  periodId: z.string().min(1, 'La période est requise'),
  name: z.string().min(1, 'Le nom est requis'),
  grade: z.number().min(0, 'La note doit être positive'),
  maxGrade: z.number().min(1, 'La note max doit être positive'),
  type: z.enum(['Contrôle', 'Devoir', 'Quiz', 'Projet', 'Oral', 'Présentation']),
  date: z.string().min(1, 'La date est requise'),
  comment: z.string().optional(),
  bonus: z.number().optional(),
  isPlanned: z.boolean(),
});

type GradeFormValues = {
  subjectId: string;
  periodId: string;
  name: string;
  grade: number;
  maxGrade: number;
  type: 'Contrôle' | 'Devoir' | 'Quiz' | 'Projet' | 'Oral' | 'Présentation';
  date: string;
  comment?: string;
  bonus?: number;
  isPlanned: boolean;
};

interface GradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  grade?: Grade;
}

const GradeDialog: React.FC<GradeDialogProps> = ({ open, onOpenChange, grade }) => {
  const { addGrade, updateGrade, subjects, periods } = useData();
  const { t } = useLanguage();

  const activePeriod = getActivePeriod(periods);

  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      subjectId: '',
      periodId: activePeriod?.id || '',
      name: '',
      grade: 0,
      maxGrade: 20,
      type: 'Contrôle',
      date: new Date().toISOString().split('T')[0],
      comment: '',
      bonus: 0,
      isPlanned: false,
    },
  });

  useEffect(() => {
    if (grade) {
      form.reset({
        subjectId: grade.subjectId,
        periodId: grade.periodId,
        name: grade.name,
        grade: grade.grade,
        maxGrade: grade.maxGrade,
        type: grade.type,
        date: grade.date.toDate().toISOString().split('T')[0],
        comment: grade.comment || '',
        bonus: grade.bonus || 0,
        isPlanned: grade.isPlanned || false,
      });
    } else {
      form.reset({
        subjectId: subjects[0]?.id || '',
        periodId: activePeriod?.id || '',
        name: '',
        grade: 0,
        maxGrade: 20,
        type: 'Contrôle',
        date: new Date().toISOString().split('T')[0],
        comment: '',
        bonus: 0,
        isPlanned: false,
      });
    }
  }, [grade, form, open, subjects, activePeriod]);

  const onSubmit = async (values: z.infer<typeof gradeSchema>) => {
    const gradeData = {
      ...values,
      date: Timestamp.fromDate(new Date(values.date)),
    };

    if (grade) {
      await updateGrade(grade.id, gradeData);
    } else {
      await addGrade(gradeData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{grade ? t('edit') : t('add_grade')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('subjects')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Choisir une matière" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subjects.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: DS n°1" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('grade')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.25" 
                      className="rounded-xl"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxGrade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('max_grade')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      className="rounded-xl"
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['Contrôle', 'Devoir', 'Quiz', 'Projet', 'Oral', 'Présentation'].map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('date')}</FormLabel>
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
              name="isPlanned"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-xl border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>{t('is_planned')}</FormLabel>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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

export default GradeDialog;
