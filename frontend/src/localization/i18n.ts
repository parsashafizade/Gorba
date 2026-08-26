import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

export type Locale = 'fa' | 'en';

const storedLocale = window.localStorage.getItem('tiny-yes-locale');
const initialLocale: Locale = storedLocale === 'fa' ? 'fa' : 'en';

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLocale,
  fallbackLng: 'en',
  supportedLngs: ['fa', 'en'],
  interpolation: { escapeValue: false },
});

export const applyDocumentLocale = (locale: Locale) => {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr';
  window.localStorage.setItem('tiny-yes-locale', locale);
};

applyDocumentLocale(initialLocale);

export default i18n;
