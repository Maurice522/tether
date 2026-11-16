import type { Guide, GuideSection } from './guides';

const SWITCH: GuideSection = {
  h2: 'Essayer Tether en moins d’une minute',
  steps: [
    { title: 'Ouvrir Tether', text: 'Allez sur tethersecure.com sur le premier appareil et appuyez sur Démarrer une session. La première fois, choisissez un nom d’affichage.' },
    { title: 'Rejoindre depuis l’autre appareil', text: 'Saisissez le code à 6 chiffres, ouvrez le lien d’invitation ou scannez le QR code. Jusqu’à 4 appareils, sur n’importe quel réseau.' },
    { title: 'Copier, coller, envoyer', text: 'Copiez du texte, appuyez sur Ctrl+V sur la page ou déposez un fichier. Il part directement vers les autres appareils, chiffré.' },
  ],
};

export const compareFr: Guide[] = [
  {
    slug: 'snapdrop-alternative',
    title: 'Alternative à Snapdrop : gratuite, sans compte | Tether',
    description: 'Une alternative à Snapdrop : Tether envoie fichiers et presse-papiers de navigateur à navigateur, sur tout réseau. Gratuit, sans compte, rien téléversé.',
    nav: 'Alternative à Snapdrop',
    kicker: 'Alternative à Snapdrop',
    h1: 'Une alternative à Snapdrop',
    h1Accent: 'qui marche sur tout réseau.',
    intro: 'Snapdrop permettait d’envoyer facilement un fichier d’un appareil à l’autre dans le navigateur. Le projet open source d’origine est désormais exploité par LimeWire. Si vous voulez la même simplicité, sans installation ni compte, y compris entre appareils sur des réseaux différents, Tether le fait dans votre navigateur.',
    sections: [
      {
        h2: 'Tether et Snapdrop en un coup d’œil',
        table: {
          head: ['', 'Tether', 'Snapdrop'],
          rows: [
            ['Installation', 'Non, dans le navigateur', 'Non, dans le navigateur'],
            ['Appareils sur des réseaux différents', 'Oui, avec un code, un lien ou un QR', 'Conçu pour des appareils sur le même réseau'],
            ['Presse-papiers partagé', 'Oui, copiez sur l’un, collez sur l’autre', 'Envoi de messages texte un par un'],
            ['Compte', 'Jamais', 'Pas pour le partage de base'],
            ['Où vont les fichiers', 'Directement entre navigateurs, jamais téléversés', 'Directement entre navigateurs du même réseau'],
            ['Taille du groupe', 'Jusqu’à 4 appareils par session', 'Tous les appareils visibles sur le réseau'],
          ],
        },
      },
      {
        h2: 'Pourquoi on passe de Snapdrop à Tether',
        paras: [
          'Snapdrop détecte automatiquement les appareils d’un même réseau. C’est pratique à la maison, mais ça ne marche pas entre un portable sur le Wi-Fi du bureau et un téléphone en données mobiles. Tether associe les appareils avec un code court, et fonctionne donc entre deux appareils connectés à Internet, où qu’ils soient.',
          'Tether est aussi pensé pour le presse-papiers, pas seulement les fichiers : copiez un lien ou un extrait de code sur un ordinateur, il est prêt à être collé sur l’autre, et chaque extrait reste dans une liste partagée que vous pouvez recopier.',
        ],
      },
      SWITCH,
      {
        h2: 'Quand un outil de type Snapdrop reste le meilleur choix',
        paras: [
          'Si tous vos appareils sont toujours sur le même réseau domestique et que vous ne voulez jamais saisir de code, la détection automatique est imbattable. Tether demande un code ou une invitation par session, et l’onglet doit être ouvert sur chaque appareil.',
        ],
      },
    ],
    faqs: [
      { q: 'Tether est-il gratuit comme Snapdrop ?', a: 'Oui. Tether est gratuit, sans compte et sans offre payante.' },
      { q: 'Les deux appareils doivent-ils être sur le même Wi-Fi ?', a: 'Non. Tether relie les appareils via Internet avec un code à 6 chiffres, un lien d’invitation ou un QR code : ils peuvent être sur des réseaux différents.' },
      { q: 'Mes fichiers sont-ils téléversés quelque part ?', a: 'Non. Les fichiers passent par une connexion WebRTC directe et chiffrée entre vos navigateurs. Si un réseau bloque les connexions directes, Tether vous le dit au lieu de téléverser le fichier.' },
    ],
    related: ['pairdrop-alternative', 'share-files-securely', 'airdrop-for-windows'],
  },
  {
    slug: 'pairdrop-alternative',
    title: 'PairDrop ou Tether : le partage de fichiers comparé',
    description: 'PairDrop ou Tether : les deux partagent des fichiers dans le navigateur, sans compte. Leurs différences sur le presse-papiers, l’association et les réseaux.',
    nav: 'PairDrop ou Tether',
    kicker: 'Alternative à PairDrop',
    h1: 'PairDrop ou Tether :',
    h1Accent: 'lequel vous convient ?',
    intro: 'PairDrop et Tether font tous deux passer du contenu entre appareils depuis le navigateur, sans application ni compte. PairDrop est un fork open source de Snapdrop, pensé pour envoyer des fichiers aux appareils à proximité. Tether est construit autour d’un presse-papiers partagé pour 2 à 4 appareils, avec les fichiers en plus.',
    sections: [
      {
        h2: 'PairDrop et Tether côte à côte',
        table: {
          head: ['', 'Tether', 'PairDrop'],
          rows: [
            ['Installation', 'Non', 'Non (applications disponibles)'],
            ['Détection automatique des appareils', 'Non, on rejoint avec un code, un lien ou un QR', 'Oui, sur le même réseau'],
            ['Appareils sur des réseaux différents', 'Oui', 'Oui, après association ou via une salle publique'],
            ['Presse-papiers partagé avec historique', 'Oui', 'Envoi de messages texte un par un'],
            ['Compte', 'Jamais', 'Jamais'],
            ['Open source', 'Oui', 'Oui'],
          ],
        },
      },
      {
        h2: 'Choisissez PairDrop si…',
        list: [
          'vous partagez surtout des fichiers avec les appareils du même réseau et voulez qu’ils apparaissent automatiquement ;',
          'vous voulez héberger le service sur votre propre serveur.',
        ],
      },
      {
        h2: 'Choisissez Tether si…',
        list: [
          'vous faites passer du texte, des liens et du code entre vos ordinateurs toute la journée et voulez un presse-papiers qui vous suit ;',
          'vos appareils sont souvent sur des réseaux différents, comme un portable professionnel et un téléphone en données mobiles ;',
          'vous voulez un petit groupe privé (jusqu’à 4 appareils) avec noms, présence et historique partagé.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Puis-je utiliser PairDrop et Tether ensemble ?', a: 'Oui. Ce sont deux applications web gratuites : gardez PairDrop pour les envois rapides chez vous et Tether pour le presse-papiers entre réseaux.' },
      { q: 'Lequel est le plus respectueux de la vie privée ?', a: 'Les deux envoient les fichiers directement entre navigateurs, chiffrés par WebRTC. Tether ne stocke ni fichiers ni extraits sur son serveur ; la page confidentialité détaille ce qu’il conserve.' },
      { q: 'Combien d’appareils peuvent rejoindre une session Tether ?', a: 'Jusqu’à 4 appareils par session, ce qui garde les sessions privées et rapides.' },
    ],
    related: ['snapdrop-alternative', 'sync-clipboard', 'localsend-alternative'],
  },
  {
    slug: 'airdrop-for-windows',
    title: 'AirDrop pour Windows : iPhone vers PC | Tether',
    description: 'Pas d’AirDrop sur Windows, mais Tether fait la même chose dans le navigateur : fichiers et texte entre iPhone, Mac, PC et Android. Gratuit, sans appli.',
    nav: 'AirDrop pour Windows',
    kicker: 'AirDrop pour Windows',
    h1: 'AirDrop pour Windows,',
    h1Accent: 'directement dans le navigateur.',
    intro: 'AirDrop ne fonctionne qu’entre appareils Apple. Avec un iPhone et un PC Windows, ou un Mac et un téléphone Android, aucun moyen intégré ne permet d’envoyer un fichier ou un lien de l’un à l’autre. Tether comble ce manque depuis le navigateur de chaque appareil, sans rien installer.',
    sections: [
      {
        h2: 'Ce qui marche, et où',
        table: {
          head: ['', 'Tether', 'AirDrop'],
          rows: [
            ['iPhone ↔ PC Windows', 'Oui', 'Non'],
            ['Mac ↔ Android', 'Oui', 'Non'],
            ['Mac ↔ iPhone', 'Oui', 'Oui'],
            ['Appareils éloignés', 'Oui, via Internet', 'Non, les appareils doivent être proches'],
            ['Presse-papiers partagé', 'Oui, sur tous les appareils', 'Presse-papiers universel, appareils Apple uniquement'],
            ['Installation', 'Non, tout navigateur', 'Intégré aux appareils Apple'],
          ],
        },
      },
      {
        h2: 'De l’iPhone au PC en quelques secondes',
        paras: [
          'Ouvrez tethersecure.com sur le PC et appuyez sur Démarrer une session. Pointez l’appareil photo de l’iPhone vers le QR code affiché : le téléphone rejoint la session. Partagez ensuite une photo, un document ou un lien depuis le téléphone et il arrive sur le PC, ou copiez du texte sur le PC et collez-le sur l’iPhone.',
          'Windows propose le Partage de proximité et Quick Share, mais ils fonctionnent avec d’autres PC Windows et des téléphones Android, pas avec un iPhone. Tether marche dans Safari sur iPhone comme dans Chrome ou Edge sur PC.',
        ],
      },
      SWITCH,
      {
        h2: 'Bon à savoir',
        list: [
          'Gardez l’onglet Tether ouvert sur les deux appareils pendant le partage : un navigateur ne peut pas recevoir en arrière-plan.',
          'Les fichiers jusqu’à 500 Mo passent directement d’un appareil à l’autre et ne sont jamais téléversés.',
          'Activez « Mémoriser ces appareils » pour reconnecter votre iPhone et votre PC d’un geste la prochaine fois.',
        ],
      },
    ],
    faqs: [
      { q: 'Existe-t-il une application AirDrop officielle pour Windows ?', a: 'Non. AirDrop ne fonctionne que sur les appareils Apple. Tether offre le même geste simple dans n’importe quel navigateur.' },
      { q: 'Puis-je envoyer des photos de l’iPhone vers Windows sans iCloud ?', a: 'Oui. Rejoignez la même session Tether sur les deux appareils et envoyez les photos depuis l’iPhone. Elles vont directement sur le PC, sans passer par iCloud ni aucun autre cloud.' },
      { q: 'Et dans l’autre sens, du PC vers l’iPhone ?', a: 'Oui. Déposez un fichier sur la page Tether du PC et l’iPhone affiche un bouton Enregistrer pour ce fichier.' },
    ],
    related: ['phone-to-pc', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'pushbullet-alternative',
    title: 'Alternative à Pushbullet : sans compte ni appli | Tether',
    description: 'Une alternative gratuite à Pushbullet, sans compte ni application. Partagez presse-papiers, liens et fichiers entre PC et téléphone, en direct et chiffré.',
    nav: 'Alternative à Pushbullet',
    kicker: 'Alternative à Pushbullet',
    h1: 'Une alternative à Pushbullet',
    h1Accent: 'sans compte ni application.',
    intro: 'Pushbullet relie votre téléphone et votre ordinateur via votre compte et ses serveurs. Si vous voulez simplement envoyer un lien, un extrait ou un fichier d’un appareil à l’autre, sans vous connecter ni rien installer, Tether le fait depuis le navigateur.',
    sections: [
      {
        h2: 'Tether ou Pushbullet',
        table: {
          head: ['', 'Tether', 'Pushbullet'],
          rows: [
            ['Compte', 'Jamais', 'Obligatoire'],
            ['Installation', 'Non, tout navigateur', 'Application et extension de navigateur'],
            ['Où vont vos fichiers', 'Directement entre vos appareils', 'Via les serveurs de Pushbullet'],
            ['Prix', 'Gratuit, sans offre payante', 'Offre gratuite limitée, offre Pro payante'],
            ['Fonctionne en arrière-plan', 'Non, gardez l’onglet ouvert', 'Oui, en tant qu’application installée'],
            ['Notifications du téléphone sur le PC', 'Non', 'Oui'],
          ],
        },
      },
      {
        h2: 'Quand Tether convient mieux',
        paras: [
          'Tether sert au moment où vous devez envoyer quelque chose tout de suite : un lien du téléphone vers le portable, du code d’un PC de bureau vers votre Mac, un fichier à un collègue assis à côté. Vous ouvrez la page, rejoignez avec un code, et tout passe directement, sans rien stocker nulle part.',
          'Comme il n’y a pas de compte, rien à créer, aucun historique sur un serveur et rien à supprimer ensuite.',
        ],
      },
      {
        h2: 'Quand Pushbullet convient mieux',
        paras: [
          'Si vous voulez voir les notifications de votre téléphone sur votre ordinateur, ou recevoir des envois même quand l’application est fermée, une application installée comme Pushbullet fait des choses qu’une page web ne peut pas faire.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Dois-je installer quelque chose ?', a: 'Non. Tether fonctionne dans tout navigateur récent sur Windows, Mac, Linux, Android et iPhone. Vous pouvez l’ajouter à votre écran d’accueil si vous le souhaitez.' },
      { q: 'Puis-je envoyer des liens du téléphone vers le PC ?', a: 'Oui. Collez ou partagez le lien dans Tether sur votre téléphone : il apparaît sur votre PC, prêt à être ouvert ou copié.' },
      { q: 'Y a-t-il une limite de volume ?', a: 'Les fichiers peuvent faire jusqu’à 500 Mo chacun et les extraits de texte jusqu’à 64 Ko. Aucun plafond mensuel.' },
    ],
    related: ['send-text-between-devices', 'phone-to-pc', 'sync-clipboard'],
  },
  {
    slug: 'localsend-alternative',
    title: 'Alternative à LocalSend, sans installation | Tether',
    description: 'Comme LocalSend, sans rien installer et entre réseaux différents. Fichiers et texte entre PC, Mac et téléphone, depuis le navigateur. Gratuit, chiffré.',
    nav: 'Alternative à LocalSend',
    kicker: 'Alternative à LocalSend',
    h1: 'Comme LocalSend,',
    h1Accent: 'sans rien installer.',
    intro: 'LocalSend est une excellente application open source pour envoyer des fichiers entre appareils d’un même réseau local. Tether prend une autre voie : il fonctionne dans le navigateur, sans installation, et même quand vos appareils sont sur des réseaux différents.',
    sections: [
      {
        h2: 'Tether ou LocalSend',
        table: {
          head: ['', 'Tether', 'LocalSend'],
          rows: [
            ['Installation', 'Non, tout navigateur', 'Application sur chaque appareil'],
            ['Appareils sur des réseaux différents', 'Oui', 'Non, même réseau local'],
            ['Fonctionne sans Internet', 'Non', 'Oui, sur le réseau local'],
            ['Presse-papiers partagé', 'Oui, avec historique', 'Envoi de texte message par message'],
            ['Open source', 'Oui', 'Oui'],
            ['Compte', 'Jamais', 'Jamais'],
          ],
        },
      },
      {
        h2: 'Quand Tether est plus adapté',
        list: [
          'Vous êtes sur un ordinateur où vous ne pouvez pas installer d’applications, comme un PC de bureau ou d’école.',
          'Vos appareils sont sur des réseaux différents, ou le Wi-Fi isole les appareils les uns des autres.',
          'Vous voulez partager une seule fois avec quelqu’un sans lui demander d’installer quoi que ce soit.',
        ],
      },
      {
        h2: 'Quand LocalSend est plus adapté',
        list: [
          'Vous n’avez pas d’Internet, mais les appareils partagent un réseau local.',
          'Vous envoyez souvent de très gros fichiers ; Tether est limité à 500 Mo par fichier.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Tether est-il aussi respectueux de la vie privée que LocalSend ?', a: 'Les deux envoient les fichiers directement entre appareils, chiffrés, sans les stocker sur un serveur. Tether a besoin de son serveur uniquement pour présenter les appareils l’un à l’autre, et ne voit jamais vos fichiers.' },
      { q: 'Puis-je utiliser Tether sur un PC de bureau ?', a: 'En général oui, car il fonctionne dans le navigateur. Certains réseaux d’entreprise bloquent les connexions directes : le texte passe quand même, les fichiers ont besoin d’une connexion directe.' },
      { q: 'Les deux appareils doivent-ils être en ligne ?', a: 'Oui. Les deux navigateurs ont besoin d’une connexion Internet et de l’onglet Tether ouvert pendant le partage.' },
    ],
    related: ['share-files-securely', 'pairdrop-alternative', 'connect-windows-and-mac'],
  },
];
