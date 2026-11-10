import type { Lang } from '../i18n';

/** Privacy page content per language. Strings may contain <b> and <span class="serif">. */
export interface PrivacyContent {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  sections: { h2: string; paras?: string[]; list?: string[]; after?: string }[];
  back: string;
}

export const privacy: Record<Lang, PrivacyContent> = {
  en: {
    title: 'Privacy & Security: How Tether Protects Your Files',
    description: 'What Tether stores, what it never sees, and how clipboard sync and file transfers between your devices are encrypted, peer-to-peer and never uploaded.',
    eyebrow: 'Privacy & security',
    h1: 'What we see, and what we <span class="serif">never do.</span>',
    lede: 'Tether is built so your clips and files go straight from one browser to another. This page lists exactly what passes through our server and what doesn\'t.',
    sections: [
      { h2: 'Files', paras: ['Files travel only over a direct, encrypted WebRTC connection between the browsers in your session. They are never uploaded, stored or relayed by our server. If a direct connection can\'t be made, Tether tells you the file can\'t be sent rather than routing it elsewhere.'] },
      { h2: 'Blocked file types', paras: ['To keep everyone in a session safe, Tether refuses to send or receive programs, scripts and installers, such as .exe, .bat, .cmd, .msi, .ps1, .vbs, .scr, .apk and .dmg. It also checks the first bytes of every file, so a program renamed to look like a PDF or photo is caught, and looks at the file names inside .zip archives. The check runs in the browser on both ends, so files are still never uploaded for scanning.'] },
      { h2: 'Text clips', paras: ['Clips also use the direct connection. Only when no direct link can be made (some strict corporate or mobile networks block it), a clip is passed through our server to the other person and is not stored. It exists only in memory while being forwarded.'] },
      { h2: 'Encryption', paras: ['Every direct connection is encrypted with DTLS, the standard built into all browsers for video calls and data channels. Keys are generated in your browser for each connection. The site itself is served only over HTTPS.'] },
      {
        h2: 'What the server keeps',
        list: [
          '<b>For each session:</b> a random session ID, the current 6-digit join code (valid 10 minutes), an invite token, and each person\'s display name and 4-character device tag.',
          '<b>While you\'re connected:</b> the status you choose to share (for example "Working in Figma" or your Spotify track), held in memory and never written to disk.',
          '<b>Rate limits:</b> a short-lived counter per IP address to stop people guessing join codes.',
        ],
        after: 'A session and everything in it is deleted automatically after 12 hours with nobody connected. Seats unused for 15 minutes are freed.',
      },
      { h2: 'On your device', paras: ['Your name, device tag and language choice are kept in cookies in your browser (up to 400 days) so you don\'t have to set them again. Your clip history is kept in this browser tab only and disappears when you close it. There are no accounts, no passwords and no email.'] },
      { h2: 'Analytics', paras: ['The website uses Google Tag Manager to understand how many people visit and which pages they use. It never receives your clips or files, which travel only between your devices. Page addresses (including session rooms) are visible to it, like any page view, and an invite link\'s token is removed from the address as soon as the page opens. You can block it with any content blocker and Tether keeps working exactly the same.'] },
      { h2: 'Spotify (optional)', paras: ['If you connect Spotify, the sign-in and the "now playing" lookups happen directly between your browser and Spotify. Only the track title and artist are shown to the people in your session.'] },
    ],
    back: '← Back to Tether',
  },
  de: {
    title: 'Datenschutz & Sicherheit: So schützt Tether deine Dateien',
    description: 'Was Tether speichert, was es nie sieht und wie Zwischenablage und Dateiübertragungen zwischen deinen Geräten verschlüsselt, Peer-to-Peer und ohne Upload laufen.',
    eyebrow: 'Datenschutz & Sicherheit',
    h1: 'Was wir sehen, und was wir <span class="serif">niemals tun.</span>',
    lede: 'Tether ist so gebaut, dass deine Ausschnitte und Dateien direkt von einem Browser zum anderen gehen. Hier steht genau, was über unseren Server läuft und was nicht.',
    sections: [
      { h2: 'Dateien', paras: ['Dateien laufen ausschließlich über eine direkte, verschlüsselte WebRTC-Verbindung zwischen den Browsern deiner Sitzung. Sie werden von unserem Server nie hochgeladen, gespeichert oder weitergeleitet. Ist keine direkte Verbindung möglich, sagt Tether dir, dass die Datei nicht gesendet werden kann, statt sie anders zu leiten.'] },
      { h2: 'Blockierte Dateitypen', paras: ['Damit alle in einer Sitzung sicher bleiben, sendet und empfängt Tether keine Programme, Skripte und Installer wie .exe, .bat, .cmd, .msi, .ps1, .vbs, .scr, .apk und .dmg. Außerdem prüft es die ersten Bytes jeder Datei, sodass ein Programm, das wie ein PDF oder Foto benannt ist, erkannt wird, und schaut sich die Dateinamen in .zip-Archiven an. Die Prüfung läuft auf beiden Seiten im Browser, Dateien werden also auch dafür nie hochgeladen.'] },
      { h2: 'Textausschnitte', paras: ['Ausschnitte nutzen ebenfalls die direkte Verbindung. Nur wenn keine direkte Verbindung möglich ist (manche strengen Firmen- oder Mobilfunknetze blockieren sie), wird ein Ausschnitt über unseren Server an die andere Person weitergereicht und nicht gespeichert. Er existiert nur während der Weiterleitung im Arbeitsspeicher.'] },
      { h2: 'Verschlüsselung', paras: ['Jede direkte Verbindung ist mit DTLS verschlüsselt, dem Standard, den alle Browser für Videoanrufe und Datenkanäle nutzen. Die Schlüssel werden für jede Verbindung in deinem Browser erzeugt. Die Website selbst wird nur über HTTPS ausgeliefert.'] },
      {
        h2: 'Was der Server speichert',
        list: [
          '<b>Pro Sitzung:</b> eine zufällige Sitzungs-ID, der aktuelle 6-stellige Beitrittscode (10 Minuten gültig), ein Einladungstoken sowie Anzeigename und 4-stelliges Gerätekürzel jeder Person.',
          '<b>Während du verbunden bist:</b> der Status, den du teilen möchtest (zum Beispiel „Arbeitet in Figma“ oder dein Spotify-Titel), nur im Arbeitsspeicher und nie auf Festplatte.',
          '<b>Ratenbegrenzung:</b> ein kurzlebiger Zähler pro IP-Adresse, damit niemand Beitrittscodes erraten kann.',
        ],
        after: 'Eine Sitzung und alles darin wird automatisch gelöscht, wenn 12 Stunden lang niemand verbunden war. Plätze, die 15 Minuten ungenutzt sind, werden freigegeben.',
      },
      { h2: 'Auf deinem Gerät', paras: ['Dein Name, dein Gerätekürzel und deine Sprachwahl werden in Cookies in deinem Browser gespeichert (bis zu 400 Tage), damit du sie nicht erneut festlegen musst. Dein Verlauf bleibt nur in diesem Browser-Tab und verschwindet, wenn du ihn schließt. Es gibt keine Konten, keine Passwörter und keine E-Mail.'] },
      { h2: 'Analyse', paras: ['Die Website nutzt Google Tag Manager, um zu verstehen, wie viele Menschen sie besuchen und welche Seiten sie nutzen. Er erhält nie deine Ausschnitte oder Dateien, denn die laufen nur zwischen deinen Geräten. Seitenadressen (auch von Sitzungsräumen) sind für ihn sichtbar, wie bei jedem Seitenaufruf, und das Token eines Einladungslinks wird aus der Adresse entfernt, sobald die Seite geöffnet ist. Du kannst ihn mit jedem Inhaltsblocker blockieren, und Tether funktioniert genauso weiter.'] },
      { h2: 'Spotify (optional)', paras: ['Wenn du Spotify verbindest, laufen Anmeldung und „Läuft gerade“-Abfragen direkt zwischen deinem Browser und Spotify. Den Personen in deiner Sitzung werden nur Titel und Interpret angezeigt.'] },
    ],
    back: '← Zurück zu Tether',
  },
  fr: {
    title: 'Confidentialité : comment Tether protège vos fichiers',
    description: 'Ce que Tether conserve, ce qu’il ne voit jamais, et comment presse-papiers et transferts de fichiers restent chiffrés, pair-à-pair et sans upload.',
    eyebrow: 'Confidentialité et sécurité',
    h1: 'Ce que nous voyons, et ce que nous ne faisons <span class="serif">jamais.</span>',
    lede: 'Tether est conçu pour que vos extraits et vos fichiers passent directement d’un navigateur à l’autre. Cette page détaille exactement ce qui transite par notre serveur et ce qui n’y passe pas.',
    sections: [
      { h2: 'Fichiers', paras: ['Les fichiers passent uniquement par une connexion WebRTC directe et chiffrée entre les navigateurs de votre session. Notre serveur ne les téléverse, ne les stocke et ne les relaie jamais. Si aucune connexion directe n’est possible, Tether vous indique que le fichier ne peut pas être envoyé plutôt que de le faire passer ailleurs.'] },
      { h2: 'Types de fichiers bloqués', paras: ['Pour la sécurité de tous dans une session, Tether refuse d’envoyer ou de recevoir des programmes, scripts et installeurs, comme .exe, .bat, .cmd, .msi, .ps1, .vbs, .scr, .apk et .dmg. Il vérifie aussi les premiers octets de chaque fichier, pour repérer un programme renommé en PDF ou en photo, et examine les noms des fichiers contenus dans les archives .zip. La vérification se fait dans le navigateur, des deux côtés : les fichiers ne sont donc jamais téléversés pour être analysés.'] },
      { h2: 'Extraits de texte', paras: ['Les extraits utilisent eux aussi la connexion directe. Uniquement quand aucune liaison directe n’est possible (certains réseaux d’entreprise ou mobiles très stricts la bloquent), un extrait est transmis à l’autre personne via notre serveur, sans être stocké. Il n’existe en mémoire que le temps de sa transmission.'] },
      { h2: 'Chiffrement', paras: ['Chaque connexion directe est chiffrée avec DTLS, la norme intégrée à tous les navigateurs pour les appels vidéo et les canaux de données. Les clés sont générées dans votre navigateur pour chaque connexion. Le site lui-même n’est servi qu’en HTTPS.'] },
      {
        h2: 'Ce que conserve le serveur',
        list: [
          '<b>Pour chaque session :</b> un identifiant de session aléatoire, le code d’accès à 6 chiffres en cours (valable 10 minutes), un jeton d’invitation, ainsi que le nom d’affichage et l’étiquette d’appareil à 4 caractères de chaque personne.',
          '<b>Pendant que vous êtes connecté :</b> le statut que vous choisissez de partager (par exemple « Travaille sur Figma » ou votre morceau Spotify), conservé en mémoire et jamais écrit sur disque.',
          '<b>Limitation de débit :</b> un compteur éphémère par adresse IP, pour empêcher de deviner les codes d’accès.',
        ],
        after: 'Une session et tout ce qu’elle contient sont supprimés automatiquement après 12 heures sans personne de connecté. Les places inutilisées pendant 15 minutes sont libérées.',
      },
      { h2: 'Sur votre appareil', paras: ['Votre nom, votre étiquette d’appareil et votre choix de langue sont conservés dans des cookies de votre navigateur (jusqu’à 400 jours) pour vous éviter de les redéfinir. Votre historique d’extraits reste uniquement dans cet onglet et disparaît quand vous le fermez. Aucun compte, aucun mot de passe, aucun e-mail.'] },
      { h2: 'Mesure d’audience', paras: ['Le site utilise Google Tag Manager pour savoir combien de personnes le visitent et quelles pages elles consultent. Il ne reçoit jamais vos extraits ni vos fichiers, qui ne circulent qu’entre vos appareils. Les adresses des pages (y compris celles des salles de session) lui sont visibles, comme pour toute page vue, et le jeton d’un lien d’invitation est retiré de l’adresse dès l’ouverture de la page. Vous pouvez le bloquer avec n’importe quel bloqueur de contenu, et Tether continue de fonctionner exactement de la même façon.'] },
      { h2: 'Spotify (facultatif)', paras: ['Si vous connectez Spotify, la connexion et les requêtes « en cours de lecture » se font directement entre votre navigateur et Spotify. Seuls le titre et l’artiste sont affichés aux personnes de votre session.'] },
    ],
    back: '← Retour à Tether',
  },
};
