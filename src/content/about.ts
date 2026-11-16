import type { Lang } from '../i18n';
import type { PrivacyContent } from './privacy';

/** About page content per language. Paragraphs may contain links (rendered as HTML). */
const REPO = 'https://github.com/Maurice522/tether';
const ISSUES = `${REPO}/issues`;
const link = (href: string, text: string) => `<a href="${href}" rel="noopener">${text}</a>`;

export const about: Record<Lang, PrivacyContent> = {
  en: {
    title: 'About Tether: Who Builds It and Why',
    description: 'Tether is an independent, open-source tool for syncing your clipboard and sharing files between devices. Why it exists, how it works and how to reach us.',
    eyebrow: 'About',
    h1: 'A small tool that does <span class="serif">one thing well.</span>',
    lede: 'Tether links your devices for a moment so you can move text and files between them. No accounts, no apps to install, nothing uploaded.',
    sections: [
      { h2: 'Why it exists', paras: ['Moving a link, a few lines of code or a file from one computer to another still often means emailing yourself, messaging yourself or uploading it to a cloud drive. Tether turns that into a two-second job that works on any device with a browser, including between Windows, Mac, Linux, Android and iPhone.'] },
      { h2: 'How it works', paras: ['You start a session and the other device joins with a 6-digit code, an invite link or a QR scan. From then on your browsers talk to each other directly over an encrypted WebRTC connection. Our server only introduces the devices to each other; your files never pass through it and nothing you share is stored. The <a href="/privacy/">privacy page</a> lists exactly what the server sees.'] },
      { h2: 'Who builds it', paras: [`Tether is an independent project, built and maintained by one developer. The source code is public on ${link(REPO, 'GitHub')}, so anyone can check what the site does with their data.`] },
      { h2: 'What it costs', paras: ['Tether is free to use: no account, no ads in the app and no paid plan. Because files travel straight between your devices, it costs very little to run.'] },
      { h2: 'Get in touch', paras: [`Found a bug, have an idea, or need help? ${link(ISSUES, 'Open an issue on GitHub')}. Security reports are welcome there too.`] },
    ],
    back: '← Back to Tether',
  },
  de: {
    title: 'Über Tether: Wer es baut und warum',
    description: 'Tether ist ein unabhängiges Open-Source-Tool für Zwischenablage und Dateien zwischen Geräten. Warum es das gibt, wie es funktioniert, wie du uns erreichst.',
    eyebrow: 'Über uns',
    h1: 'Ein kleines Tool, das <span class="serif">eine Sache gut macht.</span>',
    lede: 'Tether verbindet deine Geräte für einen Moment, damit du Text und Dateien zwischen ihnen verschieben kannst. Ohne Konto, ohne App, ohne Upload.',
    sections: [
      { h2: 'Warum es Tether gibt', paras: ['Einen Link, ein paar Zeilen Code oder eine Datei von einem Rechner auf den anderen zu bringen, heißt oft noch immer: sich selbst eine E-Mail oder Nachricht schicken oder die Datei in eine Cloud hochladen. Tether macht daraus eine Sache von zwei Sekunden, auf jedem Gerät mit Browser, auch zwischen Windows, Mac, Linux, Android und iPhone.'] },
      { h2: 'So funktioniert es', paras: ['Du startest eine Sitzung, und das andere Gerät tritt mit einem 6-stelligen Code, einem Einladungslink oder per QR-Code bei. Danach sprechen eure Browser direkt über eine verschlüsselte WebRTC-Verbindung miteinander. Unser Server stellt die Geräte nur einander vor; deine Dateien laufen nie über ihn, und nichts, was du teilst, wird gespeichert. Auf der <a href="/de/privacy/">Datenschutzseite</a> steht genau, was der Server sieht.'] },
      { h2: 'Wer es baut', paras: [`Tether ist ein unabhängiges Projekt, gebaut und gepflegt von einem einzelnen Entwickler. Der Quellcode ist öffentlich auf ${link(REPO, 'GitHub')}, sodass jeder prüfen kann, was die Website mit seinen Daten macht.`] },
      { h2: 'Was es kostet', paras: ['Tether ist kostenlos: kein Konto, keine Werbung in der App und kein Bezahlplan. Weil Dateien direkt zwischen deinen Geräten laufen, kostet der Betrieb sehr wenig.'] },
      { h2: 'Kontakt', paras: [`Einen Fehler gefunden, eine Idee oder brauchst du Hilfe? ${link(ISSUES, 'Eröffne ein Issue auf GitHub')}. Auch Sicherheitsmeldungen sind dort willkommen.`] },
    ],
    back: '← Zurück zu Tether',
  },
  fr: {
    title: 'À propos de Tether : qui le crée et pourquoi',
    description: 'Tether est un outil indépendant et open source pour partager presse-papiers et fichiers entre appareils. Pourquoi il existe, comment il marche, nous joindre.',
    eyebrow: 'À propos',
    h1: 'Un petit outil qui fait <span class="serif">une chose, et bien.</span>',
    lede: 'Tether relie vos appareils le temps d’un instant pour y faire passer du texte et des fichiers. Sans compte, sans application à installer, sans rien téléverser.',
    sections: [
      { h2: 'Pourquoi il existe', paras: ['Faire passer un lien, quelques lignes de code ou un fichier d’un ordinateur à un autre revient encore souvent à s’envoyer un e-mail, un message ou à passer par un service cloud. Tether en fait une affaire de deux secondes, sur tout appareil doté d’un navigateur, y compris entre Windows, Mac, Linux, Android et iPhone.'] },
      { h2: 'Comment ça marche', paras: ['Vous lancez une session et l’autre appareil la rejoint avec un code à 6 chiffres, un lien d’invitation ou un QR code. Ensuite, vos navigateurs communiquent directement via une connexion WebRTC chiffrée. Notre serveur ne fait que présenter les appareils l’un à l’autre ; vos fichiers n’y passent jamais et rien de ce que vous partagez n’est stocké. La <a href="/fr/privacy/">page confidentialité</a> détaille exactement ce que voit le serveur.'] },
      { h2: 'Qui le développe', paras: [`Tether est un projet indépendant, conçu et maintenu par un seul développeur. Le code source est public sur ${link(REPO, 'GitHub')} : chacun peut vérifier ce que le site fait de ses données.`] },
      { h2: 'Combien ça coûte', paras: ['Tether est gratuit : pas de compte, pas de publicité dans l’application et pas d’offre payante. Comme les fichiers passent directement d’un appareil à l’autre, son fonctionnement coûte très peu.'] },
      { h2: 'Nous contacter', paras: [`Un bug, une idée ou besoin d’aide ? ${link(ISSUES, 'Ouvrez un ticket sur GitHub')}. Les signalements de sécurité y sont aussi les bienvenus.`] },
    ],
    back: '← Retour à Tether',
  },
};

/** AboutPage + Organization JSON-LD with the public repository as a sameAs profile. */
export function aboutSchema(lang: Lang) {
  const SITE = 'https://tethersecure.com';
  const path = lang === 'en' ? '/about/' : `/${lang}/about/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    url: SITE + path,
    inLanguage: lang,
    name: about[lang].title,
    mainEntity: {
      '@type': 'Organization',
      name: 'Tether',
      url: SITE + '/',
      logo: SITE + '/icon-512.png',
      sameAs: [REPO],
    },
  };
}
