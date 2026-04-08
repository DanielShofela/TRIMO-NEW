import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateAverage, getActivePeriod, formatGrade } from '../utils/gradeUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { motion } from 'motion/react';
import { TrendingUp, Target, Calendar, GraduationCap, Users, School as SchoolIcon, BookOpen, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const PersonalDashboard: React.FC = () => {
  const { periods, subjects, grades, loading } = useData();
  const { t, language } = useLanguage();

  if (loading) return null;

  const activePeriod = getActivePeriod(periods);
  const periodGrades = activePeriod ? grades.filter(g => g.periodId === activePeriod.id) : [];
  const average = calculateAverage(periodGrades, subjects);
  const annualAverage = calculateAverage(grades, subjects);

  const chartData = [...grades]
    .filter(g => !g.isPlanned)
    .sort((a, b) => a.date.toDate() - b.date.toDate())
    .map(g => ({
      date: format(g.date.toDate(), 'dd/MM'),
      grade: (g.grade / g.maxGrade) * 20,
      name: g.name
    }));

  const recentGrades = [...grades]
    .filter(g => !g.isPlanned)
    .sort((a, b) => b.date.toDate() - a.date.toDate())
    .slice(0, 5);

  const dateLocale = language === 'fr' ? fr : enUS;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
        {activePeriod && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={16} />
            <span>{activePeriod.name}</span>
          </div>
        )}
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium opacity-80">
              <TrendingUp size={16} />
              Moyenne Générale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatGrade(average)}/20</div>
            <Progress value={(average / 20) * 100} className="mt-4 bg-primary-foreground/20" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target size={16} />
              Objectif Période
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{activePeriod?.goal || 0}/20</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {average >= (activePeriod?.goal || 0) ? 'Objectif atteint !' : `${formatGrade((activePeriod?.goal || 0) - average)} points restants`}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <GraduationCap size={16} />
              Moyenne Annuelle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{formatGrade(annualAverage)}/20</div>
            <div className="mt-2 text-xs text-muted-foreground">
              Basé sur {grades.filter(g => !g.isPlanned).length} notes
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Évolution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--primary))' }}
                />
                <Area type="monotone" dataKey="grade" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Notes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentGrades.map((g) => {
                const subject = subjects.find(s => s.id === g.subjectId);
                return (
                  <div key={g.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: subject?.color || 'gray' }}
                      >
                        {subject?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{g.name}</span>
                        <span className="text-xs text-muted-foreground">{subject?.name} • {format(g.date.toDate(), 'P', { locale: dateLocale })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{g.grade}/{g.maxGrade}</div>
                      <Badge variant="secondary" className="text-[10px]">{g.type}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { schools, loading } = useData();
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h2>
        <p className="text-muted-foreground">Gestion globale de la plateforme Trimo</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium opacity-80">
              <SchoolIcon size={16} />
              Total Écoles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{schools.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users size={16} />
              Utilisateurs Actifs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">1,240</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck size={16} />
              Santé Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">100%</div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Écoles Récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schools.map((school) => (
              <div key={school.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <SchoolIcon size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="font-bold">{school.name}</div>
                    <div className="text-xs text-muted-foreground">Plan: {school.subscriptionPlan}</div>
                  </div>
                </div>
                <Badge variant={school.isActive ? "default" : "destructive"}>
                  {school.isActive ? "Actif" : "Suspendu"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SchoolDashboard: React.FC = () => {
  const { classes, loading } = useData();
  
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard École</h2>
        <p className="text-muted-foreground">Gestion de votre établissement</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium opacity-80">
              <BookOpen size={16} />
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{classes.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users size={16} />
              Total Élèves
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">450</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp size={16} />
              Performance Globale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">14.2/20</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Moyenne par Classe</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classes.map(c => ({ name: c.name, avg: 12 + Math.random() * 5 }))}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis domain={[0, 20]} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classes.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.level} • {c.studentIds.length} élèves</div>
                  </div>
                  <Badge variant="outline">Voir détails</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const { loading } = useData();

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!userProfile) return null;

  switch (userProfile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'school':
      return <SchoolDashboard />;
    case 'teacher':
      return <PersonalDashboard />; // Placeholder for teacher specific
    case 'student':
      return <PersonalDashboard />; // Student view is similar to personal
    case 'personal':
    default:
      return <PersonalDashboard />;
  }
};

export default Dashboard;
