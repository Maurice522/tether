import type { Guide, GuideSection } from './guides';

const SWITCH: GuideSection = {
  h2: 'Tether in unter einer Minute ausprobieren',
  steps: [
    { title: 'Tether öffnen', text: 'Öffne tethersecure.com auf dem ersten Gerät und tippe auf Sitzung starten. Beim ersten Mal wählst du einen Anzeigenamen.' },
    { title: 'Mit dem anderen Gerät beitreten', text: 'Gib den 6-stelligen Code ein, öffne den Einladungslink oder scanne den QR-Code. Bis zu 4 Geräte, in jedem Netzwerk.' },
    { title: 'Kopieren, einfügen, senden', text: 'Kopiere Text, drücke Strg+V auf der Seite oder zieh eine Datei hinein. Sie geht direkt und verschlüsselt an die anderen Geräte.' },
  ],
};

export const compareDe: Guide[] = [
  {
    slug: 'snapdrop-alternative',
    title: 'Snapdrop-Alternative: kostenlos, ohne Konto | Tether',
    description: 'Du suchst eine Snapdrop-Alternative? Tether sendet Dateien und teilt die Zwischenablage von Browser zu Browser, in jedem Netzwerk. Kostenlos, ohne Konto.',
    nav: 'Snapdrop-Alternative',
    kicker: 'Snapdrop-Alternative',
    h1: 'Eine Snapdrop-Alternative,',
    h1Accent: 'die in jedem Netzwerk funktioniert.',
    intro: 'Mit Snapdrop konntest du Dateien ganz einfach im Browser von einem Gerät aufs andere schicken. Das ursprüngliche Open-Source-Projekt wird inzwischen von LimeWire betrieben. Wenn du dieselbe Einfachheit ohne Installation und ohne Konto willst, auch für Geräte in verschiedenen Netzwerken, erledigt Tether das im Browser.',
    sections: [
      {
        h2: 'Tether und Snapdrop im Überblick',
        table: {
          head: ['', 'Tether', 'Snapdrop'],
          rows: [
            ['Installation nötig', 'Nein, läuft im Browser', 'Nein, läuft im Browser'],
            ['Geräte in verschiedenen Netzwerken', 'Ja, per Code, Link oder QR', 'Für Geräte im selben Netzwerk gedacht'],
            ['Gemeinsame Zwischenablage', 'Ja, auf einem kopieren, auf dem anderen einfügen', 'Einzelne Textnachrichten senden'],
            ['Konto', 'Nie', 'Nicht fürs einfache Teilen'],
            ['Wohin Dateien gehen', 'Direkt zwischen Browsern, nie hochgeladen', 'Direkt zwischen Browsern im selben Netzwerk'],
            ['Gruppengröße', 'Bis zu 4 Geräte pro Sitzung', 'Alle im Netzwerk sichtbar'],
          ],
        },
      },
      {
        h2: 'Warum Leute von Snapdrop wechseln',
        paras: [
          'Snapdrop findet Geräte automatisch, wenn sie im selben Netzwerk sind. Zu Hause ist das praktisch, aber zwischen einem Laptop im Büro-WLAN und einem Handy im Mobilfunknetz klappt es nicht. Tether koppelt Geräte stattdessen mit einem kurzen Code und funktioniert so zwischen zwei beliebigen Geräten mit Internet.',
          'Tether ist außerdem für die Zwischenablage gebaut, nicht nur für Dateien: Kopiere einen Link oder Code auf einem Rechner, und er ist auf dem anderen bereit zum Einfügen. Jeder Ausschnitt bleibt in einer gemeinsamen Liste, aus der du ihn erneut kopieren kannst.',
        ],
      },
      SWITCH,
      {
        h2: 'Wann Snapdrop-ähnliche Tools besser passen',
        paras: [
          'Wenn alle Geräte immer im selben Heimnetz sind und du nie einen Code eingeben willst, ist automatische Erkennung kaum zu schlagen. Tether braucht pro Sitzung einen Code oder eine Einladung, und der Tab muss auf jedem Gerät offen sein.',
        ],
      },
    ],
    faqs: [
      { q: 'Ist Tether kostenlos wie Snapdrop?', a: 'Ja. Tether ist kostenlos, braucht kein Konto und hat keinen Bezahlplan.' },
      { q: 'Müssen beide Geräte im selben WLAN sein?', a: 'Nein. Tether verbindet Geräte über das Internet mit einem 6-stelligen Code, einem Einladungslink oder einem QR-Code, sie können also in verschiedenen Netzwerken sein.' },
      { q: 'Werden meine Dateien irgendwo hochgeladen?', a: 'Nein. Dateien laufen über eine direkte, verschlüsselte WebRTC-Verbindung zwischen euren Browsern. Blockiert ein Netzwerk direkte Verbindungen, sagt Tether dir das, statt die Datei hochzuladen.' },
    ],
    related: ['pairdrop-alternative', 'share-files-securely', 'airdrop-for-windows'],
  },
  {
    slug: 'pairdrop-alternative',
    title: 'PairDrop vs. Tether: Dateien im Browser teilen',
    description: 'PairDrop vs. Tether: beide teilen Dateien im Browser ohne Konto. So unterscheiden sie sich bei Zwischenablage, Kopplung und Netzwerken, und was zu dir passt.',
    nav: 'PairDrop vs. Tether',
    kicker: 'PairDrop-Alternative',
    h1: 'PairDrop vs. Tether:',
    h1Accent: 'was passt zu dir?',
    intro: 'PairDrop und Tether verschieben beide Inhalte zwischen Geräten aus dem Browser, ohne App und ohne Konto. PairDrop ist ein Open-Source-Fork von Snapdrop und darauf ausgelegt, Dateien an Geräte in der Nähe zu schicken. Tether ist rund um eine gemeinsame Zwischenablage für 2 bis 4 Geräte gebaut, Dateien inklusive.',
    sections: [
      {
        h2: 'PairDrop und Tether im Vergleich',
        table: {
          head: ['', 'Tether', 'PairDrop'],
          rows: [
            ['Installation nötig', 'Nein', 'Nein (Apps verfügbar)'],
            ['Findet Geräte automatisch', 'Nein, Beitritt per Code, Link oder QR', 'Ja, im selben Netzwerk'],
            ['Geräte in verschiedenen Netzwerken', 'Ja', 'Ja, nach dem Koppeln oder über einen öffentlichen Raum'],
            ['Gemeinsame Zwischenablage mit Verlauf', 'Ja', 'Einzelne Textnachrichten senden'],
            ['Konto', 'Nie', 'Nie'],
            ['Open Source', 'Ja', 'Ja'],
          ],
        },
      },
      {
        h2: 'Nimm PairDrop, wenn …',
        list: [
          'du vor allem Dateien mit Leuten im selben Netzwerk teilst und sie automatisch erscheinen sollen.',
          'du den Dienst auf deinem eigenen Server betreiben willst.',
        ],
      },
      {
        h2: 'Nimm Tether, wenn …',
        list: [
          'du den ganzen Tag Text, Links und Code zwischen deinen eigenen Rechnern verschiebst und eine Zwischenablage willst, die dir folgt.',
          'deine Geräte oft in verschiedenen Netzwerken sind, etwa ein Arbeitslaptop und ein Handy im Mobilfunknetz.',
          'du eine kleine private Gruppe (bis zu 4 Geräte) mit Namen, Anwesenheit und gemeinsamem Verlauf willst.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Kann ich PairDrop und Tether zusammen nutzen?', a: 'Ja. Beide sind kostenlose Web-Apps. Nutze PairDrop für schnelles Teilen im Heimnetz und Tether für die Zwischenablage über Netzwerke hinweg.' },
      { q: 'Was ist privater?', a: 'Beide senden Dateien direkt und per WebRTC verschlüsselt zwischen Browsern. Tether speichert weder Dateien noch Ausschnitte auf seinem Server; die Datenschutzseite listet genau auf, was es behält.' },
      { q: 'Wie viele Geräte können einer Tether-Sitzung beitreten?', a: 'Bis zu 4 Geräte pro Sitzung. So bleiben Sitzungen privat und schnell.' },
    ],
    related: ['snapdrop-alternative', 'sync-clipboard', 'localsend-alternative'],
  },
  {
    slug: 'airdrop-for-windows',
    title: 'AirDrop für Windows: iPhone und PC verbinden | Tether',
    description: 'Kein AirDrop für Windows? Tether erledigt das im Browser: Dateien und Text zwischen iPhone, Mac, Windows-PC und Android senden. Kostenlos, ohne App.',
    nav: 'AirDrop für Windows',
    kicker: 'AirDrop für Windows',
    h1: 'AirDrop für Windows,',
    h1Accent: 'direkt im Browser.',
    intro: 'AirDrop funktioniert nur zwischen Apple-Geräten. Hast du ein iPhone und einen Windows-PC oder einen Mac und ein Android-Handy, gibt es keinen eingebauten Weg, eine Datei oder einen Link hinüberzuschicken. Tether schließt diese Lücke im Browser auf jedem Gerät, ohne Installation.',
    sections: [
      {
        h2: 'Was wo funktioniert',
        table: {
          head: ['', 'Tether', 'AirDrop'],
          rows: [
            ['iPhone ↔ Windows-PC', 'Ja', 'Nein'],
            ['Mac ↔ Android', 'Ja', 'Nein'],
            ['Mac ↔ iPhone', 'Ja', 'Ja'],
            ['Geräte weit voneinander entfernt', 'Ja, über das Internet', 'Nein, Geräte müssen in der Nähe sein'],
            ['Gemeinsame Zwischenablage', 'Ja, auf allen Geräten', 'Universelle Zwischenablage, nur Apple-Geräte'],
            ['Installation nötig', 'Nein, jeder Browser', 'In Apple-Geräte eingebaut'],
          ],
        },
      },
      {
        h2: 'Vom iPhone auf den PC in Sekunden',
        paras: [
          'Öffne tethersecure.com auf dem PC und tippe auf Sitzung starten. Richte die iPhone-Kamera auf den QR-Code, und das Handy tritt bei. Jetzt teilst du ein Foto, ein Dokument oder einen Link vom Handy, und es landet auf dem PC. Oder du kopierst Text am PC und fügst ihn auf dem iPhone ein.',
          'Windows hat „In der Nähe teilen“ und Quick Share, aber die funktionieren mit anderen Windows-PCs und Android-Handys, nicht mit dem iPhone. Tether läuft in Safari auf dem iPhone genauso wie in Chrome oder Edge auf dem PC.',
        ],
      },
      SWITCH,
      {
        h2: 'Gut zu wissen',
        list: [
          'Lass den Tether-Tab auf beiden Geräten offen, während du teilst; Browser können nicht im Hintergrund empfangen.',
          'Dateien bis 500 MB gehen direkt zwischen den Geräten und werden nie hochgeladen.',
          'Schalte „Diese Geräte merken“ ein, um iPhone und PC beim nächsten Mal mit einem Tippen zu verbinden.',
        ],
      },
    ],
    faqs: [
      { q: 'Gibt es eine offizielle AirDrop-App für Windows?', a: 'Nein. AirDrop läuft nur auf Apple-Geräten. Tether bietet dir denselben schnellen Ablauf in jedem Browser.' },
      { q: 'Kann ich Fotos ohne iCloud vom iPhone auf Windows senden?', a: 'Ja. Tritt auf beiden Geräten derselben Tether-Sitzung bei und sende die Fotos vom iPhone. Sie gehen direkt auf den PC, nicht über iCloud oder eine andere Cloud.' },
      { q: 'Geht es auch umgekehrt, vom PC aufs iPhone?', a: 'Ja. Zieh eine Datei auf die Tether-Seite am PC, und das iPhone bekommt einen Speichern-Button dafür.' },
    ],
    related: ['phone-to-pc', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'pushbullet-alternative',
    title: 'Pushbullet-Alternative: ohne Konto, ohne App | Tether',
    description: 'Eine kostenlose Pushbullet-Alternative ohne Konto und ohne App. Teile Zwischenablage, Links und Dateien zwischen PC und Handy, direkt und verschlüsselt.',
    nav: 'Pushbullet-Alternative',
    kicker: 'Pushbullet-Alternative',
    h1: 'Eine Pushbullet-Alternative',
    h1Accent: 'ohne Konto und ohne App.',
    intro: 'Pushbullet verbindet Handy und Computer über dein Konto und seine Server. Wenn du nur schnell einen Link, einen Code-Schnipsel oder eine Datei von einem Gerät aufs andere schicken willst, ohne Anmeldung und ohne Installation, erledigt Tether das im Browser.',
    sections: [
      {
        h2: 'Tether vs. Pushbullet',
        table: {
          head: ['', 'Tether', 'Pushbullet'],
          rows: [
            ['Konto', 'Nie', 'Erforderlich'],
            ['Installation', 'Nein, jeder Browser', 'App und Browser-Erweiterung'],
            ['Wohin deine Dateien gehen', 'Direkt zwischen deinen Geräten', 'Über die Server von Pushbullet'],
            ['Kosten', 'Kostenlos, kein Bezahlplan', 'Kostenloser Plan mit Grenzen, bezahlter Pro-Plan'],
            ['Läuft im Hintergrund', 'Nein, Tab offen lassen', 'Ja, als installierte App'],
            ['Handy-Benachrichtigungen am PC', 'Nein', 'Ja'],
          ],
        },
      },
      {
        h2: 'Wo Tether besser passt',
        paras: [
          'Tether ist für den Moment, in dem du etwas sofort rüberschicken willst: einen Link vom Handy auf den Laptop, Code vom Arbeits-PC auf den Mac, eine Datei an die Kollegin neben dir. Seite öffnen, mit Code beitreten, und es geht direkt hinüber, ohne dass irgendwo etwas gespeichert wird.',
          'Weil es kein Konto gibt, musst du dich nirgends anmelden, es liegt kein Verlauf auf einem Server, und hinterher gibt es nichts zu löschen.',
        ],
      },
      {
        h2: 'Wo Pushbullet besser passt',
        paras: [
          'Wenn du die Benachrichtigungen deines Handys auf dem Computer sehen willst oder Nachrichten auch bei geschlossener App ankommen sollen, kann eine installierte App wie Pushbullet Dinge, die eine Webseite nicht kann.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Muss ich etwas installieren?', a: 'Nein. Tether läuft in jedem aktuellen Browser auf Windows, Mac, Linux, Android und iPhone. Wenn du willst, kannst du es zum Startbildschirm hinzufügen.' },
      { q: 'Kann ich Links vom Handy auf den PC schicken?', a: 'Ja. Füge den Link auf dem Handy in Tether ein oder teile ihn dorthin, und er erscheint auf dem PC, bereit zum Öffnen oder Kopieren.' },
      { q: 'Gibt es ein Limit, wie viel ich senden kann?', a: 'Dateien bis 500 MB pro Datei und Textausschnitte bis 64 KB. Es gibt kein Monatslimit.' },
    ],
    related: ['send-text-between-devices', 'phone-to-pc', 'sync-clipboard'],
  },
  {
    slug: 'localsend-alternative',
    title: 'LocalSend-Alternative ohne Installation | Tether',
    description: 'Wie LocalSend, aber ohne Installation und über Netzwerke hinweg. Sende Dateien und Text zwischen PC, Mac und Handy im Browser. Kostenlos und verschlüsselt.',
    nav: 'LocalSend-Alternative',
    kicker: 'LocalSend-Alternative',
    h1: 'Wie LocalSend,',
    h1Accent: 'nur ohne Installation.',
    intro: 'LocalSend ist eine großartige Open-Source-App, um Dateien zwischen Geräten im selben lokalen Netzwerk zu senden. Tether geht einen anderen Weg: Es läuft im Browser, du musst also nichts installieren, und es funktioniert auch, wenn deine Geräte in verschiedenen Netzwerken sind.',
    sections: [
      {
        h2: 'Tether vs. LocalSend',
        table: {
          head: ['', 'Tether', 'LocalSend'],
          rows: [
            ['Installation', 'Nein, jeder Browser', 'App auf jedem Gerät'],
            ['Geräte in verschiedenen Netzwerken', 'Ja', 'Nein, selbes lokales Netzwerk'],
            ['Funktioniert ohne Internet', 'Nein', 'Ja, im lokalen Netzwerk'],
            ['Gemeinsame Zwischenablage', 'Ja, mit Verlauf', 'Einzelne Textnachrichten senden'],
            ['Open Source', 'Ja', 'Ja'],
            ['Konto', 'Nie', 'Nie'],
          ],
        },
      },
      {
        h2: 'Wann Tether sinnvoller ist',
        list: [
          'Du sitzt an einem Rechner, auf dem du keine Apps installieren darfst, etwa einem Arbeits- oder Schul-PC.',
          'Deine Geräte sind in verschiedenen Netzwerken, oder das WLAN trennt Geräte voneinander.',
          'Du willst einmalig mit jemandem teilen, ohne dass die Person etwas installieren muss.',
        ],
      },
      {
        h2: 'Wann LocalSend sinnvoller ist',
        list: [
          'Du hast kein Internet, aber die Geräte sind im selben lokalen Netzwerk.',
          'Du sendest regelmäßig sehr große Dateien; Tether ist auf 500 MB pro Datei begrenzt.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Ist Tether so privat wie LocalSend?', a: 'Beide senden Dateien direkt und verschlüsselt zwischen Geräten, ohne sie auf einem Server zu speichern. Tether braucht seinen Server nur, um die Geräte einander vorzustellen, und sieht deine Dateien nie.' },
      { q: 'Kann ich Tether auf einem Arbeits-PC nutzen?', a: 'Meistens ja, weil es im Browser läuft. Manche Firmennetze blockieren direkte Verbindungen; Text funktioniert dort trotzdem, Dateien brauchen eine direkte Verbindung.' },
      { q: 'Müssen beide Geräte online sein?', a: 'Ja. Beide Browser brauchen eine Internetverbindung und den geöffneten Tether-Tab, während du teilst.' },
    ],
    related: ['share-files-securely', 'pairdrop-alternative', 'connect-windows-and-mac'],
  },
];
