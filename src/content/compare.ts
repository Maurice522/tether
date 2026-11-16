import type { Lang } from '../i18n';
import type { Guide, GuideSection } from './guides';
import { compareDe } from './compare.de';
import { compareFr } from './compare.fr';

/**
 * Comparison landing pages ("Snapdrop alternative", "AirDrop for Windows"…). Same shape as the guides.
 * Claims about other tools are kept to stable, well-documented facts; no prices or plan limits that change.
 */
const SWITCH: GuideSection = {
  h2: 'Try Tether in under a minute',
  steps: [
    { title: 'Open Tether', text: 'Go to tethersecure.com on the first device and press Start a session. Pick a display name the first time.' },
    { title: 'Join from the other device', text: 'Type the 6-digit code, open the invite link or scan the QR code. Up to 4 devices can join, on any network.' },
    { title: 'Copy, paste and send', text: 'Copy text, press Ctrl+V on the page or drop a file. It goes straight to the other devices, encrypted.' },
  ],
};

const en: Guide[] = [
  {
    slug: 'snapdrop-alternative',
    title: 'Snapdrop Alternative: Free, No Account, Any Network | Tether',
    description: 'Looking for a Snapdrop alternative? Tether sends files and syncs your clipboard browser to browser, across any network. Free, no account, nothing uploaded.',
    nav: 'Snapdrop alternative',
    kicker: 'Snapdrop alternative',
    h1: 'A Snapdrop alternative',
    h1Accent: 'that works on any network.',
    intro: 'Snapdrop made it easy to drop a file from one device to another in the browser. The original open-source project is now run by LimeWire. If you want the same no-install simplicity without an account, and for devices that are not on the same Wi-Fi, Tether does that in your browser.',
    sections: [
      {
        h2: 'Tether vs Snapdrop at a glance',
        table: {
          head: ['', 'Tether', 'Snapdrop'],
          rows: [
            ['Install needed', 'No, runs in the browser', 'No, runs in the browser'],
            ['Devices on different networks', 'Yes, join with a code, link or QR', 'Designed for devices on the same network'],
            ['Shared clipboard', 'Yes, copy on one device, paste on the other', 'Send text messages one at a time'],
            ['Account', 'Never', 'Not for basic sharing'],
            ['Where files go', 'Directly between browsers, never uploaded', 'Directly between browsers on the same network'],
            ['Group size', 'Up to 4 devices per session', 'Everyone visible on the network'],
          ],
        },
      },
      {
        h2: 'Why people switch from Snapdrop',
        paras: [
          'Snapdrop finds devices automatically when they share a network, which is great at home but fails between a laptop on office Wi-Fi and a phone on mobile data. Tether pairs devices with a short code instead, so it works between any two devices online.',
          'Tether is also built for the clipboard, not just files: copy a link or a snippet on one computer and it is ready to paste on the other, and every clip stays in a shared list you can copy again.',
        ],
      },
      SWITCH,
      {
        h2: 'When Snapdrop-style tools are still the better pick',
        paras: [
          'If every device is always on the same home network and you never want to type a code, automatic discovery is hard to beat. Tether needs one code or invite per session, and the tab must be open on each device.',
        ],
      },
    ],
    faqs: [
      { q: 'Is Tether free like Snapdrop was?', a: 'Yes. Tether is free, needs no account and has no paid plan.' },
      { q: 'Do both devices need to be on the same Wi-Fi?', a: 'No. Tether connects devices over the internet with a 6-digit code, an invite link or a QR code, so they can be on different networks.' },
      { q: 'Are my files uploaded anywhere?', a: 'No. Files go over a direct, encrypted WebRTC connection between your browsers. If a network blocks direct connections, Tether tells you instead of uploading the file.' },
    ],
    related: ['pairdrop-alternative', 'share-files-securely', 'airdrop-for-windows'],
  },
  {
    slug: 'pairdrop-alternative',
    title: 'PairDrop vs Tether: Browser File Sharing Compared',
    description: 'PairDrop vs Tether: both share files in the browser without an account. See how they differ on clipboard sync, pairing and networks, and which one fits you.',
    nav: 'PairDrop vs Tether',
    kicker: 'PairDrop alternative',
    h1: 'PairDrop vs Tether:',
    h1Accent: 'which one fits you?',
    intro: 'PairDrop and Tether both move things between devices from the browser, with no app and no account. PairDrop is an open-source fork of Snapdrop focused on dropping files to nearby devices. Tether is built around a shared clipboard for 2 to 4 devices, with files on top.',
    sections: [
      {
        h2: 'PairDrop and Tether side by side',
        table: {
          head: ['', 'Tether', 'PairDrop'],
          rows: [
            ['Install needed', 'No', 'No (apps available)'],
            ['Finds devices automatically', 'No, you join with a code, link or QR', 'Yes, on the same network'],
            ['Devices on different networks', 'Yes', 'Yes, after pairing or with a public room'],
            ['Shared clipboard with history', 'Yes', 'Send text messages one at a time'],
            ['Account', 'Never', 'Never'],
            ['Open source', 'Yes', 'Yes'],
          ],
        },
      },
      {
        h2: 'Choose PairDrop if…',
        list: [
          'You mostly share files with whoever is on the same network and want them to appear automatically.',
          'You want to self-host the service on your own server.',
        ],
      },
      {
        h2: 'Choose Tether if…',
        list: [
          'You move text, links and code between your own computers all day and want a clipboard that follows you.',
          'Your devices are often on different networks, like a work laptop and a phone on mobile data.',
          'You want a small private group (up to 4 devices) with names, presence and a shared history of clips and files.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Can I use PairDrop and Tether together?', a: 'Yes. They are both free web apps, so you can keep PairDrop for quick drops on your home network and use Tether for clipboard sync across networks.' },
      { q: 'Which is more private?', a: 'Both send files directly between browsers over encrypted WebRTC. Tether stores no files and no clips on its server; the privacy page lists exactly what it keeps.' },
      { q: 'How many devices can join a Tether session?', a: 'Up to 4 devices per session, which keeps sessions private and fast.' },
    ],
    related: ['snapdrop-alternative', 'sync-clipboard', 'localsend-alternative'],
  },
  {
    slug: 'airdrop-for-windows',
    title: 'AirDrop for Windows: Share Between iPhone and PC | Tether',
    description: 'There is no AirDrop for Windows, but Tether does the same job in the browser: send files and text between iPhone, Mac, Windows PC and Android. Free, no app.',
    nav: 'AirDrop for Windows',
    kicker: 'AirDrop for Windows',
    h1: 'AirDrop for Windows,',
    h1Accent: 'right in your browser.',
    intro: 'AirDrop only works between Apple devices. If you have an iPhone and a Windows PC, or a Mac and an Android phone, there is no built-in way to drop a file or a link across. Tether fills that gap from the browser on every device, with nothing to install.',
    sections: [
      {
        h2: 'What works where',
        table: {
          head: ['', 'Tether', 'AirDrop'],
          rows: [
            ['iPhone ↔ Windows PC', 'Yes', 'No'],
            ['Mac ↔ Android', 'Yes', 'No'],
            ['Mac ↔ iPhone', 'Yes', 'Yes'],
            ['Devices far apart', 'Yes, over the internet', 'No, devices must be nearby'],
            ['Shared clipboard', 'Yes, any devices', 'Universal Clipboard, Apple devices only'],
            ['Install needed', 'No, any browser', 'Built into Apple devices'],
          ],
        },
      },
      {
        h2: 'Send from iPhone to PC in seconds',
        paras: [
          'Open tethersecure.com on the PC and press Start a session. Point the iPhone camera at the QR code that appears and the phone joins. Now share a photo, a document or a link from the phone and it lands on the PC, or copy text on the PC and paste it on the iPhone.',
          'Windows has Nearby Sharing and Quick Share, but they work with other Windows PCs and Android phones, not with an iPhone. Tether works in Safari on the iPhone just like in Chrome or Edge on the PC.',
        ],
      },
      SWITCH,
      {
        h2: 'Good to know',
        list: [
          'Keep the Tether tab open on both devices while you share; browsers cannot receive in the background.',
          'Files up to 500 MB each go directly between devices and are never uploaded.',
          'Turn on Remember these devices to reconnect your iPhone and PC with one tap next time.',
        ],
      },
    ],
    faqs: [
      { q: 'Is there an official AirDrop app for Windows?', a: 'No. AirDrop only runs on Apple devices. Tether gives you the same drop-and-done flow in any browser.' },
      { q: 'Can I send photos from iPhone to Windows without iCloud?', a: 'Yes. Join the same Tether session on both and send the photos from the iPhone. They go directly to the PC, not through iCloud or any other cloud.' },
      { q: 'Does it work the other way, from PC to iPhone?', a: 'Yes. Drop a file on the Tether page on the PC and the iPhone gets a Save button for it.' },
    ],
    related: ['phone-to-pc', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'pushbullet-alternative',
    title: 'Pushbullet Alternative: No Account, No App | Tether',
    description: 'A free Pushbullet alternative with no account and no app. Sync your clipboard, send links and share files between PC and phone, directly and encrypted.',
    nav: 'Pushbullet alternative',
    kicker: 'Pushbullet alternative',
    h1: 'A Pushbullet alternative',
    h1Accent: 'with no account and no app.',
    intro: 'Pushbullet connects your phone and computer through your account and its servers. If you just want to push a link, a snippet or a file from one device to another without signing in or installing anything, Tether does it from the browser.',
    sections: [
      {
        h2: 'Tether vs Pushbullet',
        table: {
          head: ['', 'Tether', 'Pushbullet'],
          rows: [
            ['Account', 'Never', 'Required'],
            ['Install', 'No, any browser', 'App and browser extension'],
            ['Where your files go', 'Directly between your devices', 'Through Pushbullet’s servers'],
            ['Cost', 'Free, no paid plan', 'Free plan with limits, paid Pro plan'],
            ['Works in the background', 'No, keep the tab open', 'Yes, as an installed app'],
            ['Phone notifications on PC', 'No', 'Yes'],
          ],
        },
      },
      {
        h2: 'Where Tether is the better fit',
        paras: [
          'Tether is for the moment you need to move something now: a link from your phone to your laptop, a code snippet from a work PC to your Mac, a file to a colleague sitting next to you. You open the page, join with a code, and it goes straight across, with nothing stored anywhere.',
          'Because there is no account, there is nothing to sign up for, no history kept on a server and nothing to delete when you are done.',
        ],
      },
      {
        h2: 'Where Pushbullet is the better fit',
        paras: [
          'If you want your phone’s notifications mirrored on your computer, or pushes delivered while the app is closed, an installed app like Pushbullet can do things a web page cannot.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Do I need to install anything?', a: 'No. Tether runs in any modern browser on Windows, Mac, Linux, Android and iPhone. You can add it to your home screen if you like.' },
      { q: 'Can I send links from my phone to my PC?', a: 'Yes. Paste or share the link into Tether on your phone and it appears on your PC, ready to open or copy.' },
      { q: 'Is there a limit on how much I can send?', a: 'Files can be up to 500 MB each and text clips up to 64 KB. There is no monthly cap.' },
    ],
    related: ['send-text-between-devices', 'phone-to-pc', 'sync-clipboard'],
  },
  {
    slug: 'localsend-alternative',
    title: 'LocalSend Alternative Without Installing Anything | Tether',
    description: 'Like LocalSend, but nothing to install and it works across networks. Send files and text between PC, Mac and phone from the browser. Free and encrypted.',
    nav: 'LocalSend alternative',
    kicker: 'LocalSend alternative',
    h1: 'Like LocalSend,',
    h1Accent: 'without installing anything.',
    intro: 'LocalSend is a great open-source app for sending files between devices on the same local network. Tether takes a different route: it runs in the browser, so there is nothing to install, and it works even when your devices are on different networks.',
    sections: [
      {
        h2: 'Tether vs LocalSend',
        table: {
          head: ['', 'Tether', 'LocalSend'],
          rows: [
            ['Install', 'No, any browser', 'App on every device'],
            ['Devices on different networks', 'Yes', 'No, same local network'],
            ['Works without internet', 'No', 'Yes, on the local network'],
            ['Shared clipboard', 'Yes, with history', 'Send text one message at a time'],
            ['Open source', 'Yes', 'Yes'],
            ['Account', 'Never', 'Never'],
          ],
        },
      },
      {
        h2: 'When Tether makes more sense',
        list: [
          'You are on a computer where you cannot install apps, like a work or school PC.',
          'Your devices are on different networks, or the Wi-Fi isolates devices from each other.',
          'You want to share with someone once without asking them to install anything.',
        ],
      },
      {
        h2: 'When LocalSend makes more sense',
        list: [
          'You have no internet connection but the devices share a local network.',
          'You send very large files regularly; Tether is limited to 500 MB per file.',
        ],
      },
      SWITCH,
    ],
    faqs: [
      { q: 'Is Tether as private as LocalSend?', a: 'Both send files directly between devices, encrypted, without storing them on a server. Tether also needs its server to introduce the devices to each other, but never sees your files.' },
      { q: 'Can I use Tether on a work PC?', a: 'Usually yes, because it runs in the browser. Some company networks block direct connections; text still works there, and files need a direct link.' },
      { q: 'Does Tether need both devices online?', a: 'Yes. Both browsers need an internet connection and the Tether tab open while you share.' },
    ],
    related: ['share-files-securely', 'pairdrop-alternative', 'connect-windows-and-mac'],
  },
];

export const compare: Record<Lang, Guide[]> = { en, de: compareDe, fr: compareFr };
