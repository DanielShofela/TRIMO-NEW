import React from 'react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import SubjectDialog from '../components/SubjectDialog';
import { Subject } from '../types';
import { calculateSubjectAverage, formatGrade } from '../utils/gradeUtils';

const Subjects: React.FC = () => {
  const { subjects, grades, deleteSubject, loading } = useData();
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState<Subject | undefined>(undefined);

  if (loading) return null;

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingSubject(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t('subjects')}</h2>
        <Button onClick={handleAdd} className="gap-2 rounded-xl">
          <Plus size={20} />
          {t('add_subject')}
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.length > 0 ? (
          subjects.map((subject, index) => {
            const subjectGrades = grades.filter(g => g.subjectId === subject.id);
            const average = calculateSubjectAverage(subjectGrades);
            
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group relative overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                  <div 
                    className="absolute inset-x-0 top-0 h-2" 
                    style={{ backgroundColor: subject.color }}
                  />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">{subject.name}</CardTitle>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(subject)}>
                        <Edit2 size={14} />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteSubject(subject.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Coefficient</span>
                          <span className="text-lg font-bold">{subject.coefficient}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{t('average')}</span>
                          <span className="text-lg font-bold" style={{ color: subject.color }}>{formatGrade(average)}/20</span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{t('goal')}: {subject.goal}/20</span>
                          <span>{Math.round((average / subject.goal) * 100)}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-accent overflow-hidden">
                          <div 
                            className="h-full transition-all duration-500" 
                            style={{ 
                              width: `${Math.min((average / subject.goal) * 100, 100)}%`,
                              backgroundColor: subject.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed text-muted-foreground">
            <BookOpen size={48} className="opacity-20" />
            <p>{t('no_data')}</p>
            <Button variant="outline" onClick={handleAdd}>{t('add_subject')}</Button>
          </div>
        )}
      </div>

      <SubjectDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        subject={editingSubject} 
      />
    </div>
  );
};

export default Subjects;
