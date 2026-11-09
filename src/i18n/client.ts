import { pageLang, translator } from './index';

/** Translator for browser scripts: follows <html lang> of the current page. */
export const T = translator(pageLang());
export const LANG = pageLang();
