import fs from 'fs';
import path from 'path';

const API_KEY = 'AIzaSyDgyWwwmHOROsPZclCm-LGzZs_uoYNhVDk';
const LANGUAGES = [
    'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh', 'ja', 'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

// Helper to decode HTML entities (dirty but works for common ones)
function decodeEntities(text) {
    return text
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
}

async function translate(text, targetLang) {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, target: targetLang, format: 'text' }) // Use format: text to avoid HTML entities
    });
    const data = await response.json();
    return data.data.translations[0].translatedText;
}

const enPath = path.resolve('src/i18n/locales/en.json');
const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

async function updateTranslations() {
    for (const lang of LANGUAGES) {
        const langPath = path.resolve(`src/i18n/locales/${lang}.json`);
        let langContent = {};
        if (fs.existsSync(langPath)) {
            try {
                langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
            } catch (e) {
                langContent = { translation: {} };
            }
        } else {
            langContent = { translation: {} };
        }

        console.log(`Updating ${lang}...`);

        // Recursive sync function
        async function sync(objEn, objTarget) {
            for (const key in objEn) {
                if (typeof objEn[key] === 'object' && objEn[key] !== null) {
                    if (!objTarget[key]) objTarget[key] = {};
                    await sync(objEn[key], objTarget[key]);
                } else {
                    if (!objTarget[key] || objTarget[key].includes('&')) { // Re-translate if missing or has entities
                        console.log(`  Translating key: ${key}`);
                        const translated = await translate(objEn[key], lang);
                        objTarget[key] = decodeEntities(translated);
                    }
                }
            }
        }

        await sync(enContent.translation, langContent.translation);
        fs.writeFileSync(langPath, JSON.stringify(langContent, null, 2));
    }
    console.log('All translations updated and cleaned!');
}

updateTranslations().catch(console.error);
