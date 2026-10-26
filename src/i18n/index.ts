import en from './en';
import pl from './pl';
import tr from './tr';

export const languages = { en: 'English', pl: 'Polski', tr: 'Türkçe' } as const;
export type Lang = keyof typeof languages;
export const langs = Object.keys(languages) as Lang[];
export const defaultLang: Lang = 'en';

const dicts = { en, pl, tr };

export function t(lang: Lang) {
  return dicts[lang];
}

export const htmlLang: Record<Lang, string> = { en: 'en', pl: 'pl', tr: 'tr' };
