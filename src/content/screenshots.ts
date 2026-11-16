import type { Lang } from '../i18n';

/** Real product screenshots (public/screenshots, captured from a live two-device session). */
interface Shot { src: string; width: number; height: number; alt: Record<Lang, string>; caption: Record<Lang, string>; phone?: boolean }

const shots = {
  room: {
    src: '/screenshots/room.webp', width: 1600, height: 1153,
    alt: {
      en: 'Tether session on a laptop: two linked devices, the 6-digit join code, Remember these devices switched on, and the shared clips list.',
      de: 'Tether-Sitzung auf einem Laptop: zwei verbundene Geräte, der 6-stellige Beitrittscode, „Diese Geräte merken“ eingeschaltet und die gemeinsame Ausschnittliste.',
      fr: 'Session Tether sur un portable : deux appareils reliés, le code à 6 chiffres, « Mémoriser ces appareils » activé et la liste d’extraits partagée.',
    },
    caption: {
      en: 'A live session: both devices are linked directly, and the code invites more.',
      de: 'Eine laufende Sitzung: Beide Geräte sind direkt verbunden, der Code lädt weitere ein.',
      fr: 'Une session en cours : les deux appareils sont reliés en direct, le code en invite d’autres.',
    },
  },
  invite: {
    src: '/screenshots/invite.webp', width: 1600, height: 1153,
    alt: {
      en: 'Starting a Tether session: a QR code to scan with a phone, the 6-digit code and a Copy invite link button.',
      de: 'Eine Tether-Sitzung starten: QR-Code zum Scannen mit dem Handy, 6-stelliger Code und Button „Einladungslink kopieren“.',
      fr: 'Démarrer une session Tether : un QR code à scanner avec un téléphone, le code à 6 chiffres et un bouton pour copier le lien d’invitation.',
    },
    caption: {
      en: 'Start a session and the other device joins by code, link or QR scan. Nothing to install.',
      de: 'Sitzung starten, und das andere Gerät tritt per Code, Link oder QR-Scan bei. Nichts zu installieren.',
      fr: 'Démarrez une session : l’autre appareil la rejoint par code, lien ou QR code. Rien à installer.',
    },
  },
  clips: {
    src: '/screenshots/clips.webp', width: 900, height: 764,
    alt: {
      en: 'Tether shared clipboard: a text clip sent to the other device and a PDF received peer-to-peer with a Save button.',
      de: 'Gemeinsame Zwischenablage in Tether: ein gesendeter Textausschnitt und ein per Peer-to-Peer empfangenes PDF mit Speichern-Button.',
      fr: 'Presse-papiers partagé de Tether : un extrait de texte envoyé et un PDF reçu en pair-à-pair avec un bouton Enregistrer.',
    },
    caption: {
      en: 'Clips and files land in one shared list, sent straight between browsers.',
      de: 'Ausschnitte und Dateien landen in einer gemeinsamen Liste, direkt zwischen Browsern gesendet.',
      fr: 'Extraits et fichiers arrivent dans une liste commune, envoyés directement entre navigateurs.',
    },
  },
  phone: {
    src: '/screenshots/phone.webp', width: 640, height: 1090, phone: true,
    alt: {
      en: 'Tether on an iPhone: a PDF delivered to the laptop with a Pull back option, and a text clip received from the laptop.',
      de: 'Tether auf dem iPhone: ein an den Laptop zugestelltes PDF mit der Option „Zurückziehen“ und ein vom Laptop empfangener Textausschnitt.',
      fr: 'Tether sur iPhone : un PDF livré au portable avec l’option Retirer, et un extrait de texte reçu du portable.',
    },
    caption: {
      en: 'The same session on a phone, in the browser. No app needed.',
      de: 'Dieselbe Sitzung auf dem Handy, im Browser. Keine App nötig.',
      fr: 'La même session sur un téléphone, dans le navigateur. Aucune application nécessaire.',
    },
  },
} satisfies Record<string, Shot>;

const BY_SLUG: Record<string, keyof typeof shots> = {
  'sync-clipboard': 'clips',
  'share-files-securely': 'clips',
  'connect-windows-and-mac': 'room',
  'phone-to-pc': 'phone',
  'send-text-between-devices': 'clips',
  'group-connection': 'room',
  'snapdrop-alternative': 'room',
  'pairdrop-alternative': 'clips',
  'airdrop-for-windows': 'phone',
  'pushbullet-alternative': 'phone',
  'localsend-alternative': 'invite',
};

export function shotFor(slug: string, lang: Lang) {
  const key = BY_SLUG[slug];
  if (!key) return null;
  const s: Shot = shots[key];
  return { src: s.src, width: s.width, height: s.height, alt: s.alt[lang], caption: s.caption[lang], phone: !!s.phone };
}
