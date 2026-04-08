import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from './AuthContext';
import { Period, Subject, Grade, School, Class, UserProfile, UserRole } from '../types';

interface DataContextType {
  periods: Period[];
  subjects: Subject[];
  grades: Grade[];
  schools: School[];
  classes: Class[];
  allUsers: UserProfile[];
  loading: boolean;
  addPeriod: (period: Omit<Period, 'id'>) => Promise<void>;
  updatePeriod: (id: string, period: Partial<Period>) => Promise<void>;
  deletePeriod: (id: string) => Promise<void>;
  addSubject: (subject: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, subject: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  addGrade: (grade: Omit<Grade, 'id'>) => Promise<void>;
  updateGrade: (id: string, grade: Partial<Grade>) => Promise<void>;
  deleteGrade: (id: string) => Promise<void>;
  addSchool: (school: Omit<School, 'id'>) => Promise<void>;
  addClass: (cls: Omit<Class, 'id'>) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  toggleUserStatus: (userId: string, currentStatus: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userProfile) {
      setPeriods([]);
      setSubjects([]);
      setGrades([]);
      setSchools([]);
      setClasses([]);
      setAllUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const isPersonal = userProfile.role === 'personal';
    const schoolId = userProfile.schoolId;
    const isAdmin = userProfile.role === 'admin';
    
    // Determine if we should fetch school/personal specific data
    const basePath = isPersonal ? `users/${user.uid}` : (schoolId ? `schools/${schoolId}` : null);

    const unsubscribes: (() => void)[] = [];

    // Admin specific: all schools and all users
    if (isAdmin) {
      const schoolsUnsub = onSnapshot(
        collection(db, 'schools'),
        (snapshot) => setSchools(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as School))),
        (error) => handleFirestoreError(error, OperationType.LIST, 'schools')
      );
      unsubscribes.push(schoolsUnsub);

      const usersUnsub = onSnapshot(
        collection(db, 'users'),
        (snapshot) => setAllUsers(snapshot.docs.map(doc => ({ ...doc.data() } as UserProfile))),
        (error) => handleFirestoreError(error, OperationType.LIST, 'users')
      );
      unsubscribes.push(usersUnsub);
    }

    // School/Teacher/Student specific: classes
    if (schoolId) {
      const classesUnsub = onSnapshot(
        collection(db, `schools/${schoolId}/classes`),
        (snapshot) => setClasses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Class))),
        (error) => handleFirestoreError(error, OperationType.LIST, `schools/${schoolId}/classes`)
      );
      unsubscribes.push(classesUnsub);
    }

    // Only fetch these if we have a valid basePath (personal or school-assigned)
    if (basePath) {
      // Periods
      const periodsUnsub = onSnapshot(
        query(collection(db, `${basePath}/periods`), orderBy('startDate', 'desc')),
        (snapshot) => setPeriods(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Period))),
        (error) => handleFirestoreError(error, OperationType.LIST, `${basePath}/periods`)
      );
      unsubscribes.push(periodsUnsub);

      // Subjects
      const subjectsUnsub = onSnapshot(
        query(collection(db, `${basePath}/subjects`), orderBy('name')),
        (snapshot) => setSubjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject))),
        (error) => handleFirestoreError(error, OperationType.LIST, `${basePath}/subjects`)
      );
      unsubscribes.push(subjectsUnsub);

      // Grades
      let gradesQuery = query(collection(db, `${basePath}/grades`), orderBy('date', 'desc'));
      if (userProfile.role === 'student') {
        gradesQuery = query(gradesQuery, where('studentId', '==', user.uid));
      }

      const gradesUnsub = onSnapshot(
        gradesQuery,
        (snapshot) => {
          setGrades(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade)));
          setLoading(false);
        },
        (error) => handleFirestoreError(error, OperationType.LIST, `${basePath}/grades`)
      );
      unsubscribes.push(gradesUnsub);
    } else {
      // If no basePath (like a Super Admin without a school), we are done loading
      setLoading(false);
    }

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user, userProfile]);

  const getPath = (subPath: string) => {
    if (!user || !userProfile) throw new Error('Not authenticated');
    const isPersonal = userProfile.role === 'personal';
    const basePath = isPersonal ? `users/${user.uid}` : `schools/${userProfile.schoolId}`;
    return `${basePath}/${subPath}`;
  };

  const addPeriod = async (period: Omit<Period, 'id'>) => {
    try {
      await addDoc(collection(db, getPath('periods')), period);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, getPath('periods'));
    }
  };

  const updatePeriod = async (id: string, period: Partial<Period>) => {
    try {
      await updateDoc(doc(db, getPath('periods'), id), period);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${getPath('periods')}/${id}`);
    }
  };

  const deletePeriod = async (id: string) => {
    try {
      await deleteDoc(doc(db, getPath('periods'), id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${getPath('periods')}/${id}`);
    }
  };

  const addSubject = async (subject: Omit<Subject, 'id'>) => {
    try {
      await addDoc(collection(db, getPath('subjects')), subject);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, getPath('subjects'));
    }
  };

  const updateSubject = async (id: string, subject: Partial<Subject>) => {
    try {
      await updateDoc(doc(db, getPath('subjects'), id), subject);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${getPath('subjects')}/${id}`);
    }
  };

  const deleteSubject = async (id: string) => {
    try {
      await deleteDoc(doc(db, getPath('subjects'), id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${getPath('subjects')}/${id}`);
    }
  };

  const addGrade = async (grade: Omit<Grade, 'id'>) => {
    try {
      await addDoc(collection(db, getPath('grades')), grade);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, getPath('grades'));
    }
  };

  const updateGrade = async (id: string, grade: Partial<Grade>) => {
    try {
      await updateDoc(doc(db, getPath('grades'), id), grade);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${getPath('grades')}/${id}`);
    }
  };

  const deleteGrade = async (id: string) => {
    try {
      await deleteDoc(doc(db, getPath('grades'), id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${getPath('grades')}/${id}`);
    }
  };

  const addSchool = async (school: Omit<School, 'id'>) => {
    try {
      await addDoc(collection(db, 'schools'), school);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'schools');
    }
  };

  const addClass = async (cls: Omit<Class, 'id'>) => {
    try {
      await addDoc(collection(db, `schools/${userProfile?.schoolId}/classes`), cls);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `schools/${userProfile?.schoolId}/classes`);
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), { isActive: !currentStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  return (
    <DataContext.Provider value={{
      periods, subjects, grades, schools, classes, allUsers, loading,
      addPeriod, updatePeriod, deletePeriod,
      addSubject, updateSubject, deleteSubject,
      addGrade, updateGrade, deleteGrade,
      addSchool, addClass, updateUserRole, toggleUserStatus
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
