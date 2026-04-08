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
import { Subject } from '@/types';

const subjectSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  coefficient: z.number().min(0.1, 'Le coefficient doit être positif'),
  color: z.string().min(4, 'La couleur est requise'),
  goal: z.number().min(0).max(20, 'L\'objectif doit être entre 0 et 20'),
  icon: z.string().optional(),
});

type SubjectFormValues = {
  name: string;
  coefficient: number;
  color: string;
  goal: number;
  icon?: string;
};

interface SubjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
}

const SubjectDialog: React.FC<SubjectDialogProps> = ({ open, onOpenChange, subject }) => {
  const { addSubject, updateSubject } = useData();
  const { t } = useLanguage();

  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      name: '',
      coefficient: 1,
      color: '#3b82f6',
      goal: 15,
      icon: 'Book',
    },
  });

  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        coefficient: subject.coefficient,
        color: subject.color,
        goal: subject.goal,
        icon: subject.icon,
      });
    } else {
      form.reset({
        name: '',
        coefficient: 1,
        color: '#3b82f6',
        goal: 15,
        icon: 'Book',
      });
    }
  }, [subject, form, open]);

  const onSubmit = async (values: z.infer<typeof subjectSchema>) => {
    if (subject) {
      await updateSubject(subject.id, values);
    } else {
      await addSubject(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>{subject ? t('edit') : t('add_subject')}</DialogTitle>
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
                    <Input placeholder="Mathématiques" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coefficient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('coefficient')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1" 
                        {...field} 
                        className="rounded-xl"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            </div>
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('color')}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input type="color" {...field} className="h-10 w-20 p-1 rounded-lg" />
                      <Input {...field} className="rounded-xl" />
                    </div>
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

export default SubjectDialog;
