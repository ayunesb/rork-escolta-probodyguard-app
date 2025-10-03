import { Language } from '@/types';

const MOCK_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Hello': {
    en: 'Hello',
    es: 'Hola',
    fr: 'Bonjour',
    de: 'Hallo',
  },
  'I am on my way': {
    en: 'I am on my way',
    es: 'Voy en camino',
    fr: 'Je suis en route',
    de: 'Ich bin unterwegs',
  },
  'I have arrived': {
    en: 'I have arrived',
    es: 'He llegado',
    fr: 'Je suis arrivé',
    de: 'Ich bin angekommen',
  },
};

export const translationService = {
  async translate(text: string, from: Language, to: Language): Promise<string> {
    if (from === to) {
      return text;
    }

    console.log('[Translation] Translating:', { text, from, to });

    if (MOCK_TRANSLATIONS[text] && MOCK_TRANSLATIONS[text][to]) {
      return MOCK_TRANSLATIONS[text][to];
    }

    return `[${to.toUpperCase()}] ${text}`;
  },

  async detectLanguage(text: string): Promise<Language> {
    const spanishWords = ['hola', 'gracias', 'por favor', 'sí', 'no'];
    const frenchWords = ['bonjour', 'merci', 'oui', 'non'];
    const germanWords = ['hallo', 'danke', 'ja', 'nein'];

    const lowerText = text.toLowerCase();

    if (spanishWords.some(word => lowerText.includes(word))) {
      return 'es';
    }
    if (frenchWords.some(word => lowerText.includes(word))) {
      return 'fr';
    }
    if (germanWords.some(word => lowerText.includes(word))) {
      return 'de';
    }

    return 'en';
  },

  getLanguageName(code: Language): string {
    const names: Record<Language, string> = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch',
    };
    return names[code];
  },
};
