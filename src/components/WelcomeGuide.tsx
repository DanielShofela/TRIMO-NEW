import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const WelcomeGuide: React.FC = () => {
  const { periods, subjects, grades } = useData();
  const { t } = useLanguage();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (periods.length === 0 || subjects.length === 0 || grades.length === 0) {
      const timer = setTimeout(() => setOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [periods.length, subjects.length, grades.length]);

  const steps = [
    { icon: Calendar, text: "Créez votre première période (ex: Trimestre 1)", done: periods.length > 0 },
    { icon: BookOpen, text: "Ajoutez vos matières et leurs coefficients", done: subjects.length > 0 },
    { icon: GraduationCap, text: "Enregistrez vos premières notes", done: grades.length > 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Bienvenue sur Trimo !</DialogTitle>
          <DialogDescription>
            Suivez ces étapes pour commencer à gérer vos notes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full shadow-sm",
                step.done ? "bg-primary text-primary-foreground" : "bg-accent text-muted-foreground"
              )}>
                {step.done ? <CheckCircle2 size={20} /> : <step.icon size={20} />}
              </div>
              <p className={cn("flex-1 text-sm font-medium", step.done && "text-muted-foreground line-through")}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full rounded-xl">C'est parti !</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeGuide;
