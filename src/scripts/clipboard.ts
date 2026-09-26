/**
 * What the page is allowed to do with the system clipboard, per browser.
 *
 *  auto        Chromium with clipboard-read granted: we read on focus + while focused.
 *  prompt      Chromium, not asked yet: one click on "Allow" grants it.
 *  denied      Chromium, user blocked it: manual paste still works.
 *  manual      Firefox / Safari: reads need a gesture every time -> Ctrl+V on page.
 */
export type ReadMode = 'auto' | 'prompt' | 'denied' | 'manual';

export async function detectReadMode(onChange: (m: ReadMode) => void): Promise<ReadMode> {
  if (!navigator.clipboard?.readText) return 'manual';
  try {
    const status = await navigator.permissions.query({ name: 'clipboard-read' as PermissionName });
    const map = (s: PermissionState): ReadMode => (s === 'granted' ? 'auto' : s === 'denied' ? 'denied' : 'prompt');
    status.addEventListener('change', () => onChange(map(status.state)));
    return map(status.state);
  } catch {
    // Firefox/Safari don't expose clipboard-read as a queryable permission.
    return 'manual';
  }
}

export async function readClipboard(): Promise<string | null> {
  try {
    return await navigator.clipboard.readText();
  } catch {
    return null;
  }
}

export async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Old-school fallback, only works inside a user gesture.
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
