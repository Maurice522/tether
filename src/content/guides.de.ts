import type { Guide, GuideSection } from './guides';

const HOW_TO_START: GuideSection = {
  h2: 'So verbindest du deine Geräte',
  steps: [
    { title: 'Sitzung starten', text: 'Öffne tethersecure.com auf dem ersten Gerät und klicke auf „Sitzung starten“. Beim ersten Mal wählst du einen Anzeigenamen; er wird gespeichert.' },
    { title: 'Mit dem anderen Gerät beitreten', text: 'Gib den 6-stelligen Code ein, öffne den Einladungslink oder scanne den QR-Code mit der Handykamera. Bis zu 4 Geräte können beitreten.' },
    { title: 'Kopieren, einfügen, senden', text: 'Kopiere Text, drücke Strg+V auf der Seite, tippe eine Nachricht oder lege eine Datei ab. Alles kommt direkt und verschlüsselt auf den anderen Geräten an.' },
  ],
};

export const guidesDe: Guide[] = [
  {
    slug: 'sync-clipboard',
    title: 'Zwischenablage synchronisieren – PC, Mac & Handy | Tether',
    description: 'Synchronisiere die Zwischenablage zwischen PC, Mac und Handy in Sekunden. Auf einem Gerät kopieren, auf dem anderen einfügen. Verschlüsselt, ohne App.',
    nav: 'Zwischenablage synchronisieren',
    kicker: 'Zwischenablage teilen',
    h1: 'Synchronisiere deine Zwischenablage',
    h1Accent: 'zwischen zwei beliebigen Computern.',
    intro: 'Kopiere einen Link, ein Stück Code oder einen Absatz auf einem Computer und füge ihn eine Sekunde später auf einem anderen ein. Tether gibt allen Geräten deiner Sitzung eine gemeinsame Zwischenablage, direkt von Browser zu Browser, ohne Installation.',
    sections: [
      {
        h2: 'Eine gemeinsame Zwischenablage für jedes Gerät',
        paras: [
          'Die meisten Tools zum Synchronisieren der Zwischenablage funktionieren nur innerhalb eines Ökosystems: Apple mit Apple, Windows mit einem Microsoft-Konto. Tether läuft im Browser und synchronisiert die Zwischenablage zwischen Windows, macOS, Linux, ChromeOS, Android und iPhone in jeder Kombination.',
          'Jeder gesendete Ausschnitt bleibt außerdem in einer gemeinsamen Liste der Sitzung, sodass du ihn später mit einem Klick erneut kopieren kannst, auch wenn du inzwischen etwas anderes kopiert hast.',
        ],
      },
      {
        h2: 'So funktioniert die Synchronisierung in Tether',
        paras: [
          'Browser erlauben einer Website nur dann den Zugriff auf die Zwischenablage, wenn ihr Tab im Vordergrund ist. Erlaube den Zugriff in Chrome und Edge einmal, und Tether sendet das Kopierte, sobald du zum Tab zurückkehrst. In Firefox und Safari drückst du Strg+V (oder ⌘V) irgendwo auf der Seite.',
          'Eingehende Ausschnitte landen in deiner Zwischenablage, sobald du den Tether-Tab öffnest, sodass du sie direkt in jeder App einfügen kannst. Über den Schalter im Bereich „Ausschnitte“ kannst du die Synchronisierung jederzeit pausieren.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Privatsphäre von Anfang an',
        list: [
          'Ausschnitte laufen über eine direkte, verschlüsselte WebRTC-Verbindung zwischen deinen Geräten.',
          'Nichts wird auf einem Server gespeichert; dein Verlauf lebt nur in deinem Browser-Tab.',
          'Kein Konto und keine E-Mail. Sitzungen verschwinden nach 12 Stunden Inaktivität.',
        ],
      },
    ],
    faqs: [
      { q: 'Kann ich die Zwischenablage zwischen Windows und Mac synchronisieren?', a: 'Ja. Öffne Tether auf beiden und tritt derselben Sitzung bei. Kopiere auf dem Windows-PC und füge auf dem Mac ein, oder umgekehrt.' },
      { q: 'Funktioniert die Synchronisierung automatisch im Hintergrund?', a: 'Websites können die Zwischenablage nicht im Hintergrund lesen. Tether synchronisiert, sobald du zu seinem Tab wechselst (Chrome und Edge) oder Strg+V auf der Seite drückst.' },
      { q: 'Kann ich auch Bilder aus der Zwischenablage teilen?', a: 'Füge ein Bild oder einen Screenshot mit Strg+V auf der Tether-Seite ein, und es wird als Datei gesendet, die die anderen Geräte speichern können.' },
    ],
    related: ['send-text-between-devices', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'share-files-securely',
    title: 'Dateien sicher teilen – ohne Upload, verschlüsselt | Tether',
    description: 'Sende und empfange Dateien sicher zwischen PC, Mac und Handy. Direkte, verschlüsselte Peer-to-Peer-Übertragung bis 500 MB. Kein Upload, keine Anmeldung.',
    nav: 'Dateien sicher teilen',
    kicker: 'Sicherer Dateiaustausch',
    h1: 'Dateien sicher teilen,',
    h1Accent: 'ohne sie hochzuladen.',
    intro: 'Fast jeder Weg, sich selbst eine Datei zu schicken, bedeutet, sie zuerst auf den Server von jemand anderem hochzuladen: E-Mail, Cloud-Speicher, Chat-Apps. Bei Tether geht es andersherum: Die Datei läuft direkt von deinem Browser in den Browser des anderen Geräts, über eine verschlüsselte Verbindung, und nirgends bleibt eine Kopie zurück.',
    sections: [
      {
        h2: 'Datei senden, Datei empfangen, nichts auf einem Server',
        paras: [
          'Lege eine Datei irgendwo auf der Tether-Seite ab, klicke auf „Datei senden“ oder füge sie ein. Jede Datei wird in kleinen, verschlüsselten Teilen über einen direkten WebRTC-Datenkanal gesendet und auf dem anderen Gerät wieder zusammengesetzt, wo sie mit Fortschrittsbalken und Speichern-Button erscheint.',
          'Da nichts hochgeladen wird, gibt es kein Speicherlimit, keinen Link, den später jemand finden könnte, und nichts, was du danach löschen müsstest. Dateien bis 500 MB werden unterstützt.',
        ],
      },
      {
        h2: 'An alle senden oder nur an eine Person',
        paras: [
          'Eine Sitzung ist eine kleine Gruppenverbindung mit bis zu 4 Geräten. Sende eine Datei an alle gleichzeitig oder ziehe sie auf die Karte einer Person, um sie nur ihr zu schicken. Für jeden Empfänger siehst du „zugestellt“, damit du weißt, dass sie angekommen ist.',
        ],
      },
      {
        h2: 'Was die Übertragung sicher macht',
        list: [
          'Transportverschlüsselung mit DTLS, dem Standard hinter Videoanrufen im Browser, mit neuen Schlüsseln für jede Verbindung.',
          'Dateien laufen nie über den Server von Tether und werden dort nie gespeichert. Ist keine direkte Verbindung möglich, wird die Datei gar nicht gesendet.',
          'Beitrittscodes laufen nach 10 Minuten ab und Sitzungen sind auf 4 Geräte begrenzt, damit sich niemand Fremdes dazugesellt.',
          'Keine Konten oder persönlichen Daten: nur ein Anzeigename in einem Cookie auf deinem eigenen Gerät.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Werden Dateien bei der Übertragung verschlüsselt?', a: 'Ja. Alle Übertragungen nutzen eine verschlüsselte WebRTC-Verbindung (DTLS) direkt zwischen den beiden Browsern.' },
      { q: 'Wie groß darf eine Datei sein?', a: 'Bis zu 500 MB pro Datei. Größere Dateien hängen davon ab, ob das empfangende Gerät genug Arbeitsspeicher hat.' },
      { q: 'Braucht die andere Person ein Konto?', a: 'Nein. Sie muss nur den Einladungslink öffnen, den QR-Code scannen oder den 6-stelligen Code eingeben.' },
    ],
    related: ['phone-to-pc', 'group-connection', 'sync-clipboard'],
  },
  {
    slug: 'connect-windows-and-mac',
    title: 'Windows und Mac verbinden: Kopieren & Dateien | Tether',
    description: 'Verbinde Windows-PC und Mac in Sekunden. Teile die Zwischenablage, sende Text und übertrage Dateien zwischen Windows und macOS im Browser. Kostenlos.',
    nav: 'Windows & Mac verbinden',
    kicker: 'Windows ↔ Mac',
    h1: 'Windows und Mac verbinden,',
    h1Accent: 'als wären sie füreinander gemacht.',
    intro: 'Windows und macOS teilen keine Zwischenablage, und AirDrop erreicht keinen PC. Tether schließt die Lücke direkt im Browser: Verbinde einen Windows-PC und einen Mac mit einem 6-stelligen Code und kopiere, füge ein und sende Dateien, als wären sie ein einziger Rechner.',
    sections: [
      {
        h2: 'Auf Windows kopieren, auf dem Mac einfügen',
        paras: [
          'Kopiere Text mit Strg+C unter Windows, wechsle zum Tether-Tab, und schon liegt er in der Zwischenablage des Mac, bereit für ⌘V. Umgekehrt funktioniert es genauso, und jeder Ausschnitt bleibt in der gemeinsamen Liste, falls du ihn noch einmal brauchst.',
        ],
      },
      {
        h2: 'Dateien zwischen PC und Mac übertragen',
        paras: [
          'Ziehe eine Datei auf einem der beiden Rechner auf die Tether-Seite, und sie erscheint auf dem anderen mit einem Speichern-Button. Kein USB-Stick, kein Cloud-Upload, keine E-Mail an dich selbst. Übertragungen sind direkt und verschlüsselt, bis 500 MB pro Datei.',
          'Die beiden Computer müssen nicht im selben Netzwerk sein. Ein Firmenlaptop und ein Mac zu Hause verbinden sich genauso einfach über das Internet.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Funktioniert mit deinen vorhandenen Browsern',
        list: [
          'Windows: Chrome, Edge, Firefox, Brave oder Opera.',
          'Mac: Safari, Chrome, Firefox, Edge oder Arc.',
          'Installiere Tether über das Browsermenü als App, um auf beiden Rechnern ein eigenes Fenster zu haben.',
        ],
      },
    ],
    faqs: [
      { q: 'Müssen Windows und Mac im selben WLAN sein?', a: 'Nein. Tether verbindet Geräte über das Internet, sie können also in verschiedenen Netzwerken sein.' },
      { q: 'Gibt es eine Tether-App für Windows oder Mac?', a: 'Tether läuft im Browser; du kannst es unter Windows über Chrome oder Edge und auf dem Mac über Chrome oder Safari als App installieren.' },
      { q: 'Kann ich Screenshots vom Mac an Windows senden?', a: 'Ja. Füge einen Screenshot auf der Tether-Seite ein oder lege die Bilddatei ab, und sie wird an den Windows-PC gesendet.' },
    ],
    related: ['sync-clipboard', 'share-files-securely', 'group-connection'],
  },
  {
    slug: 'phone-to-pc',
    title: 'Dateien vom Handy auf den PC senden – per QR | Tether',
    description: 'Sende Fotos, Dateien und Text von Android oder iPhone auf PC oder Mac und zurück. QR-Code scannen und verbinden. Direkt, verschlüsselt, ohne App.',
    nav: 'Handy zu PC',
    kicker: 'Handy ↔ Computer',
    h1: 'Dateien vom Handy auf den PC,',
    h1Accent: 'mit einem einzigen QR-Scan.',
    intro: 'Ein Foto vom Handy auf den Computer zu bekommen, sollte keine E-Mail an dich selbst erfordern. Starte auf dem PC eine Tether-Sitzung, scanne den QR-Code mit der Handykamera, und du bist verbunden: Sende Dateien, Fotos und Text in beide Richtungen.',
    sections: [
      {
        h2: 'Scannen und verbinden, ohne Tippen',
        paras: [
          'Wenn du auf deinem Computer eine Sitzung startest, zeigt Tether beim Warten einen QR-Code an. Richte die Handykamera darauf, und du bist sofort dabei, ohne Code-Eingabe und ohne App-Download.',
        ],
      },
      {
        h2: 'Direkt aus jeder App teilen',
        paras: [
          'Installiere Tether über den Browser deines Handys („Zum Startbildschirm hinzufügen“), und es erscheint im Teilen-Menü des Handys. Teile ein Foto, ein PDF oder einen Link aus jeder App, wähle Tether, und es wartet in deiner Sitzung, bis du auf „Senden“ tippst.',
          'In die andere Richtung legst du eine Datei auf der Seite am PC ab, und sie kommt auf dem Handy mit einem Speichern-Button an.',
        ],
      },
      {
        h2: 'Text und Links ans Handy senden',
        paras: [
          'Tippe oder füge am Computer etwas in das Feld ein und drücke Enter: Der Text erscheint auf deinem Handy, bereit zum Kopieren. Perfekt für lange URLs, Adressen, WLAN-Daten und alles, was du sonst abtippen würdest.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Funktioniert es mit Android und iPhone?', a: 'Ja. Tether funktioniert in Chrome unter Android und in Safari oder Chrome auf dem iPhone und verbindet sich mit Windows-, Mac- oder Linux-Computern.' },
      { q: 'Müssen Handy und PC im selben WLAN sein?', a: 'Nein, in den meisten Fällen können sie in verschiedenen Netzwerken sein, auch im Mobilfunknetz. Einige strenge Netzwerke blockieren direkte Verbindungen; im selben WLAN ist es am zuverlässigsten.' },
      { q: 'Werden Fotos komprimiert?', a: 'Nein. Dateien werden Byte für Byte genau so gesendet, wie sie auf deinem Gerät liegen.' },
    ],
    related: ['share-files-securely', 'send-text-between-devices', 'sync-clipboard'],
  },
  {
    slug: 'send-text-between-devices',
    title: 'Text zwischen Geräten senden – Zwischenablage | Tether',
    description: 'Sende Text, Links und Code-Schnipsel sofort zwischen deinen Computern und deinem Handy. Eine private Online-Zwischenablage, Peer-to-Peer und verschlüsselt.',
    nav: 'Text senden',
    kicker: 'Text senden',
    h1: 'Text zwischen Geräten senden,',
    h1Accent: 'in weniger als einer Sekunde.',
    intro: 'Lange URLs, Einmal-Codes, ein Befehl, den du auf dem anderen Rechner brauchst, eine Adresse fürs Handy: Mit Tether bringst du ein Stück Text am schnellsten von einem Gerät aufs andere, ohne dir selbst eine Nachricht zu schreiben.',
    sections: [
      {
        h2: 'Tippen, einfügen oder einfach kopieren',
        paras: [
          'Tippe in das Feld und drücke Enter, füge mit Strg+V irgendwo auf der Seite ein, oder kopiere etwas in einer anderen App und wechsle zurück zu Tether. Auf jedem Weg landet der Text auf den anderen Geräten und in der gemeinsamen Liste, wo ein Klick ihn kopiert.',
          'Mit Umschalt+Enter schreibst du mehrzeiligen Text wie Code-Blöcke, und die Formatierung bleibt genau so erhalten, wie du sie getippt hast.',
        ],
      },
      {
        h2: 'Besser, als dir selbst zu schreiben',
        list: [
          'Kein Chatverlauf in der Cloud eines anderen: Text geht direkt zwischen deinen Geräten.',
          'Funktioniert zwischen allen Betriebssystemen und Browsern, auch auf Arbeitsrechnern, auf denen du dich nicht bei privaten Apps anmelden kannst.',
          'Doppelte Sendungen werden automatisch übersprungen, damit die Liste übersichtlich bleibt.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Wird der Text irgendwo gespeichert?', a: 'Nein. Text wird direkt zwischen Browsern gesendet und nur in deinem geöffneten Tab gehalten. Er wird nie auf einem Server gespeichert.' },
      { q: 'Gibt es eine Längenbegrenzung?', a: 'Jeder Textausschnitt darf bis zu 64 KB groß sein, das sind etwa 60.000 Zeichen. Für Längeres sendest du ihn als Datei.' },
      { q: 'Kann ich nur an eine Person senden?', a: 'Text geht an alle in der Sitzung. Für eine private Nachricht startest du eine Sitzung nur mit diesem einen Gerät.' },
    ],
    related: ['sync-clipboard', 'phone-to-pc', 'group-connection'],
  },
  {
    slug: 'group-connection',
    title: 'PCs online verbinden – Gruppenverbindung für 4 | Tether',
    description: 'Verbinde bis zu 4 PCs, Macs und Handys in einer sicheren Gruppensitzung über das Internet. Teile Zwischenablage, Text und Dateien mit allen. Kostenlos.',
    nav: 'Gruppenverbindung',
    kicker: 'PCs verbinden',
    h1: 'Verbinde deine PCs',
    h1Accent: 'zu einer kleinen, privaten Gruppe.',
    intro: 'Tether macht aus bis zu vier Geräten eine private Gruppenverbindung über das Internet: deinen Desktop, deinen Laptop und dein Handy oder die Rechner von ein paar Teammitgliedern. Alle sehen, wer online ist und woran gearbeitet wird, und alles Geteilte erreicht die ganze Gruppe.',
    sections: [
      {
        h2: 'Eine direkte Verbindung zwischen allen Geräten',
        paras: [
          'Jedes Gerät einer Sitzung verbindet sich direkt mit jedem anderen, sodass Text und Dateien nie einen Umweg über einen Server nehmen. Die Live-Karte oben im Raum zeigt jede Verbindung: durchgezogen, wenn sie direkt ist, und sie baut sich von selbst neu auf, wenn jemandes Verbindung abbricht.',
          'Kein gemeinsames Netzwerk nötig, keine Portweiterleitung: Alle PCs, die online sind, können sich verbinden, ob im WLAN zu Hause, per Ethernet im Büro oder über einen Handy-Hotspot.',
        ],
      },
      {
        h2: 'Gemacht für kleine Teams und mehrere Geräte',
        list: [
          'Pair Programming: Befehle, Logs und Code-Schnipsel zwischen zwei Rechnern austauschen.',
          'Präsentationen: Dateien und Links vom Laptop auf den PC im Besprechungsraum bringen.',
          'Design-Reviews: Exporte an die ganze Gruppe auf einmal schicken.',
          'Dein eigener Schreibtisch: Firmenlaptop, Desktop zu Hause und Handy verbinden.',
        ],
      },
      {
        h2: 'In Sekunden einladen, genauso schnell gehen',
        paras: [
          'Teile den 6-stelligen Code, schick den Einladungslink oder lass jemanden den QR-Code scannen. Codes laufen nach 10 Minuten ab, und du kannst jederzeit einen neuen erstellen. Wenn du fertig bist, tippst du zweimal auf „Verlassen“, und dein Platz ist frei.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Wie viele Geräte können einer Sitzung beitreten?', a: 'Bis zu 4 Geräte pro Sitzung.' },
      { q: 'Kann ich sehen, wer verbunden ist?', a: 'Ja. Alle in der Sitzung erscheinen mit ihrem Namen, ob sie aktiv oder abwesend sind, und optional mit der App, in der sie gerade arbeiten.' },
      { q: 'Was passiert, wenn jemand die Verbindung verliert?', a: 'Sein Platz bleibt 15 Minuten reserviert, damit er zurückkommen kann, und die Verbindungen bauen sich bei seiner Rückkehr automatisch neu auf.' },
    ],
    related: ['share-files-securely', 'connect-windows-and-mac', 'send-text-between-devices'],
  },
];
