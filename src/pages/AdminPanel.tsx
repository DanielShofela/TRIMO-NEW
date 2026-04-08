import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  School as SchoolIcon, 
  ShieldCheck, 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  Ban,
  CheckCircle,
  Trash2,
  BarChart3,
  Activity,
  Settings
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { UserRole } from '../types';
import { toast } from 'sonner';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const AdminPanel: React.FC = () => {
  const { allUsers, schools, classes, updateUserRole, toggleUserStatus, loading } = useData();
  const { userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (userProfile?.role !== 'admin') {
    return <div className="p-8 text-center">Accès refusé.</div>;
  }

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = [
    { name: 'Admin', value: allUsers.filter(u => u.role === 'admin').length, color: '#ef4444' },
    { name: 'École', value: allUsers.filter(u => u.role === 'school').length, color: '#3b82f6' },
    { name: 'Enseignant', value: allUsers.filter(u => u.role === 'teacher').length, color: '#10b981' },
    { name: 'Étudiant', value: allUsers.filter(u => u.role === 'student').length, color: '#f59e0b' },
    { name: 'Personnel', value: allUsers.filter(u => u.role === 'personal').length, color: '#8b5cf6' },
  ];

  const growthData = [
    { month: 'Jan', users: 100 },
    { month: 'Feb', users: 250 },
    { month: 'Mar', users: 480 },
    { month: 'Apr', users: allUsers.length },
  ];

  return (
    <div className="space-y-8 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Trimo Root Panel</h1>
          <p className="text-muted-foreground">Supervision stratégique et gestion multi-tenant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Activity size={16} />
            Logs Système
          </Button>
          <Button className="gap-2">
            <UserPlus size={16} />
            Nouvel Admin
          </Button>
        </div>
      </header>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 size={16} /> Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users size={16} /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="schools" className="gap-2">
            <SchoolIcon size={16} /> Écoles
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings size={16} /> Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="border-none bg-primary text-primary-foreground shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-80">Total Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{allUsers.length}</div>
                <p className="text-xs opacity-70">+12% ce mois</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Écoles Actives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{schools.filter(s => s.isActive).length}</div>
                <p className="text-xs text-green-500">98% du total</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Classes Totales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{classes.length}</div>
                <p className="text-xs text-muted-foreground">Moy. 12 élèves/classe</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Santé Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-500">100%</div>
                <p className="text-xs text-muted-foreground">Uptime: 99.99%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Croissance Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={growthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Répartition par Rôle</CardTitle>
              </CardHeader>
              <CardContent className="flex h-[300px] items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roleStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {roleStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {roleStats.map((stat) => (
                    <div key={stat.name} className="flex items-center gap-2 text-sm">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                      <span className="text-muted-foreground">{stat.name}:</span>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Monétisation & Abonnements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Revenu Mensuel (MRR)</span>
                      <span className="text-2xl font-bold">4,250 €</span>
                    </div>
                    <Badge className="bg-green-500">+15%</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Plans Enterprise</div>
                      <div className="text-xl font-bold">12</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="text-xs text-muted-foreground">Plans Premium</div>
                      <div className="text-xl font-bold">85</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Logs Activité Récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Nouvelle École', user: 'Admin', time: '2 min ago', type: 'info' },
                    { action: 'Compte Suspendu', user: 'Admin', time: '15 min ago', type: 'warning' },
                    { action: 'Erreur API Firestore', user: 'System', time: '1h ago', type: 'error' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                      <div className="flex flex-col">
                        <span className="font-medium">{log.action}</span>
                        <span className="text-xs text-muted-foreground">par {log.user}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Rechercher un utilisateur..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="school">École</SelectItem>
                  <SelectItem value="teacher">Enseignant</SelectItem>
                  <SelectItem value="student">Étudiant</SelectItem>
                  <SelectItem value="personal">Personnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Utilisateur</th>
                  <th className="px-6 py-4 font-medium">Rôle</th>
                  <th className="px-6 py-4 font-medium">Statut</th>
                  <th className="px-6 py-4 font-medium">Créé le</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {u.displayName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{u.displayName}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="capitalize">{u.role}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive !== false ? "default" : "destructive"}>
                        {u.isActive !== false ? "Actif" : "Suspendu"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(u.createdAt.toDate(), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleUserStatus(u.uid, u.isActive !== false)}
                        >
                          {u.isActive !== false ? <Ban size={16} className="text-destructive" /> : <CheckCircle size={16} className="text-green-500" />}
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="schools" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <Card key={school.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="h-2 bg-primary" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold">{school.name}</CardTitle>
                  <Badge variant={school.subscriptionPlan === 'enterprise' ? 'default' : 'secondary'}>
                    {school.subscriptionPlan}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Classes:</span>
                    <span className="font-bold">{classes.filter(c => c.schoolId === school.id).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Statut:</span>
                    <span className={school.isActive ? "text-green-500 font-bold" : "text-destructive font-bold"}>
                      {school.isActive ? "Actif" : "Suspendu"}
                    </span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">Détails</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-destructive hover:bg-destructive/10">Suspendre</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Configuration Plateforme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nom de la Plateforme</label>
                  <Input defaultValue="Trimo EdTech" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Support</label>
                  <Input defaultValue="support@trimo.com" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium">Inscriptions Ouvertes</span>
                  <span className="text-sm text-muted-foreground">Permettre aux nouvelles écoles de s'inscrire</span>
                </div>
                <Button variant="outline">Activé</Button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex flex-col">
                  <span className="font-medium">Mode Maintenance</span>
                  <span className="text-sm text-muted-foreground">Désactiver l'accès pour tous les utilisateurs</span>
                </div>
                <Button variant="destructive">Désactivé</Button>
              </div>
              <div className="pt-4 border-t">
                <Button className="w-full md:w-auto">Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
