import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { registerRoot } from 'remotion';
import '../styles/global.css';
import { RemotionRoot } from './Root';

i18next.use(initReactI18next).init({
  interpolation: {
    escapeValue: false,
  },
  lng: 'en',
  resources: {
    en: {
      translation: {
        easy: 'EZZZZ',
      },
    },
  },
});

registerRoot(RemotionRoot);
