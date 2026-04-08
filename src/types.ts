export type UserRole = 'admin' | 'school' | 'teacher' | 'student' | 'personal';

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: 'fr' | 'en';
  consentStatus: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  schoolId?: string;
  isActive?: boolean;
  createdAt: any; // Firestore Timestamp
  preferences: UserPreferences;
}

export interface School {
  id: string;
  name: string;
  ownerId: string;
  createdAt: any;
  subscriptionPlan: 'free' | 'premium' | 'enterprise';
  isActive: boolean;
}

export interface Class {
  id: string;
  schoolId: string;
  name: string;
  level: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface Period {
  id: string;
  schoolId?: string; // Optional for personal accounts
  name: string;
  startDate: any; // Firestore Timestamp
  endDate: any; // Firestore Timestamp
  goal: number;
  isActive: boolean;
}

export interface Subject {
  id: string;
  schoolId?: string; // Optional for personal accounts
  name: string;
  coefficient: number;
  color: string;
  goal: number;
  icon: string;
}

export type GradeType = 'Contrôle' | 'Devoir' | 'Quiz' | 'Projet' | 'Oral' | 'Présentation';

export interface Grade {
  id: string;
  schoolId?: string;
  studentId: string;
  teacherId?: string;
  subjectId: string;
  periodId: string;
  classId?: string;
  name: string;
  grade: number;
  maxGrade: number;
  type: GradeType;
  date: any; // Firestore Timestamp
  comment?: string;
  bonus?: number;
  isPlanned?: boolean;
}

export interface TranslationStrings {
  dashboard: string;
  subjects: string;
  grades: string;
  periods: string;
  settings: string;
  average: string;
  goal: string;
  annualAverage: string;
  recentGrades: string;
  addGrade: string;
  addSubject: string;
  addPeriod: string;
  login: string;
  logout: string;
  welcome: string;
  // ... more to add
}
