import type { Guide, GuideSection } from './guides';

const HOW_TO_START: GuideSection = {
  h2: 'Comment relier vos appareils',
  steps: [
    { title: 'Démarrer une session', text: 'Ouvrez tethersecure.com sur le premier appareil et cliquez sur « Démarrer une session ». La première fois, choisissez un nom d’affichage ; il est mémorisé.' },
    { title: 'Rejoindre depuis l’autre appareil', text: 'Saisissez le code à 6 chiffres, ouvrez le lien d’invitation ou scannez le QR code avec l’appareil photo d’un téléphone. Jusqu’à 4 appareils peuvent rejoindre la session.' },
    { title: 'Copier, coller, envoyer', text: 'Copiez du texte, appuyez sur Ctrl+V sur la page, tapez un message ou déposez un fichier. Tout arrive directement sur les autres appareils, chiffré.' },
  ],
};

export const guidesFr: Guide[] = [
  {
    slug: 'sync-clipboard',
    title: 'Synchroniser le presse-papiers entre ordinateurs | Tether',
    description: 'Synchronisez le presse-papiers entre PC, Mac et téléphone en quelques secondes. Copiez sur un appareil, collez sur l’autre. Chiffré, sans application.',
    nav: 'Synchroniser le presse-papiers',
    kicker: 'Presse-papiers partagé',
    h1: 'Synchronisez votre presse-papiers',
    h1Accent: 'entre deux ordinateurs, quels qu’ils soient.',
    intro: 'Copiez un lien, un bout de code ou un paragraphe sur un ordinateur et collez-le sur un autre une seconde plus tard. Tether donne à tous les appareils de votre session un presse-papiers commun, directement de navigateur à navigateur, sans rien installer.',
    sections: [
      {
        h2: 'Un presse-papiers commun sur tous vos appareils',
        paras: [
          'La plupart des outils de synchronisation du presse-papiers ne fonctionnent que dans un seul écosystème : Apple avec Apple, Windows avec un compte Microsoft. Tether fonctionne dans le navigateur et synchronise le presse-papiers entre Windows, macOS, Linux, ChromeOS, Android et iPhone, dans toutes les combinaisons.',
          'Chaque extrait envoyé reste aussi dans une liste partagée de la session, pour le recopier plus tard d’un clic, même après avoir copié autre chose.',
        ],
      },
      {
        h2: 'Comment fonctionne la synchronisation dans Tether',
        paras: [
          'Les navigateurs ne laissent un site lire le presse-papiers que lorsque son onglet est au premier plan. Dans Chrome et Edge, autorisez l’accès une fois et Tether envoie ce que vous avez copié dès que vous revenez sur son onglet. Dans Firefox et Safari, appuyez sur Ctrl+V (ou ⌘V) n’importe où sur la page.',
          'Les extraits reçus sont écrits dans votre presse-papiers dès que vous ouvrez l’onglet Tether, pour les coller directement dans n’importe quelle application. Vous pouvez suspendre la synchronisation à tout moment avec l’interrupteur du panneau Extraits.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Confidentiel par conception',
        list: [
          'Les extraits passent par une connexion WebRTC directe et chiffrée entre vos appareils.',
          'Rien n’est stocké sur un serveur ; votre historique ne vit que dans l’onglet de votre navigateur.',
          'Pas de compte, pas d’e-mail. Les sessions disparaissent après 12 heures d’inactivité.',
        ],
      },
    ],
    faqs: [
      { q: 'Puis-je synchroniser le presse-papiers entre Windows et Mac ?', a: 'Oui. Ouvrez Tether sur les deux et rejoignez la même session. Copiez sur le PC Windows et collez sur le Mac, ou l’inverse.' },
      { q: 'La synchronisation fonctionne-t-elle automatiquement en arrière-plan ?', a: 'Un site web ne peut pas lire le presse-papiers en arrière-plan. Tether synchronise dès que vous revenez sur son onglet (Chrome et Edge) ou quand vous appuyez sur Ctrl+V sur la page.' },
      { q: 'Puis-je partager des images du presse-papiers ?', a: 'Collez une image ou une capture d’écran sur la page Tether avec Ctrl+V : elle est envoyée comme fichier que les autres appareils peuvent enregistrer.' },
    ],
    related: ['send-text-between-devices', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'share-files-securely',
    title: 'Partager des fichiers en toute sécurité | Tether',
    description: 'Envoyez et recevez des fichiers en toute sécurité entre PC, Mac et téléphone. Transfert direct et chiffré jusqu’à 500 Mo, sans upload ni inscription.',
    nav: 'Partager des fichiers',
    kicker: 'Partage de fichiers sécurisé',
    h1: 'Partagez des fichiers en toute sécurité',
    h1Accent: 'sans les téléverser.',
    intro: 'Presque toutes les façons de s’envoyer un fichier passent d’abord par le serveur de quelqu’un d’autre : e-mail, stockage cloud, messageries. Avec Tether, c’est l’inverse : le fichier va directement de votre navigateur à celui de l’autre appareil, via une connexion chiffrée, sans laisser de copie nulle part.',
    sections: [
      {
        h2: 'Envoyer, recevoir, ne rien laisser sur un serveur',
        paras: [
          'Déposez un fichier n’importe où sur la page Tether, cliquez sur « Envoyer un fichier » ou collez-le. Chaque fichier est envoyé en petits morceaux chiffrés via un canal de données WebRTC direct, puis réassemblé sur l’autre appareil, où il apparaît avec une barre de progression et un bouton Enregistrer.',
          'Comme rien n’est téléversé, il n’y a ni quota de stockage, ni lien que quelqu’un pourrait trouver plus tard, ni rien à supprimer ensuite. Les fichiers jusqu’à 500 Mo sont pris en charge.',
        ],
      },
      {
        h2: 'À tout le monde, ou à une seule personne',
        paras: [
          'Une session est une petite connexion de groupe de 4 appareils maximum. Envoyez un fichier à tout le monde d’un coup, ou déposez-le sur la carte d’une personne pour le lui envoyer à elle seule. L’expéditeur voit « livré » pour chaque destinataire et sait que le fichier est arrivé.',
        ],
      },
      {
        h2: 'Ce qui rend le transfert sûr',
        list: [
          'Chiffrement du transport avec DTLS, la norme des appels vidéo dans le navigateur, avec de nouvelles clés pour chaque connexion.',
          'Les fichiers ne passent jamais par le serveur de Tether et n’y sont jamais stockés. Sans liaison directe possible, le fichier n’est tout simplement pas envoyé.',
          'Les codes d’accès expirent après 10 minutes et les sessions sont limitées à 4 appareils, pour qu’aucun inconnu ne s’invite.',
          'Aucun compte ni donnée personnelle : seulement un nom d’affichage dans un cookie sur votre propre appareil.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Les fichiers sont-ils chiffrés pendant le transfert ?', a: 'Oui. Tous les transferts utilisent une connexion WebRTC chiffrée (DTLS) directement entre les deux navigateurs.' },
      { q: 'Quelle est la taille maximale d’un fichier ?', a: 'Jusqu’à 500 Mo par fichier. Au-delà, tout dépend de la mémoire disponible sur l’appareil qui reçoit.' },
      { q: 'L’autre personne a-t-elle besoin d’un compte ?', a: 'Non. Il lui suffit d’ouvrir le lien d’invitation, de scanner le QR code ou de saisir le code à 6 chiffres.' },
    ],
    related: ['phone-to-pc', 'group-connection', 'sync-clipboard'],
  },
  {
    slug: 'connect-windows-and-mac',
    title: 'Connecter Windows et Mac : copier, coller, envoyer | Tether',
    description: 'Connectez un PC Windows et un Mac en quelques secondes. Partagez le presse-papiers, envoyez du texte et transférez des fichiers entre Windows et macOS. Gratuit.',
    nav: 'Connecter Windows et Mac',
    kicker: 'Windows ↔ Mac',
    h1: 'Connectez Windows et Mac',
    h1Accent: 'comme s’ils étaient faits l’un pour l’autre.',
    intro: 'Windows et macOS ne partagent pas de presse-papiers, et AirDrop n’atteint pas les PC. Tether comble ce vide depuis le navigateur : reliez un PC Windows et un Mac avec un code à 6 chiffres, puis copiez, collez et envoyez des fichiers entre eux comme s’il s’agissait d’une seule machine.',
    sections: [
      {
        h2: 'Copier sur Windows, coller sur Mac',
        paras: [
          'Copiez du texte avec Ctrl+C sous Windows, passez à l’onglet Tether, et il est dans le presse-papiers du Mac, prêt pour ⌘V. Cela fonctionne aussi dans l’autre sens, et chaque extrait reste dans la liste partagée si vous en avez de nouveau besoin.',
        ],
      },
      {
        h2: 'Transférer des fichiers entre un PC et un Mac',
        paras: [
          'Glissez un fichier sur la page Tether de l’une ou l’autre machine et il apparaît sur l’autre avec un bouton Enregistrer. Pas de clé USB, pas d’upload dans le cloud, pas d’e-mail à vous-même. Les transferts sont directs et chiffrés, jusqu’à 500 Mo par fichier.',
          'Les deux ordinateurs n’ont pas besoin d’être sur le même réseau. Un portable professionnel et un Mac à la maison se relient tout aussi facilement par Internet.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Fonctionne avec les navigateurs que vous avez déjà',
        list: [
          'Windows : Chrome, Edge, Firefox, Brave ou Opera.',
          'Mac : Safari, Chrome, Firefox, Edge ou Arc.',
          'Installez Tether comme application depuis le menu du navigateur pour avoir une fenêtre dédiée sur les deux machines.',
        ],
      },
    ],
    faqs: [
      { q: 'Windows et Mac doivent-ils être sur le même Wi-Fi ?', a: 'Non. Tether relie les appareils par Internet, ils peuvent donc être sur des réseaux différents.' },
      { q: 'Existe-t-il une application Tether pour Windows ou Mac ?', a: 'Tether fonctionne dans le navigateur, et vous pouvez l’installer comme application depuis Chrome ou Edge sous Windows et depuis Chrome ou Safari sur Mac.' },
      { q: 'Puis-je envoyer des captures d’écran du Mac vers Windows ?', a: 'Oui. Collez une capture sur la page Tether ou déposez le fichier image, et il est envoyé au PC Windows.' },
    ],
    related: ['sync-clipboard', 'share-files-securely', 'group-connection'],
  },
  {
    slug: 'phone-to-pc',
    title: 'Envoyer des fichiers du téléphone au PC par QR code | Tether',
    description: 'Envoyez photos, fichiers et texte d’un Android ou iPhone vers votre PC ou Mac, et inversement. Un QR code suffit pour se connecter. Direct et chiffré.',
    nav: 'Téléphone vers PC',
    kicker: 'Téléphone ↔ ordinateur',
    h1: 'Envoyez des fichiers du téléphone au PC',
    h1Accent: 'avec un seul scan de QR code.',
    intro: 'Récupérer une photo de votre téléphone sur votre ordinateur ne devrait pas vous obliger à vous l’envoyer par e-mail. Lancez une session Tether sur le PC, scannez le QR code avec l’appareil photo du téléphone, et c’est connecté : envoyez fichiers, photos et texte dans les deux sens.',
    sections: [
      {
        h2: 'Scannez pour vous connecter, sans rien taper',
        paras: [
          'Quand vous lancez une session sur votre ordinateur, Tether affiche un QR code en attendant. Pointez l’appareil photo de votre téléphone dessus et vous rejoignez la session instantanément, sans code à saisir ni application à télécharger.',
        ],
      },
      {
        h2: 'Partagez directement depuis n’importe quelle appli',
        paras: [
          'Installez Tether depuis le navigateur de votre téléphone (« Ajouter à l’écran d’accueil ») et il apparaît dans le menu Partager. Partagez une photo, un PDF ou un lien depuis n’importe quelle application, choisissez Tether, et il vous attend dans votre session jusqu’à ce que vous touchiez Envoyer.',
          'Dans l’autre sens, déposez un fichier sur la page côté PC : il arrive sur le téléphone avec un bouton Enregistrer.',
        ],
      },
      {
        h2: 'Envoyez du texte et des liens vers votre téléphone',
        paras: [
          'Tapez ou collez dans le champ sur votre ordinateur et appuyez sur Entrée : le texte apparaît sur votre téléphone, prêt à être copié. Idéal pour les longues URL, les adresses, les identifiants Wi-Fi ou tout ce que vous devriez sinon retaper.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Cela fonctionne-t-il avec Android et iPhone ?', a: 'Oui. Tether fonctionne dans Chrome sur Android et dans Safari ou Chrome sur iPhone, et se connecte aux ordinateurs Windows, Mac ou Linux.' },
      { q: 'Le téléphone et le PC doivent-ils être sur le même Wi-Fi ?', a: 'Non, dans la plupart des cas ils peuvent être sur des réseaux différents, y compris en données mobiles. Quelques réseaux stricts bloquent les connexions directes ; sur le même Wi-Fi, c’est le plus fiable.' },
      { q: 'Les photos sont-elles compressées ?', a: 'Non. Les fichiers sont envoyés octet pour octet, tels qu’ils sont sur votre appareil.' },
    ],
    related: ['share-files-securely', 'send-text-between-devices', 'sync-clipboard'],
  },
  {
    slug: 'send-text-between-devices',
    title: 'Envoyer du texte entre appareils instantanément | Tether',
    description: 'Envoyez instantanément texte, liens et extraits de code entre vos ordinateurs et votre téléphone. Un presse-papiers en ligne privé, pair-à-pair et chiffré.',
    nav: 'Envoyer du texte',
    kicker: 'Envoyer du texte',
    h1: 'Envoyez du texte entre appareils',
    h1Accent: 'en moins d’une seconde.',
    intro: 'Longues URL, codes à usage unique, une commande dont vous avez besoin sur l’autre machine, une adresse pour votre téléphone : Tether est le moyen le plus rapide de faire passer un bout de texte d’un appareil à l’autre, sans vous envoyer de message.',
    sections: [
      {
        h2: 'Tapez, collez, ou copiez simplement',
        paras: [
          'Tapez dans le champ et appuyez sur Entrée, collez n’importe où sur la page avec Ctrl+V, ou copiez quelque chose dans une autre application et revenez sur Tether. Dans tous les cas, le texte arrive sur les autres appareils et dans la liste partagée, où un clic suffit à le copier.',
          'Utilisez Maj+Entrée pour du texte sur plusieurs lignes, comme des blocs de code : la mise en forme est conservée exactement telle que vous l’avez tapée.',
        ],
      },
      {
        h2: 'Mieux que de s’envoyer un message',
        list: [
          'Aucun historique de discussion dans le cloud de quelqu’un d’autre : le texte passe directement entre vos appareils.',
          'Fonctionne entre tous les systèmes et navigateurs, y compris sur les postes de travail où vous ne pouvez pas vous connecter à vos applis personnelles.',
          'Les envois en double sont ignorés automatiquement, pour garder une liste propre.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Le texte est-il stocké quelque part ?', a: 'Non. Le texte est envoyé directement entre navigateurs et conservé uniquement dans votre onglet ouvert. Il n’est jamais enregistré sur un serveur.' },
      { q: 'Y a-t-il une limite de longueur ?', a: 'Chaque extrait de texte peut faire jusqu’à 64 Ko, soit environ 60 000 caractères. Au-delà, envoyez-le sous forme de fichier.' },
      { q: 'Puis-je envoyer à une seule personne ?', a: 'Le texte est envoyé à tout le monde dans la session. Pour un envoi privé, lancez une session avec ce seul appareil.' },
    ],
    related: ['sync-clipboard', 'phone-to-pc', 'group-connection'],
  },
  {
    slug: 'group-connection',
    title: 'Connecter vos PC en ligne – connexion de groupe | Tether',
    description: 'Connectez jusqu’à 4 PC, Mac et téléphones dans une session de groupe sécurisée par Internet. Partagez presse-papiers, texte et fichiers avec tous. Gratuit.',
    nav: 'Connexion de groupe',
    kicker: 'Connecter vos PC',
    h1: 'Connectez vos PC',
    h1Accent: 'en un petit groupe privé.',
    intro: 'Tether transforme jusqu’à quatre appareils en une connexion de groupe privée par Internet : votre ordinateur de bureau, votre portable et votre téléphone, ou les machines de quelques collègues. Chacun voit qui est en ligne et sur quoi on travaille, et tout ce qui est partagé atteint tout le groupe.',
    sections: [
      {
        h2: 'Une connexion directe entre tous les appareils',
        paras: [
          'Chaque appareil d’une session se relie directement à chacun des autres, si bien que texte et fichiers ne font jamais de détour par un serveur. La carte en direct en haut de la salle montre chaque liaison : pleine quand elle est directe, et elle se rétablit d’elle-même si la connexion de quelqu’un tombe.',
          'Pas besoin du même réseau ni de redirection de port : tous les PC connectés à Internet peuvent se relier, que ce soit en Wi-Fi à la maison, en Ethernet au bureau ou via un partage de connexion.',
        ],
      },
      {
        h2: 'Pensé pour les petites équipes et les configurations multi-appareils',
        list: [
          'Programmation en binôme : échangez commandes, logs et extraits de code entre deux machines.',
          'Présentations : passez fichiers et liens de votre portable au PC de la salle de réunion.',
          'Revues de design : envoyez vos exports à tout le groupe d’un coup.',
          'Votre propre bureau : reliez portable pro, ordinateur fixe à la maison et téléphone.',
        ],
      },
      {
        h2: 'Invitez en quelques secondes, partez tout aussi vite',
        paras: [
          'Partagez le code à 6 chiffres, envoyez le lien d’invitation ou laissez quelqu’un scanner le QR code. Les codes expirent après 10 minutes et vous pouvez en créer un nouveau à tout moment. Quand vous avez terminé, touchez deux fois Quitter et votre place est libérée.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Combien d’appareils peuvent rejoindre une session ?', a: 'Jusqu’à 4 appareils par session.' },
      { q: 'Puis-je voir qui est connecté ?', a: 'Oui. Chaque participant apparaît avec son nom, s’il est actif ou absent, et éventuellement l’application dans laquelle il travaille.' },
      { q: 'Que se passe-t-il quand quelqu’un se déconnecte ?', a: 'Sa place est conservée 15 minutes pour qu’il puisse revenir, et les liaisons se rétablissent automatiquement à son retour.' },
    ],
    related: ['share-files-securely', 'connect-windows-and-mac', 'send-text-between-devices'],
  },
];
