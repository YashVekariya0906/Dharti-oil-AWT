import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './locales/en.json';
import guTranslation from './locales/gu.json';

const getInitialLanguage = () => {
  const match = document.cookie.match(/(?:^|;)\s*googtrans=([^;]*)/);
  if (match) {
    if (match[1] === '/en/gu') return 'gu';
    if (match[1] === '/en/en') return 'en';
  }
  return 'en'; // Default to English always
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      gu: { translation: guTranslation }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
