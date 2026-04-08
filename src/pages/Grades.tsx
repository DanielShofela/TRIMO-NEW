import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, GraduationCap, Filter, Search } from 'lucide-react';
import { motion } from 'motion/react';
import GradeDialog from '../components/GradeDialog';
import { Grade } from '../types';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Grades: React.FC = () => {
  const { grades, subjects, periods, deleteGrade, loading } = useData();
  const { t, language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingGrade, setEditingGrade] = React.useState<Grade | undefined>(undefined);
  const [filterSubject, setFilterSubject] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  if (loading) return null;

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingGrade(undefined);
    setIsDialogOpen(true);
  };

  const filteredGrades = grades.filter(g => {
    const matchesSubject = filterSubject === 'all' || g.subjectId === filterSubject;
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  const dateLocale = language === 'fr' ? fr : enUS;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('grades')}</h2>
        <Button onClick={handleAdd} className="gap-2 rounded-xl">
          <Plus size={20} />
          {t('add_grade')}
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input 
            placeholder="Rechercher une évaluation..." 
            className="pl-10 rounded-xl"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGrades.length > 0 ? (
          filteredGrades.map((grade, index) => {
            const subject = subjects.find(s => s.id === grade.subjectId);
            const period = periods.find(p => p.id === grade.periodId);
            
            return (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="group overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm"
                        style={{ backgroundColor: subject?.color || 'gray' }}
                      >
                        {subject?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg">{grade.name}</span>
                          {grade.isPlanned && <Badge variant="outline" className="text-[10px] uppercase">Planifiée</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-primary">{subject?.name}</span>
                          <span>•</span>
                          <span>{period?.name}</span>
                          <span>•</span>
                          <span>{format(grade.date.toDate(), 'P', { locale: dateLocale })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-2xl font-black">{grade.grade}<span className="text-sm font-medium text-muted-foreground">/{grade.maxGrade}</span></div>
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-tighter">{grade.type}</Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => handleEdit(grade)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-destructive" onClick={() => deleteGrade(grade.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed text-muted-foreground">
            <GraduationCap size={48} className="opacity-20" />
            <p>{t('no_data')}</p>
            <Button variant="outline" onClick={handleAdd}>{t('add_grade')}</Button>
          </div>
        )}
      </div>

      <GradeDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        grade={editingGrade} 
      />
    </div>
  );
};

export default Grades;
