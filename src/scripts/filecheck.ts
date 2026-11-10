/**
 * Blocks programs, scripts and installers from being sent or received.
 *
 * Three layers, run on the sender before anything leaves and again on the receiver
 * (so a modified sender can't sneak one through):
 *  1. the file name's real extension (trailing dots/spaces and bidi tricks stripped),
 *  2. the file's first bytes, so a renamed program ("report.pdf" that is really an .exe) is caught,
 *  3. the names inside .zip archives (read from the archive's index, nothing is unpacked).
 */

/** Extensions that run code when opened on Windows, macOS, Linux or Android. */
const BLOCKED = new Set([
  // Windows programs and libraries
  'exe', 'com', 'scr', 'pif', 'cpl', 'dll', 'sys', 'drv', 'ocx', 'msc',
  // Windows installers and packages
  'msi', 'msp', 'mst', 'msix', 'msixbundle', 'appx', 'appxbundle', 'appref-ms',
  // Windows scripts and shortcuts that run on double-click
  'bat', 'cmd', 'ps1', 'psm1', 'psd1', 'vbs', 'vbe', 'jse', 'wsf', 'wsh', 'wsc', 'hta', 'reg', 'inf', 'lnk', 'scf', 'url', 'library-ms', 'settingcontent-ms',
  // Other platforms
  'app', 'pkg', 'command', 'dmg', 'apk', 'xapk', 'aab', 'ipa', 'deb', 'rpm', 'appimage', 'run', 'jar',
]);

/** Invisible characters used to disguise names, e.g. "invoice‮fdp.exe" shows as "invoiceexe.pdf". */
const BIDI = /[‎‏‪-‮⁦-⁩]/g;

export type BlockReason = 'type' | 'content' | 'archive';
export interface Verdict { ok: boolean; reason?: BlockReason; detail?: string }

/** The extension Windows/macOS would actually use: lowercased, with trailing dots and spaces ignored. */
export function realExt(name: string): string {
  const clean = name.replace(BIDI, '').replace(/[.\s]+$/, '');
  const dot = clean.lastIndexOf('.');
  return dot > 0 || (dot === 0 && clean.length > 1) ? clean.slice(dot + 1).toLowerCase() : '';
}

export const blockedName = (name: string) => BLOCKED.has(realExt(name));

/** Does this start like a program? Checks Windows (MZ), Linux (ELF) and macOS (Mach-O) executables. */
export function looksExecutable(head: Uint8Array): boolean {
  const b = head;
  if (b.length >= 2 && b[0] === 0x4d && b[1] === 0x5a) return true;                       // MZ: .exe/.dll/.scr…
  if (b.length >= 4 && b[0] === 0x7f && b[1] === 0x45 && b[2] === 0x4c && b[3] === 0x46) return true; // \x7fELF
  if (b.length >= 4) {
    const be = ((b[0] << 24) | (b[1] << 16) | (b[2] << 8) | b[3]) >>> 0;
    const le = ((b[3] << 24) | (b[2] << 16) | (b[1] << 8) | b[0]) >>> 0;
    const macho = [0xfeedface, 0xfeedfacf];
    if (macho.includes(be) || macho.includes(le)) return true;
    // 0xCAFEBABE is both a macOS universal binary and a Java .class; universal binaries have a small arch count next.
    if (be === 0xcafebabe && b.length >= 8 && ((b[4] << 24) | (b[5] << 16) | (b[6] << 8) | b[7]) < 20) return true;
  }
  return false;
}

const u16 = (v: DataView, o: number) => v.getUint16(o, true);
const u32 = (v: DataView, o: number) => v.getUint32(o, true);

/** Names of the entries in a .zip, read from its central directory. Null if it isn't a readable zip. */
async function zipNames(blob: Blob): Promise<string[] | null> {
  const tailLen = Math.min(blob.size, 65_557); // max comment (65535) + end record (22)
  const tail = new DataView(await blob.slice(blob.size - tailLen).arrayBuffer());
  let eocd = -1;
  for (let i = tail.byteLength - 22; i >= 0; i--) if (u32(tail, i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return null;
  const cdSize = u32(tail, eocd + 12);
  const cdOff = u32(tail, eocd + 16);
  if (cdOff === 0xffffffff || cdSize > 16 * 1024 * 1024 || cdOff + cdSize > blob.size) return null; // zip64 or bogus
  const cd = new DataView(await blob.slice(cdOff, cdOff + cdSize).arrayBuffer());
  const dec = new TextDecoder();
  const names: string[] = [];
  for (let p = 0; p + 46 <= cd.byteLength && u32(cd, p) === 0x02014b50;) {
    const nLen = u16(cd, p + 28), xLen = u16(cd, p + 30), cLen = u16(cd, p + 32);
    names.push(dec.decode(new Uint8Array(cd.buffer, cd.byteOffset + p + 46, Math.min(nLen, cd.byteLength - p - 46))));
    p += 46 + nLen + xLen + cLen;
  }
  return names;
}

const isZip = (head: Uint8Array) => head.length >= 4 && head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04;

/** Full check of a file (sender side, and on the receiver once every byte has arrived). */
export async function checkFile(file: Blob & { name: string }): Promise<Verdict> {
  if (blockedName(file.name)) return { ok: false, reason: 'type', detail: realExt(file.name) };
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  if (looksExecutable(head)) return { ok: false, reason: 'content' };
  if (isZip(head)) {
    const names = await zipNames(file).catch(() => null);
    const bad = names?.find((n) => blockedName(n));
    if (bad) return { ok: false, reason: 'archive', detail: bad.split('/').pop() };
  }
  return { ok: true };
}
