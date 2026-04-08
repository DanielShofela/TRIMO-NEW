import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '../i18n';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, updateProfile } = useAuth();
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    if (userProfile?.preferences?.language) {
      setLanguageState(userProfile.preferences.language);
    }
  }, [userProfile]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    updateProfile({ preferences: { ...userProfile?.preferences, language: lang } as any });
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
