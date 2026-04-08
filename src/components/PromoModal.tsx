import React from 'react';
import { useData } from '../context/DataContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Sparkles } from 'lucide-react';

const PromoModal: React.FC = () => {
  const { grades } = useData();
  const [open, setOpen] = React.useState(false);
  const [hasShown, setHasShown] = React.useState(false);

  React.useEffect(() => {
    if (grades.length >= 5 && !hasShown) {
      setOpen(true);
      setHasShown(true);
    }
  }, [grades.length, hasShown]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] rounded-2xl overflow-hidden p-0 border-none">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <Sparkles size={24} />
          </div>
          <h3 className="text-2xl font-bold mb-2">Découvrez ChronoFlow</h3>
          <p className="text-blue-100 text-sm leading-relaxed">
            Vous gérez déjà vos notes comme un pro ! Pourquoi ne pas optimiser votre temps avec ChronoFlow ?
          </p>
        </div>
        <div className="p-6 bg-card">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <p className="text-sm">Planification intelligente des révisions</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              <p className="text-sm">Statistiques avancées sur votre productivité</p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-2">
            <Button className="w-full gap-2 rounded-xl bg-blue-600 hover:bg-blue-700" asChild>
              <a href="https://example.com/chronoflow" target="_blank" rel="noopener noreferrer">
                Découvrir ChronoFlow
                <ExternalLink size={16} />
              </a>
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)} className="w-full rounded-xl">
              Plus tard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromoModal;
