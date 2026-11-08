export interface Faq { q: string; a: string }

/** Home-page FAQ. Rendered as visible <details> and as FAQPage JSON-LD from the same source. */
export const homeFaqs: Faq[] = [
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

export function faqJsonLd(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}
