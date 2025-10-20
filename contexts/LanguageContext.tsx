import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Language } from '@/types';
import { translations } from '@/constants/translations';
import { useAuth } from './AuthContext';

const LANGUAGE_STORAGE_KEY = 'app_language';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const { user, updateUser } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, [user?.language]);

  const loadLanguage = async () => {
    try {
      if (user?.language) {
        setCurrentLanguage(user.language);
      } else {
        const stored = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored && isValidLanguage(stored)) {
          setCurrentLanguage(stored as Language);
        }
      }
    } catch (error) {
      console.error('[Language] Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = useCallback(async (language: Language) => {
    try {
      console.log('[Language] Changing language to:', language);
      setCurrentLanguage(language);
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);

      if (user) {
        await updateUser({ language });
      }
    } catch (error) {
      console.error('[Language] Error changing language:', error);
    }
  }, [user, updateUser]);

  const t = useCallback((key: string, fallback?: string): string => {
    const translation = translations[currentLanguage]?.[key];
    if (translation) return translation;

    const englishTranslation = translations.en[key];
    if (englishTranslation) return englishTranslation;

    return fallback || key;
  }, [currentLanguage]);

  const isValidLanguage = (lang: string): boolean => {
    return ['en', 'es', 'fr', 'de'].includes(lang);
  };

  const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'es', name: 'Spanish', nativeName: 'Español' },
    { code: 'fr', name: 'French', nativeName: 'Français' },
    { code: 'de', name: 'German', nativeName: 'Deutsch' },
  ];

  return useMemo(() => ({
    currentLanguage,
    changeLanguage,
    t,
    availableLanguages,
    isLoading,
  }), [currentLanguage, changeLanguage, t, isLoading]);
});
