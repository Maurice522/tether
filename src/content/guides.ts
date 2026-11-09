import type { Lang } from '../i18n';
import type { Faq } from './faq';
import { guidesDe } from './guides.de';
import { guidesFr } from './guides.fr';

export interface GuideSection {
  h2: string;
  paras?: string[];
  list?: string[];
  steps?: { title: string; text: string }[];
}

export interface Guide {
  slug: string;
  /** <title>, ~60 chars, keyword first. */
  title: string;
  /** Meta description, ~150 chars. */
  description: string;
  /** Short label for nav/footer links. */
  nav: string;
  kicker: string;
  h1: string;
  h1Accent: string;
  intro: string;
  sections: GuideSection[];
  faqs: Faq[];
  related: string[];
}

const HOW_TO_START: GuideSection = {
  h2: 'How to tether your devices',
  steps: [
    { title: 'Start a session', text: 'Open tethersecure.com on the first device and press Start a session. Pick a display name the first time; it is remembered.' },
    { title: 'Join from the other device', text: 'Type the 6-digit code, open the invite link, or scan the QR code with a phone camera. Up to 4 devices can join.' },
    { title: 'Copy, paste and send', text: 'Copy text, press Ctrl+V on the page, type a message, or drop a file. It reaches the other devices directly, encrypted.' },
  ],
};

const en: Guide[] = [
  {
    slug: 'sync-clipboard',
    title: 'Sync Clipboard Between Computers — Free, No Install | Tether',
    description: 'Sync your clipboard between PCs, Mac and phone in seconds. Copy on one device, paste on another. Peer-to-peer, encrypted, no app or account needed.',
    nav: 'Sync clipboard',
    kicker: 'Clipboard sync',
    h1: 'Sync your clipboard',
    h1Accent: 'between any two computers.',
    intro: 'Copy a link, a password-free snippet of code or a paragraph on one computer and paste it on another a second later. Tether gives every device in your session one shared clipboard, straight from browser to browser, with nothing to install.',
    sections: [
      {
        h2: 'A shared clipboard that works on every device',
        paras: [
          'Most clipboard sync tools only work inside one ecosystem: Apple devices with Apple, Windows with a Microsoft account. Tether runs in the browser, so it syncs the clipboard between Windows, macOS, Linux, ChromeOS, Android and iPhone in any combination.',
          'Every clip you send also stays in a shared list for the session, so you can copy it again later with one click, even after you have copied something else.',
        ],
      },
      {
        h2: 'How clipboard sync works in Tether',
        paras: [
          'Browsers only let a website read your clipboard while its tab is in front. In Chrome and Edge, allow clipboard access once and Tether sends whatever you copied as soon as you switch back to its tab. In Firefox and Safari, press Ctrl+V (or ⌘V) anywhere on the page to send.',
          'Incoming clips are written to your clipboard the moment you open the Tether tab, so you can paste straight into any app. You can pause syncing at any time with the switch in the Clips panel.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Private by design',
        list: [
          'Clips travel over a direct, encrypted WebRTC connection between your devices.',
          'Nothing is stored on a server; your clip history lives only in your browser tab.',
          'No account and no email. Sessions disappear after 12 hours of inactivity.',
        ],
      },
    ],
    faqs: [
      { q: 'Can I sync the clipboard between Windows and Mac?', a: 'Yes. Open Tether on both and join the same session. Copy on the Windows PC and paste on the Mac, or the other way round.' },
      { q: 'Does clipboard sync work automatically in the background?', a: 'Websites cannot read the clipboard in the background. Tether syncs the moment you switch to its tab (Chrome and Edge) or when you press Ctrl+V on the page.' },
      { q: 'Can I sync images from the clipboard?', a: 'Paste an image or screenshot on the Tether page with Ctrl+V and it is sent as a file that the other devices can save.' },
    ],
    related: ['send-text-between-devices', 'connect-windows-and-mac', 'share-files-securely'],
  },
  {
    slug: 'share-files-securely',
    title: 'Securely Share Files Between Devices — No Upload | Tether',
    description: 'Send and receive files securely between your PCs, Mac and phone. Direct, encrypted, peer-to-peer transfer up to 500 MB. Nothing uploaded, no sign-up.',
    nav: 'Share files securely',
    kicker: 'Secure file sharing',
    h1: 'Securely share files',
    h1Accent: 'without uploading them.',
    intro: 'Most ways of sending a file to yourself mean uploading it to someone else’s server first: email, cloud drives, chat apps. Tether files go the other way: straight from your browser to the other device’s browser over an encrypted connection, so there is no copy left anywhere.',
    sections: [
      {
        h2: 'Send a file, receive a file, keep nothing on a server',
        paras: [
          'Drop a file anywhere on the Tether page, press Send file, or paste it. Each file is sent in small encrypted chunks over a direct WebRTC data channel and reassembled on the other device, where it appears with a progress bar and a Save button.',
          'Because nothing is uploaded, there is no storage quota, no link that someone could find later and nothing to delete afterwards. Files up to 500 MB each are supported.',
        ],
      },
      {
        h2: 'Send to everyone, or to just one person',
        paras: [
          'A session is a small group connection of up to 4 devices. Send a file to everyone at once, or drop it on one person’s card to send it only to them. The sender sees “delivered” for each recipient, so you know it arrived.',
        ],
      },
      {
        h2: 'What makes the transfer secure',
        list: [
          'End-to-end transport encryption with DTLS, the standard behind browser video calls, with fresh keys for every connection.',
          'Files never pass through or rest on Tether’s server. If no direct link is possible, the file is not sent at all.',
          'Join codes expire after 10 minutes and sessions are limited to 4 devices, so strangers can’t wander in.',
          'No accounts or personal data: just a display name stored in a cookie on your own device.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Are files encrypted during transfer?', a: 'Yes. All transfers use an encrypted WebRTC connection (DTLS) directly between the two browsers.' },
      { q: 'What is the maximum file size?', a: 'Up to 500 MB per file. Larger files depend on the receiving device having enough memory.' },
      { q: 'Does the other person need an account?', a: 'No. They only need to open the invite link, scan the QR code or type the 6-digit code.' },
    ],
    related: ['phone-to-pc', 'group-connection', 'sync-clipboard'],
  },
  {
    slug: 'connect-windows-and-mac',
    title: 'Connect Windows and Mac: Copy, Paste & Send Files | Tether',
    description: 'Connect a Windows PC and a Mac in seconds. Share clipboard, send text and transfer files between Windows and macOS in the browser. Free, no install.',
    nav: 'Connect Windows & Mac',
    kicker: 'Windows ↔ Mac',
    h1: 'Connect Windows and Mac',
    h1Accent: 'like they were made for each other.',
    intro: 'Windows and macOS don’t share a clipboard, and AirDrop doesn’t reach a PC. Tether bridges the gap from the browser: link a Windows PC and a Mac with a 6-digit code, then copy, paste and send files between them as if they were one machine.',
    sections: [
      {
        h2: 'Copy on Windows, paste on Mac',
        paras: [
          'Copy text with Ctrl+C on Windows, switch to the Tether tab, and it is on the Mac’s clipboard, ready for ⌘V. It works the other way round too, and every clip stays in the shared list in case you need it again.',
        ],
      },
      {
        h2: 'Transfer files between a PC and a Mac',
        paras: [
          'Drag a file onto the Tether page on either machine and it appears on the other with a Save button. No USB stick, no cloud upload, no emailing yourself. Transfers are direct and encrypted, up to 500 MB per file.',
          'The two computers don’t need to be on the same network. A work laptop and a home Mac can tether over the internet just as easily.',
        ],
      },
      HOW_TO_START,
      {
        h2: 'Works with the browsers you already have',
        list: [
          'Windows: Chrome, Edge, Firefox, Brave or Opera.',
          'Mac: Safari, Chrome, Firefox, Edge or Arc.',
          'Install it as an app from the browser menu for a dedicated window on both machines.',
        ],
      },
    ],
    faqs: [
      { q: 'Do Windows and Mac need to be on the same Wi-Fi?', a: 'No. Tether connects devices over the internet, so they can be on different networks.' },
      { q: 'Is there a Tether app for Windows or Mac?', a: 'Tether runs in the browser, and you can install it as an app from Chrome or Edge on Windows and Chrome or Safari on Mac.' },
      { q: 'Can I send screenshots from Mac to Windows?', a: 'Yes. Paste a screenshot on the Tether page or drop the image file and it is sent to the Windows PC.' },
    ],
    related: ['sync-clipboard', 'share-files-securely', 'group-connection'],
  },
  {
    slug: 'phone-to-pc',
    title: 'Send Files From Phone to PC (and Back) by QR | Tether',
    description: 'Send photos, files and text from your Android or iPhone to your PC or Mac, and back. Scan a QR code to connect. Direct, encrypted, no app needed.',
    nav: 'Phone to PC',
    kicker: 'Phone ↔ computer',
    h1: 'Send files from phone to PC',
    h1Accent: 'with one QR scan.',
    intro: 'Getting a photo off your phone and onto your computer should not involve emailing yourself. Start a Tether session on the PC, scan the QR code with your phone’s camera, and you are connected: send files, photos and text in either direction.',
    sections: [
      {
        h2: 'Scan to connect, no typing',
        paras: [
          'When you start a session on your computer, Tether shows a QR code while it waits. Point your phone’s camera at it and you join instantly; there is no code to type and no app to download.',
        ],
      },
      {
        h2: 'Share straight from any app',
        paras: [
          'Install Tether from your phone’s browser (Add to Home Screen) and it appears in the phone’s Share menu. Share a photo, a PDF or a link from any app, pick Tether, and it waits in your session until you tap Send.',
          'Going the other way, drop a file on the page on your PC and it arrives on the phone with a Save button.',
        ],
      },
      {
        h2: 'Send text and links to your phone',
        paras: [
          'Type or paste into the box on your computer and press Enter: the text appears on your phone, ready to copy. It is perfect for long URLs, addresses, Wi-Fi details or anything you’d otherwise retype.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Does it work with both Android and iPhone?', a: 'Yes. Tether works in Chrome on Android and in Safari or Chrome on iPhone, and connects to Windows, Mac or Linux computers.' },
      { q: 'Do my phone and PC need to be on the same Wi-Fi?', a: 'No, in most cases they can be on different networks, including mobile data. A few strict networks block direct connections; on the same Wi-Fi it is the most reliable.' },
      { q: 'Are photos compressed?', a: 'No. Files are sent byte-for-byte as they are on your device.' },
    ],
    related: ['share-files-securely', 'send-text-between-devices', 'sync-clipboard'],
  },
  {
    slug: 'send-text-between-devices',
    title: 'Send Text Between Devices — Online Clipboard | Tether',
    description: 'Send text, links and code snippets between your computers and phone instantly. A private online clipboard, peer-to-peer and encrypted. Free, no sign-up.',
    nav: 'Send text',
    kicker: 'Send text',
    h1: 'Send text between devices',
    h1Accent: 'in under a second.',
    intro: 'Long URLs, one-time codes, a command you need on the other machine, an address for your phone: Tether is the fastest way to move a piece of text from one device to another, without messaging yourself.',
    sections: [
      {
        h2: 'Type it, paste it, or just copy it',
        paras: [
          'Type into the box and press Enter, paste anywhere on the page with Ctrl+V, or copy something in another app and switch back to Tether. Every way lands the text on the other devices and in the shared list, where one click copies it.',
          'Use Shift+Enter for multi-line text such as code blocks, and the formatting is kept exactly as you typed it.',
        ],
      },
      {
        h2: 'Better than messaging yourself',
        list: [
          'No chat history in someone else’s cloud: text goes directly between your devices.',
          'Works between any operating systems and browsers, including work machines where you can’t sign in to personal apps.',
          'Duplicate sends are skipped automatically, so the list stays clean.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'Is the text stored anywhere?', a: 'No. Text is sent directly between browsers and kept only in your open tab. It is never saved on a server.' },
      { q: 'Is there a length limit?', a: 'Each text clip can be up to 64 KB, which is roughly 60,000 characters. For anything longer, send it as a file.' },
      { q: 'Can I send to only one person?', a: 'Text goes to everyone in the session. To send privately, start a session with just that one device.' },
    ],
    related: ['sync-clipboard', 'phone-to-pc', 'group-connection'],
  },
  {
    slug: 'group-connection',
    title: 'Connect Your PCs Online — Group Connection | Tether',
    description: 'Connect up to 4 PCs, Macs and phones in one secure group session over the internet. Share clipboard, text and files with everyone. Free, no install.',
    nav: 'Group connection',
    kicker: 'Connect your PCs',
    h1: 'Connect your PCs',
    h1Accent: 'into one small, private group.',
    intro: 'Tether turns up to four devices into a private group connection over the internet: your desktop, laptop and phone, or a couple of teammates’ machines. Everyone sees who is online and what they are working on, and anything shared reaches the whole group.',
    sections: [
      {
        h2: 'A tether connection between every device',
        paras: [
          'Each device in a session links directly to every other one, so text and files never take a detour through a server. The live map at the top of the room shows each link: solid when direct, and it relinks on its own if someone’s connection drops.',
          'No same-network requirement and no port forwarding: any PCs that are online can connect, whether they are on home Wi-Fi, office Ethernet or a phone hotspot.',
        ],
      },
      {
        h2: 'Made for small teams and multi-device setups',
        list: [
          'Pair programming: pass commands, logs and snippets between two machines.',
          'Presentations: move files and links from your laptop to the meeting-room PC.',
          'Design reviews: drop exports to the whole group at once.',
          'Your own desk: link your work laptop, home desktop and phone.',
        ],
      },
      {
        h2: 'Invite in seconds, leave just as fast',
        paras: [
          'Share the 6-digit code, send the invite link, or let someone scan the QR code. Codes expire after 10 minutes and you can make a new one at any time. When you are done, tap Leave twice and your seat is gone.',
        ],
      },
      HOW_TO_START,
    ],
    faqs: [
      { q: 'How many devices can join one session?', a: 'Up to 4 devices per session.' },
      { q: 'Can I see who is connected?', a: 'Yes. Everyone in the session appears with their name, whether they are active or away, and optionally what app they are working in.' },
      { q: 'What happens when someone disconnects?', a: 'Their seat is kept for 15 minutes so they can come back, and links re-form automatically when they return.' },
    ],
    related: ['share-files-securely', 'connect-windows-and-mac', 'send-text-between-devices'],
  },
];

/** Landing pages per language. Slugs are shared across languages so /de/<slug>/ pairs with /<slug>/ for hreflang. */
export const guides: Record<Lang, Guide[]> = { en, de: guidesDe, fr: guidesFr };

export const guideBySlug = (lang: Lang, slug: string) => guides[lang].find((g) => g.slug === slug);
