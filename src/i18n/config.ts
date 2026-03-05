import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import hi from './locales/hi.json';
import bn from './locales/bn.json';
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import id from './locales/id.json';
import tr from './locales/tr.json';
import vi from './locales/vi.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import it from './locales/it.json';
import pl from './locales/pl.json';
import th from './locales/th.json';
import tl from './locales/tl.json';

const resources = {
    en, es, fr, pt, de, ar, hi, bn, zh, ja, id, tr, vi, ko, ru, it, pl, th, tl
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
            lookupQuerystring: 'lang',
        }
    });

export default i18n;
