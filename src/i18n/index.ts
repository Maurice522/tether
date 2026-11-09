import { de } from './de';
import { fr } from './fr';

export const LANGS = ['en', 'de', 'fr'] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = 'en';

export const LANG_NAMES: Record<Lang, string> = { en: 'English', de: 'Deutsch', fr: 'Français' };
export const OG_LOCALE: Record<Lang, string> = { en: 'en_US', de: 'de_DE', fr: 'fr_FR' };
/** Cookie the switcher writes; the app UI (session rooms) follows it, content pages follow the URL. */
export const LANG_COOKIE = 'tether_lang';

const dicts: Record<Exclude<Lang, 'en'>, Record<string, string>> = { de, fr };

export const isLang = (v: unknown): v is Lang => typeof v === 'string' && (LANGS as readonly string[]).includes(v);

export type Vars = Record<string, string | number>;
export type Translate = (s: string, vars?: Vars) => string;

/**
 * gettext-style: the English text is the key, so source stays readable. `{name}` placeholders are filled from `vars`.
 * Missing entries fall back to English (scripts/i18n-check.mjs fails the build if any are missing).
 */
export function translator(lang: Lang): Translate {
  const dict = lang === 'en' ? null : dicts[lang];
  return (s, vars) => {
    let out = dict?.[s] ?? s;
    if (vars) out = out.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
    return out;
  };
}

/** '/sync-clipboard/' → '/de/sync-clipboard/' (English has no prefix). */
export function localePath(lang: Lang, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === DEFAULT_LANG ? clean : `/${lang}${clean === '/' ? '/' : clean}`;
}

/** Same page in every language, for hreflang and the switcher. */
export function alternatesFor(path: string): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, localePath(l, path)])) as Record<Lang, string>;
}

/** Server-side pick for pages without a language in the URL: explicit choice, then the browser's preference. */
export function pickLang(cookie: string | undefined, acceptLanguage: string | null): Lang {
  if (isLang(cookie)) return cookie;
  for (const part of (acceptLanguage ?? '').split(',')) {
    const code = part.split(';')[0].trim().slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return DEFAULT_LANG;
}

/** In the browser: the page's own language, as rendered on <html lang>. */
export function pageLang(): Lang {
  const l = typeof document !== 'undefined' ? document.documentElement.lang : '';
  return isLang(l) ? l : DEFAULT_LANG;
}
