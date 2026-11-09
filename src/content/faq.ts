import type { Lang } from '../i18n';

export interface Faq { q: string; a: string }

/** Home-page FAQ (English). Rendered as visible <details> and as FAQPage JSON-LD from the same source. */
const en: Faq[] = [
  {
    q: 'What is Tether?',
    a: 'Tether is a free web app that connects your devices so you can sync your clipboard, send text and share files between them. You start a session, the other device joins with a 6-digit code, an invite link or a QR scan, and from then on whatever you copy or drop on one device reaches the others directly, browser to browser.',
  },
  {
    q: 'Is Tether free to use?',
    a: 'Yes. Tether is free, needs no account and has no ads. You only need a modern browser on each device.',
  },
  {
    q: 'How do I sync my clipboard between two computers?',
    a: 'Open tethersecure.com on both computers, press Start a session on one and enter the 6-digit code on the other. Copy text on either computer and switch back to the Tether tab (or press Ctrl+V on the page): it lands on the other computer\'s clipboard and stays in the shared list with a copy button.',
  },
  {
    q: 'Can I connect Windows and Mac with Tether?',
    a: 'Yes. Tether runs in the browser, so it connects Windows, macOS, Linux, ChromeOS, Android and iPhone in any combination. Copy on a Windows PC and paste on a Mac, or send a file from a MacBook to a Windows laptop, without installing anything.',
  },
  {
    q: 'How do I send a file from my phone to my PC?',
    a: 'Start a session on your PC and scan the QR code with your phone\'s camera to join. Then tap Send file on your phone, or drop files on the page on your PC: they transfer straight across and appear with a Save button. If you install Tether from your phone\'s browser, you can also use the phone\'s Share menu and pick Tether.',
  },
  {
    q: 'Is it safe? Are my files uploaded anywhere?',
    a: 'Files are never uploaded. They travel over a direct, encrypted WebRTC connection (DTLS) between the browsers in your session, and Tether\'s server never sees them. Text clips use the same direct connection and only pass through the server, without being stored, if a direct link is impossible on your network.',
  },
  {
    q: 'Do I need to install an app or create an account?',
    a: 'No. Tether works in any modern browser with no download, no sign-up and no email. You just pick a display name, which is remembered in a cookie on your own device. You can optionally install it as an app on your phone or computer for quicker access.',
  },
  {
    q: 'How many devices can I connect at once?',
    a: 'A Tether session is a small group connection of up to 4 devices. Everyone in the session can send text and files to everyone else, or you can send a file to just one person by dropping it on their card.',
  },
  {
    q: 'Is there a file size limit?',
    a: 'You can send files up to 500 MB each. Because files go directly between devices instead of through a server, larger transfers are limited mainly by your connection speed and the memory of the receiving browser.',
  },
  {
    q: 'Does Tether work when the devices are on different networks?',
    a: 'Yes. Devices do not need to be on the same Wi-Fi or LAN; any two PCs online can tether over the internet. A few strict corporate or mobile networks block direct connections; on those, text still arrives through a short-lived relay, while files need a direct link and Tether will tell you if one is not available.',
  },
  {
    q: 'Why does my clipboard sync when I switch back to the Tether tab?',
    a: 'Browsers only let a website read your clipboard while its tab is in front, for your privacy. So after copying in another app, switch to the Tether tab (in Chrome and Edge it then syncs automatically) or press Ctrl+V on the page. Incoming clips are written to your clipboard the moment you return to the tab.',
  },
  {
    q: 'Is Tether an AirDrop alternative for Windows and Android?',
    a: 'Tether covers the same everyday job, quickly moving text, links, photos and files between nearby devices, but it works across every platform, including Windows to Mac and Android to iPhone, and also across different networks.',
  },
];

const de: Faq[] = [
  {
    q: 'Was ist Tether?',
    a: 'Tether ist eine kostenlose Web-App, die deine Geräte verbindet, damit du die Zwischenablage synchronisieren, Text senden und Dateien zwischen ihnen teilen kannst. Du startest eine Sitzung, das andere Gerät tritt mit einem 6-stelligen Code, einem Einladungslink oder per QR-Scan bei, und ab dann landet alles, was du auf einem Gerät kopierst oder ablegst, direkt auf den anderen – von Browser zu Browser.',
  },
  {
    q: 'Ist Tether kostenlos?',
    a: 'Ja. Tether ist kostenlos, braucht kein Konto und zeigt keine Werbung. Du brauchst nur einen aktuellen Browser auf jedem Gerät.',
  },
  {
    q: 'Wie synchronisiere ich die Zwischenablage zwischen zwei Computern?',
    a: 'Öffne tethersecure.com auf beiden Computern, klicke auf einem auf „Sitzung starten“ und gib auf dem anderen den 6-stelligen Code ein. Kopiere Text auf einem der beiden und wechsle zurück zum Tether-Tab (oder drücke Strg+V auf der Seite): Er landet in der Zwischenablage des anderen Computers und bleibt mit einem Kopieren-Button in der gemeinsamen Liste.',
  },
  {
    q: 'Kann ich Windows und Mac mit Tether verbinden?',
    a: 'Ja. Tether läuft im Browser und verbindet Windows, macOS, Linux, ChromeOS, Android und iPhone in jeder Kombination. Kopiere auf einem Windows-PC und füge auf einem Mac ein oder sende eine Datei vom MacBook auf einen Windows-Laptop – ganz ohne Installation.',
  },
  {
    q: 'Wie sende ich eine Datei vom Handy auf meinen PC?',
    a: 'Starte auf dem PC eine Sitzung und scanne den QR-Code mit der Handykamera, um beizutreten. Tippe dann auf dem Handy auf „Datei senden“ oder ziehe Dateien auf dem PC auf die Seite: Sie werden direkt übertragen und erscheinen mit einem Speichern-Button. Wenn du Tether über den Browser deines Handys installierst, kannst du auch das Teilen-Menü des Handys nutzen und Tether auswählen.',
  },
  {
    q: 'Ist das sicher? Werden meine Dateien irgendwo hochgeladen?',
    a: 'Dateien werden nie hochgeladen. Sie laufen über eine direkte, verschlüsselte WebRTC-Verbindung (DTLS) zwischen den Browsern deiner Sitzung, und der Server von Tether sieht sie nie. Textausschnitte nutzen dieselbe direkte Verbindung und gehen nur dann – ohne gespeichert zu werden – über den Server, wenn in deinem Netzwerk keine direkte Verbindung möglich ist.',
  },
  {
    q: 'Muss ich eine App installieren oder ein Konto anlegen?',
    a: 'Nein. Tether funktioniert in jedem aktuellen Browser ohne Download, ohne Registrierung und ohne E-Mail. Du wählst nur einen Anzeigenamen, der in einem Cookie auf deinem eigenen Gerät gespeichert wird. Optional kannst du Tether für schnelleren Zugriff als App auf Handy oder Computer installieren.',
  },
  {
    q: 'Wie viele Geräte kann ich gleichzeitig verbinden?',
    a: 'Eine Tether-Sitzung ist eine kleine Gruppenverbindung mit bis zu 4 Geräten. Alle in der Sitzung können Text und Dateien an alle anderen senden – oder du schickst eine Datei nur an eine Person, indem du sie auf ihre Karte ziehst.',
  },
  {
    q: 'Gibt es eine Größenbeschränkung für Dateien?',
    a: 'Du kannst Dateien mit bis zu 500 MB pro Datei senden. Da Dateien direkt zwischen den Geräten statt über einen Server laufen, hängen große Übertragungen vor allem von deiner Verbindung und dem Arbeitsspeicher des empfangenden Browsers ab.',
  },
  {
    q: 'Funktioniert Tether, wenn die Geräte in verschiedenen Netzwerken sind?',
    a: 'Ja. Die Geräte müssen nicht im selben WLAN oder LAN sein; zwei beliebige PCs, die online sind, können sich über das Internet verbinden. Einige strenge Firmen- oder Mobilfunknetze blockieren direkte Verbindungen; dort kommt Text trotzdem über ein kurzlebiges Relay an, während Dateien eine direkte Verbindung brauchen – Tether sagt dir, wenn keine verfügbar ist.',
  },
  {
    q: 'Warum wird meine Zwischenablage erst synchronisiert, wenn ich zum Tether-Tab wechsle?',
    a: 'Browser erlauben einer Website zum Schutz deiner Privatsphäre nur dann den Zugriff auf die Zwischenablage, wenn ihr Tab im Vordergrund ist. Wechsle also nach dem Kopieren in einer anderen App zum Tether-Tab (in Chrome und Edge wird dann automatisch synchronisiert) oder drücke Strg+V auf der Seite. Eingehende Ausschnitte landen in deiner Zwischenablage, sobald du zum Tab zurückkehrst.',
  },
  {
    q: 'Ist Tether eine AirDrop-Alternative für Windows und Android?',
    a: 'Tether erledigt dieselbe Alltagsaufgabe – Text, Links, Fotos und Dateien schnell zwischen Geräten verschieben –, funktioniert aber plattformübergreifend, also auch von Windows zu Mac und von Android zu iPhone, und sogar über verschiedene Netzwerke hinweg.',
  },
];

const fr: Faq[] = [
  {
    q: 'Qu’est-ce que Tether ?',
    a: 'Tether est une application web gratuite qui relie vos appareils pour synchroniser le presse-papiers, envoyer du texte et partager des fichiers entre eux. Vous lancez une session, l’autre appareil la rejoint avec un code à 6 chiffres, un lien d’invitation ou un QR code, et dès lors tout ce que vous copiez ou déposez sur un appareil arrive directement sur les autres, de navigateur à navigateur.',
  },
  {
    q: 'Tether est-il gratuit ?',
    a: 'Oui. Tether est gratuit, ne demande aucun compte et n’affiche aucune publicité. Il suffit d’un navigateur récent sur chaque appareil.',
  },
  {
    q: 'Comment synchroniser le presse-papiers entre deux ordinateurs ?',
    a: 'Ouvrez tethersecure.com sur les deux ordinateurs, cliquez sur « Démarrer une session » sur l’un et saisissez le code à 6 chiffres sur l’autre. Copiez du texte sur l’un d’eux puis revenez à l’onglet Tether (ou appuyez sur Ctrl+V sur la page) : il arrive dans le presse-papiers de l’autre ordinateur et reste dans la liste partagée avec un bouton Copier.',
  },
  {
    q: 'Puis-je connecter Windows et Mac avec Tether ?',
    a: 'Oui. Tether fonctionne dans le navigateur et relie Windows, macOS, Linux, ChromeOS, Android et iPhone dans toutes les combinaisons. Copiez sur un PC Windows et collez sur un Mac, ou envoyez un fichier d’un MacBook vers un portable Windows, sans rien installer.',
  },
  {
    q: 'Comment envoyer un fichier de mon téléphone vers mon PC ?',
    a: 'Lancez une session sur votre PC et scannez le QR code avec l’appareil photo de votre téléphone pour la rejoindre. Touchez ensuite « Envoyer un fichier » sur le téléphone, ou déposez des fichiers sur la page côté PC : ils sont transférés directement et apparaissent avec un bouton Enregistrer. Si vous installez Tether depuis le navigateur du téléphone, vous pouvez aussi passer par le menu Partager et choisir Tether.',
  },
  {
    q: 'Est-ce sûr ? Mes fichiers sont-ils envoyés sur un serveur ?',
    a: 'Les fichiers ne sont jamais téléversés. Ils passent par une connexion WebRTC directe et chiffrée (DTLS) entre les navigateurs de votre session, et le serveur de Tether ne les voit jamais. Les extraits de texte utilisent la même connexion directe et ne transitent par le serveur, sans y être stockés, que si une liaison directe est impossible sur votre réseau.',
  },
  {
    q: 'Faut-il installer une application ou créer un compte ?',
    a: 'Non. Tether fonctionne dans n’importe quel navigateur récent, sans téléchargement, sans inscription et sans e-mail. Vous choisissez simplement un nom d’affichage, enregistré dans un cookie sur votre propre appareil. Vous pouvez aussi l’installer comme application sur votre téléphone ou votre ordinateur pour y accéder plus vite.',
  },
  {
    q: 'Combien d’appareils puis-je connecter en même temps ?',
    a: 'Une session Tether est une petite connexion de groupe de 4 appareils maximum. Chacun peut envoyer du texte et des fichiers à tous les autres, ou bien vous pouvez envoyer un fichier à une seule personne en le déposant sur sa carte.',
  },
  {
    q: 'Y a-t-il une taille maximale de fichier ?',
    a: 'Vous pouvez envoyer des fichiers jusqu’à 500 Mo chacun. Comme les fichiers passent directement d’un appareil à l’autre au lieu de transiter par un serveur, les gros transferts dépendent surtout de votre connexion et de la mémoire du navigateur qui les reçoit.',
  },
  {
    q: 'Tether fonctionne-t-il si les appareils sont sur des réseaux différents ?',
    a: 'Oui. Les appareils n’ont pas besoin d’être sur le même Wi-Fi ou réseau local ; deux PC connectés à Internet peuvent se relier de n’importe où. Quelques réseaux d’entreprise ou mobiles très stricts bloquent les connexions directes ; le texte arrive alors quand même via un relais éphémère, tandis que les fichiers ont besoin d’une liaison directe, et Tether vous prévient si elle n’est pas disponible.',
  },
  {
    q: 'Pourquoi mon presse-papiers se synchronise-t-il quand je reviens à l’onglet Tether ?',
    a: 'Pour protéger votre vie privée, les navigateurs ne laissent un site lire le presse-papiers que lorsque son onglet est au premier plan. Après avoir copié dans une autre application, revenez donc à l’onglet Tether (dans Chrome et Edge la synchronisation est alors automatique) ou appuyez sur Ctrl+V sur la page. Les extraits reçus sont écrits dans votre presse-papiers dès que vous revenez sur l’onglet.',
  },
  {
    q: 'Tether est-il une alternative à AirDrop pour Windows et Android ?',
    a: 'Tether remplit le même rôle au quotidien, déplacer rapidement du texte, des liens, des photos et des fichiers entre appareils, mais il fonctionne sur toutes les plateformes, y compris de Windows vers Mac et d’Android vers iPhone, et même entre réseaux différents.',
  },
];

export const homeFaqs: Record<Lang, Faq[]> = { en, de, fr };

export function faqJsonLd(faqs: Faq[], lang: Lang = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: lang,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
