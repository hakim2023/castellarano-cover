import { biz } from './config.js';
import { icon } from './icons.js';

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');
const addr = `${biz.street}, ${biz.zip} ${biz.city} ${biz.region}`;
const q = encodeURIComponent(`${biz.name} ${addr}`);
export const mapEmbed = `https://www.google.com/maps?q=${q}&output=embed`;
export const mapLink = `https://www.google.com/maps/search/?api=1&query=${q}`;
// Set by server.js at startup from a hash of the CSS/JS so browsers fetch new versions after updates.
export const asset = { v: '' };
const wa = (txt) => `https://wa.me/${biz.phone.slice(1)}?text=${encodeURIComponent(txt)}`;

// Real photos of the shop. [file, width, height, alt IT, alt EN]
export const PHOTOS = {
  gallery: [
    ['wall-samsung.jpg', 600, 800, 'Cover a libro per Samsung Galaxy in tanti colori', 'Samsung Galaxy wallet cases in many colours'],
    ['powerbanks.jpg', 600, 800, 'Vetrina con power bank, cuffie wireless e caricatori auto', 'Display of power banks, wireless headphones and car chargers'],
    ['cables.jpg', 600, 800, 'Cavi di ricarica USB, Type-C e supporti auto', 'USB and Type-C charging cables and car holders'],
    ['car-holders.jpg', 600, 800, 'Supporti auto per telefono, selfie stick e cuffie', 'Car phone holders, selfie sticks and headphones'],
  ],
};
const AREA = ['Castellarano', 'Sassuolo', 'Casalgrande', 'Roteglia', 'Scandiano'];

const T = {
  it: {
    code: 'it', home: '/', alt: '/en', privacy: '/privacy', htmlLang: 'it', locale: 'it-IT',
    title: 'Cover e accessori telefono a Castellarano | Cover Center',
    desc: 'Cover a libro per iPhone e Samsung, pellicole, caricabatterie, cavi e power bank a Castellarano (RE), vicino a Sassuolo. Via Radici Nord 31.',
    nav: { products: 'Prodotti', gallery: 'Negozio', reviews: 'Recensioni', visit: 'Dove siamo', faq: 'Domande' },
    langSwitch: 'EN', langName: 'English', skip: 'Vai al contenuto',
    eyebrow: 'Negozio a Castellarano (RE)',
    h1a: 'Cover, pellicole e accessori', h1b: 'per il tuo telefono',
    lead: 'Centinaia di cover a libro per iPhone e Samsung, pellicole, caricabatterie, cavi, power bank e accessori auto. Passa in negozio: troviamo insieme quello giusto per il tuo modello.',
    facts: [['store', 'Solo in negozio'], ['smartphone', 'iPhone, Samsung e altri'], ['map-pin', 'Via Radici Nord 31']],
    chip1: 'Cover per iPhone e Samsung', chip2: 'Vieni a trovarci',
    instore: 'Prodotti disponibili solo in negozio. Non vendiamo online.',
    call: 'Chiama', whatsapp: 'WhatsApp', directions: 'Indicazioni',
    waText: 'Ciao! Avete questo per il mio telefono? Modello: ',
    productsK: 'Prodotti', productsH: 'Cosa trovi in negozio', productsSub: 'La disponibilità cambia spesso: scrivici il modello del tuo telefono e ti diciamo cosa abbiamo.',
    cats: [
      ['Cover e custodie a libro', 'Per iPhone, Samsung e tanti altri modelli, in molti colori e fantasie.'],
      ['Pellicole protettive', 'Per proteggere lo schermo del tuo telefono.'],
      ['Caricabatterie e cavi', 'Cavi USB, Type-C e Lightning, caricatori da muro e da auto.'],
      ['Power bank', 'Per non restare mai senza batteria.'],
      ['Cuffie e auricolari', 'Cuffie wireless, auricolari e accessori audio.'],
      ['Accessori per auto e selfie stick', 'Supporti per telefono, caricatori auto, selfie stick e altro.'],
    ],
    stepsK: 'Come funziona', stepsH: 'Trova la cover giusta in 3 passi',
    steps: [['Scrivici il modello', 'Mandaci su WhatsApp il modello del tuo telefono, ad esempio “iPhone 15” o “Samsung A54”.'], ['Ti diciamo cosa abbiamo', 'Ti rispondiamo con quello che abbiamo disponibile per il tuo telefono.'], ['Passa in negozio', 'Vieni in Via Radici Nord 31 a Castellarano, scegli e porta a casa.']],
    askBtn: 'Scrivici il tuo modello',
    galleryK: 'Il negozio', galleryH: 'Dentro Castellarano Cover Center', gallerySub: 'Pareti piene di cover e vetrine di accessori: ecco cosa ti aspetta.',
    reviewsK: 'Recensioni', reviewsH: 'Cosa dicono i clienti', noReviews: 'Ancora nessuna recensione pubblicata. Sei stato da noi? Sii il primo a lasciare un commento.',
    revFormH: 'Lascia una recensione',
    revStatic: 'Raccontaci la tua esperienza: lascia una recensione su Google oppure inviacela su WhatsApp o via email. Le più belle le pubblichiamo qui.',
    revGoogle: 'Recensisci su Google', revWa: 'Invia su WhatsApp', revMail: 'Invia via email', revWaText: 'Ciao! Ecco la mia recensione di Castellarano Cover Center: ', revMailSubj: 'Recensione Castellarano Cover Center',
    revNote: 'La tua email serve solo a verificare il messaggio e non viene mai pubblicata. Il commento appare dopo la verifica.',
    fName: 'Nome', fEmail: 'Email', fRating: 'Voto', fBody: 'Commento', fConsent: 'Accetto il trattamento dei dati come descritto nella', fPrivacy: 'informativa privacy', fSend: 'Invia recensione',
    ok: 'Grazie! Il tuo commento sarà pubblicato dopo la verifica.',
    err: { invalid: 'Controlla i campi: nome, email valida, voto e un commento di almeno 10 caratteri.', consent: 'Devi accettare l’informativa privacy.', rate: 'Troppi invii. Riprova più tardi.' },
    visitK: 'Dove siamo', visitH: 'Vieni a trovarci', near: `A Castellarano, a pochi minuti da Sassuolo, Casalgrande e Roteglia.`,
    addressL: 'Indirizzo', hoursL: 'Orari', contactL: 'Contatti', openMap: 'Apri in Google Maps',
    faqK: 'Domande', faqH: 'Domande frequenti',
    get faq() { return [
      ['Dove si trova Castellarano Cover Center?', `Siamo in ${addr}, a pochi minuti da Sassuolo e Casalgrande.`],
      ['Posso comprare online?', 'No. I prodotti si acquistano solo in negozio. Sul sito trovi informazioni, contatti e indicazioni.'],
      ['Avete la cover o la pellicola per il mio telefono?', 'Abbiamo cover per iPhone, Samsung e molti altri modelli. Scrivici su WhatsApp il modello e ti diciamo cosa abbiamo disponibile.'],
      ['Vendete anche caricabatterie, cavi e power bank?', 'Sì: caricabatterie da muro e da auto, cavi USB, Type-C e Lightning, power bank, cuffie e supporti auto.'],
      ['Come vi contatto?', `Chiamaci o scrivici su WhatsApp al ${biz.phoneDisplay}, oppure via email a ${biz.email}.`],
    ]; },
    footAbout: 'Cover, pellicole e accessori per telefoni a Castellarano (RE). Solo vendita in negozio.',
    footer: 'Tutti i diritti riservati.', privacyLink: 'Privacy',
    pTitle: 'Informativa privacy | Castellarano Cover Center',
    get pBody() { return [
      ['Titolare', `${biz.name}, ${addr}. Contatto: ${biz.email}.`],
      ['Dati raccolti', 'Solo se lasci una recensione: nome, email, voto e testo del commento.'],
      ['Finalità', 'Verificare e pubblicare le recensioni. L’email non viene mai pubblicata né ceduta a terzi e non è usata per invii commerciali.'],
      ['Conservazione', 'Fino a tua richiesta di cancellazione.'],
      ['I tuoi diritti', `Puoi chiedere accesso, correzione o cancellazione scrivendo a ${biz.email}.`],
      ['Cookie', 'Il sito non usa cookie di tracciamento né strumenti di analisi. Contiene una mappa incorporata di Google Maps.'],
    ]; },
    back: '← Torna al sito',
  },
  en: {
    code: 'en', home: '/en', alt: '/', privacy: '/en/privacy', htmlLang: 'en', locale: 'en-GB',
    title: 'Phone cases & accessories in Castellarano | Cover Center',
    desc: 'iPhone and Samsung wallet cases, screen protectors, chargers, cables and power banks in Castellarano (RE), Italy, near Sassuolo. Via Radici Nord 31.',
    nav: { products: 'Products', gallery: 'Shop', reviews: 'Reviews', visit: 'Find us', faq: 'FAQ' },
    langSwitch: 'IT', langName: 'Italiano', skip: 'Skip to content',
    eyebrow: 'Shop in Castellarano (RE), Italy',
    h1a: 'Phone cases, screen protectors', h1b: 'and accessories',
    lead: 'Hundreds of wallet cases for iPhone and Samsung, screen protectors, chargers, cables, power banks and car accessories. Come to the shop and we will find the right one for your phone together.',
    facts: [['store', 'In store only'], ['smartphone', 'iPhone, Samsung and more'], ['map-pin', 'Via Radici Nord 31']],
    chip1: 'Cases for iPhone and Samsung', chip2: 'Come and visit',
    instore: 'Products are available in store only. We do not sell online.',
    call: 'Call', whatsapp: 'WhatsApp', directions: 'Directions',
    waText: 'Hi! Do you have this for my phone? Model: ',
    productsK: 'Products', productsH: 'What you will find in store', productsSub: 'Stock changes often: message us your phone model and we will tell you what we have.',
    cats: [
      ['Wallet cases and covers', 'For iPhone, Samsung and many other models, in many colours and prints.'],
      ['Screen protectors', 'Protect your phone screen.'],
      ['Chargers and cables', 'USB, Type-C and Lightning cables, wall and car chargers.'],
      ['Power banks', 'Never run out of battery.'],
      ['Headphones and earphones', 'Wireless headphones, earphones and audio accessories.'],
      ['Car accessories and selfie sticks', 'Phone holders, car chargers, selfie sticks and more.'],
    ],
    stepsK: 'How it works', stepsH: 'Find the right case in 3 steps',
    steps: [['Send us your model', 'Message us your phone model on WhatsApp, for example “iPhone 15” or “Samsung A54”.'], ['We tell you what we have', 'We reply with what is available for your phone.'], ['Come to the shop', 'Visit us at Via Radici Nord 31, Castellarano, pick it and take it home.']],
    askBtn: 'Send us your model',
    galleryK: 'The shop', galleryH: 'Inside Castellarano Cover Center', gallerySub: 'Walls full of cases and display counters of accessories: here is what to expect.',
    reviewsK: 'Reviews', reviewsH: 'What customers say', noReviews: 'No published reviews yet. Visited us? Be the first to leave a comment.',
    revFormH: 'Leave a review',
    revStatic: 'Tell us about your visit: review us on Google, or send it to us on WhatsApp or by email. We publish the best ones here.',
    revGoogle: 'Review on Google', revWa: 'Send on WhatsApp', revMail: 'Send by email', revWaText: 'Hi! Here is my review of Castellarano Cover Center: ', revMailSubj: 'Review of Castellarano Cover Center',
    revNote: 'Your email is only used to verify the message and is never published. Comments appear after review.',
    fName: 'Name', fEmail: 'Email', fRating: 'Rating', fBody: 'Comment', fConsent: 'I agree to my data being processed as described in the', fPrivacy: 'privacy notice', fSend: 'Send review',
    ok: 'Thank you! Your comment will be published after review.',
    err: { invalid: 'Please check the fields: name, valid email, rating and a comment of at least 10 characters.', consent: 'You must accept the privacy notice.', rate: 'Too many submissions. Please try again later.' },
    visitK: 'Find us', visitH: 'Come and visit', near: 'In Castellarano, a few minutes from Sassuolo, Casalgrande and Roteglia.',
    addressL: 'Address', hoursL: 'Opening hours', contactL: 'Contact', openMap: 'Open in Google Maps',
    faqK: 'FAQ', faqH: 'Frequently asked questions',
    get faq() { return [
      ['Where is Castellarano Cover Center?', `We are at ${addr}, a few minutes from Sassuolo and Casalgrande.`],
      ['Can I buy online?', 'No. Products are sold in store only. This website has information, contacts and directions.'],
      ['Do you have a case or screen protector for my phone?', 'We have cases for iPhone, Samsung and many other models. Message us your model on WhatsApp and we will tell you what is available.'],
      ['Do you also sell chargers, cables and power banks?', 'Yes: wall and car chargers, USB, Type-C and Lightning cables, power banks, headphones and car holders.'],
      ['How can I contact you?', `Call or WhatsApp ${biz.phoneDisplay}, or email ${biz.email}.`],
    ]; },
    footAbout: 'Phone cases, screen protectors and accessories in Castellarano (RE), Italy. In-store sales only.',
    footer: 'All rights reserved.', privacyLink: 'Privacy',
    pTitle: 'Privacy notice | Castellarano Cover Center',
    get pBody() { return [
      ['Controller', `${biz.name}, ${addr}. Contact: ${biz.email}.`],
      ['Data collected', 'Only if you leave a review: name, email, rating and comment text.'],
      ['Purpose', 'To verify and publish reviews. Your email is never published, shared, or used for marketing.'],
      ['Retention', 'Until you ask us to delete it.'],
      ['Your rights', `You can request access, correction or deletion by writing to ${biz.email}.`],
      ['Cookies', 'This site uses no tracking cookies or analytics. It embeds a Google Maps map.'],
    ]; },
    back: '← Back to site',
  },
};

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const altOf = (p, t) => (t.code === 'it' ? p[3] : p[4]);

function head(c, t, { title, desc, path, ld = [], noindex = false, preload = '' }) {
  const url = c.base + path;
  const itPath = path.replace(/^\/en/, '') || '/', enPath = path.startsWith('/en') ? path : '/en' + (path === '/' ? '' : path);
  const alts = noindex ? '' : `<link rel="alternate" hreflang="it" href="${c.base}${itPath}"><link rel="alternate" hreflang="en" href="${c.base}${enPath}"><link rel="alternate" hreflang="x-default" href="${c.base}${itPath}">`;
  return `<!doctype html><html lang="${t.htmlLang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${esc(url)}">${alts}
<meta name="robots" content="${noindex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1'}">
<meta name="theme-color" content="#0a0a0a"><link rel="icon" href="/favicon.svg?v=${asset.v}" type="image/svg+xml"><link rel="icon" href="/icon-32.png?v=${asset.v}" sizes="32x32" type="image/png"><link rel="apple-touch-icon" href="/apple-touch-icon.png?v=${asset.v}"><link rel="manifest" href="/site.webmanifest?v=${asset.v}">
<meta name="geo.region" content="IT-RE"><meta name="geo.placename" content="${biz.city}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(biz.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(url)}"><meta property="og:locale" content="${t.code === 'it' ? 'it_IT' : 'en_GB'}"><meta property="og:locale:alternate" content="${t.code === 'it' ? 'en_GB' : 'it_IT'}">
<meta property="og:image" content="${c.base}/img/og.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${esc(biz.name)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${c.base}/img/og.jpg">
<link rel="preload" href="/fonts/space-grotesk.woff2" as="font" type="font/woff2" crossorigin>${preload}
<link rel="stylesheet" href="/style.css?v=${asset.v}">${ld.map((o) => `<script type="application/ld+json">${json(o)}</script>`).join('')}</head>`;
}

// Brand mark from castellarano-cover-animated.svg, inlined so it can use the self-hosted font and page CSS (animation lives in style.css).
const LOGO_VB = '100 116 824 168';
export const brandmark = (anim = false) => `<svg class="brandmark${anim ? ' anim' : ''}" viewBox="${LOGO_VB}" aria-hidden="true" focusable="false"><g class="bm-glow" transform="translate(90 90) scale(2.2)"><path class="bm-arc" d="M73 30.7 A30 30 0 1 0 73 69.3" fill="none" stroke="#22E678" stroke-width="12" stroke-linecap="round"/><polygon class="bm-bolt" points="54,30 38,54 49,54 45,70 62,45 51,45 56,30" fill="#22E678"/></g><text class="bm-t" x="340" y="215" font-size="104" font-weight="700" letter-spacing="-4" fill="#fff">castellarano</text><text class="bm-t" x="346" y="268" font-size="34" font-weight="500" letter-spacing="21" fill="#22E678">COVER</text></svg>`;
const logo = (t) => `<a class="logo" href="${t.home}" aria-label="${esc(biz.name)}">${brandmark(true)}</a>`;

function header(t, withNav = true) {
  return `<header class="top"><div class="wrap bar">${logo(t)}${withNav ? `<nav class="nav" aria-label="Main"><a href="#products">${t.nav.products}</a><a href="#gallery">${t.nav.gallery}</a><a href="#reviews">${t.nav.reviews}</a><a href="#visit">${t.nav.visit}</a><a href="#faq">${t.nav.faq}</a></nav>` : ''}
<div class="topact"><a class="lang" href="${t.alt}" hreflang="${t.code === 'it' ? 'en' : 'it'}" lang="${t.code === 'it' ? 'en' : 'it'}" title="${t.langName}">${t.langSwitch}</a><a class="btn wa sm hide-m" href="${wa(t.waText)}" target="_blank" rel="noopener">${icon('whatsapp')} ${t.whatsapp}</a></div></div></header>`;
}

function footer(t) {
  return `<footer class="foot"><div class="wrap fgrid">
<div><p class="flogo" role="img" aria-label="${esc(biz.name)}">${brandmark()}</p><p>${t.footAbout}</p></div>
<div><h2 class="fh">${t.addressL}</h2><address>${esc(biz.street)}<br>${biz.zip} ${biz.city} (${biz.region})</address><p><a class="fmap" href="${mapLink}" target="_blank" rel="noopener">${icon('googlemaps')} ${t.openMap}</a></p></div>
<div><h2 class="fh">${t.contactL}</h2><ul class="flist"><li><a href="tel:${biz.phone}">${icon('phone')} ${esc(biz.phoneDisplay)}</a></li><li><a href="${wa('')}" target="_blank" rel="noopener">${icon('whatsapp')} WhatsApp</a></li><li><a href="mailto:${esc(biz.email)}">${icon('mail')} ${esc(biz.email)}</a></li><li><a href="${esc(biz.instagram)}" target="_blank" rel="me noopener">${icon('instagram')} @cover.castellarano</a></li></ul></div>
</div><div class="wrap"><div class="fbottom"><p>© ${new Date().getFullYear()} ${esc(biz.name)} · ${t.footer}</p><p><a href="${t.privacy}">${t.privacyLink}</a> · <a href="${t.alt}">${t.langName}</a></p></div></div></footer>`;
}

const kicker = (s) => `<p class="kicker">${s}</p>`;

export function home(c, t) {
  const { reviews, stats, flash, cats } = c;
  const L = t.code;
  const hoursLines = biz.hoursText.split('\n').map((l) => l.trim()).filter(Boolean);
  const ann = biz['announce_' + L];
  const img = (p) => `${c.base}/img/${p[0]}`;
  const business = {
    '@context': 'https://schema.org', '@type': 'ElectronicsStore', '@id': c.base + '/#store',
    name: biz.name, alternateName: 'Castellarano Cover Center – Pellicole e Accessori Telefonia',
    url: c.base + '/', logo: c.base + '/icon-512.png', image: [`${c.base}/img/og.jpg`, ...PHOTOS.gallery.map(img)],
    description: T.en.desc, telephone: biz.phone, email: biz.email, hasMap: biz.mapsShort,
    sameAs: [biz.instagram], knowsLanguage: ['it', 'en'], priceRange: '€',
    areaServed: AREA.map((name) => ({ '@type': 'City', name })),
    address: { '@type': 'PostalAddress', streetAddress: biz.street, postalCode: biz.zip, addressLocality: biz.city, addressRegion: biz.region, addressCountry: 'IT' },
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'In-store products', itemListElement: cats.map((x) => ({ '@type': 'Offer', availability: 'https://schema.org/InStoreOnly', itemOffered: { '@type': 'Product', name: x.title_en, description: x.desc_en } })) },
    ...(hoursLines.length && { openingHours: hoursLines }),
    ...(stats.count && { aggregateRating: { '@type': 'AggregateRating', ratingValue: stats.avg.toFixed(1), reviewCount: stats.count, bestRating: 5 } }),
    ...(stats.count && { review: reviews.slice(0, 10).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.name }, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, reviewBody: r.body, datePublished: r.created_at.slice(0, 10) })) }),
  };
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: L, mainEntity: t.faq.map(([qq, a]) => ({ '@type': 'Question', name: qq, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const site = { '@context': 'https://schema.org', '@type': 'WebSite', name: biz.name, url: c.base + '/', inLanguage: ['it', 'en'], publisher: { '@id': c.base + '/#store' } };
  const msg = flash === 'ok' ? `<p class="flash ok" role="status">${t.ok}</p>` : t.err[flash] ? `<p class="flash bad" role="alert">${t.err[flash]}</p>` : '';
  const hours = hoursLines.length ? `<div class="info"><span class="ibub">${icon('clock')}</span><div><h3>${t.hoursL}</h3><p>${hoursLines.map(esc).join('<br>')}</p></div></div>` : '';
  const avg = stats.count ? `<div class="score"><strong>${stats.avg.toFixed(1)}</strong><div><span class="stars" aria-hidden="true">${stars(Math.round(stats.avg))}</span><small>${stats.count} ${L === 'it' ? (stats.count === 1 ? 'recensione' : 'recensioni') : stats.count === 1 ? 'review' : 'reviews'}</small></div></div>` : '';
  const title = (x) => x['title_' + L], desc = (x) => x['desc_' + L];
  const words = cats.map((x) => `<span>${icon(x.icon)} ${esc(title(x))}</span>`).join('');
  return `${head(c, t, { title: t.title, desc: t.desc, path: t.home, ld: [business, faq, site] })}
<body>${ann ? `<p class="announce">${icon('megaphone')} <span>${esc(ann)}</span></p>` : ''}<a class="skip" href="#main">${t.skip}</a>
${header(t)}
<main id="main">
<section class="hero"><div class="glow g1"></div><div class="glow g2"></div><div class="gridbg"></div>
<div class="wrap hgrid">
<div class="hcopy"><p class="pill rise">${icon('map-pin')} ${t.eyebrow}</p>
<h1 class="rise">${t.h1a} <span class="hl">${t.h1b}</span></h1>
<p class="lead rise">${t.lead}</p>
<div class="cta rise"><a class="btn wa pulse" href="${wa(t.waText)}" target="_blank" rel="noopener">${icon('whatsapp')} ${t.whatsapp}</a><a class="btn call" href="tel:${biz.phone}">${icon('phone')} ${t.call}</a><a class="btn maps" href="${mapLink}" target="_blank" rel="noopener">${icon('googlemaps')} <span><span class="hide-s">Google </span>Maps</span></a><a class="btn ig iconly" href="${esc(biz.instagram)}" target="_blank" rel="me noopener" aria-label="Instagram @cover.castellarano" title="Instagram">${icon('instagram')}</a></div>
<ul class="facts rise">${t.facts.map(([i, s]) => `<li>${icon(i)} ${s}</li>`).join('')}</ul></div>
<div class="hvis rise" aria-hidden="true">
<span class="ring r1"></span><span class="ring r2"></span><span class="ring r3"></span>
<div class="orbit o1"><span class="sat a0"><i>${icon('headphones')}</i></span><span class="sat a180"><i>${icon('battery-charging')}</i></span></div>
<div class="orbit o2"><span class="sat a60"><i>${icon('plug-zap')}</i></span><span class="sat a180"><i>${icon('shield-check')}</i></span><span class="sat a300"><i>${icon('car')}</i></span></div>
<div class="phone"><span class="notch"></span><div class="screen">
<svg class="brandmark anim pmark" viewBox="0 0 100 100"><g class="bm-glow"><path class="bm-arc" d="M71 33 A27 27 0 1 0 71 67" fill="none" stroke="#22E678" stroke-width="10" stroke-linecap="round"/><polygon class="bm-bolt" points="54,30 38,54 49,54 45,70 62,45 51,45 56,30" fill="#22E678"/></g></svg>
<p class="pname">castellarano<span>COVER</span></p><span class="pbar"><i></i></span></div></div>
<div class="chip c1"><span class="cbub">${icon('smartphone')}</span>${t.chip1}</div>
<div class="chip c2">${stats.count ? `<span class="stars">★</span> ${stats.avg.toFixed(1)} / 5` : `<span class="cbub">${icon('store')}</span>${t.chip2}`}</div></div>
</div></section>
<div class="marquee" aria-hidden="true"><div class="track">${words}${words}${words}${words}</div></div>

<section id="products" class="sec"><div class="wrap"><div class="shead reveal">${kicker(t.productsK)}<h2>${t.productsH}</h2><p class="sub">${t.productsSub}</p></div>
<ul class="grid">${cats.map((x, i) => `<li class="card reveal"><span class="num">${String(i + 1).padStart(2, '0')}</span><span class="bubble">${icon(x.icon)}</span><h3>${esc(title(x))}</h3><p>${esc(desc(x))}</p></li>`).join('')}</ul>
<p class="instore reveal">${icon('store')} ${t.instore}</p></div></section>

<section class="sec dark" aria-labelledby="steps-h"><div class="wrap"><div class="shead reveal">${kicker(t.stepsK)}<h2 id="steps-h">${t.stepsH}</h2></div>
<ol class="steps">${t.steps.map(([h, p], i) => `<li class="step reveal"><span class="snum">${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>
<p class="center reveal"><a class="btn wa" href="${wa(t.waText)}" target="_blank" rel="noopener">${icon('whatsapp')} ${t.askBtn}</a></p></div></section>

<section id="gallery" class="sec"><div class="wrap"><div class="shead reveal">${kicker(t.galleryK)}<h2>${t.galleryH}</h2><p class="sub">${t.gallerySub}</p></div></div>
<div class="gallery" tabindex="0" aria-label="${t.galleryH}">${PHOTOS.gallery.map((p) => `<figure class="gitem reveal"><img src="/img/${p[0]}" width="${p[1]}" height="${p[2]}" alt="${esc(altOf(p, t))}" loading="lazy" decoding="async"><figcaption>${esc(altOf(p, t))}</figcaption></figure>`).join('')}</div></section>

<section id="reviews" class="sec alt"><div class="wrap rgrid"><div>
<div class="shead reveal">${kicker(t.reviewsK)}<h2>${t.reviewsH}</h2></div>${avg}
<ul class="revs">${reviews.length ? reviews.map((r) => `<li class="rev reveal">${r.photo ? `<img class="rphoto" src="/uploads/${esc(r.photo)}" alt="${esc(r.name)}" loading="lazy" width="400" height="300">` : ''}<p class="stars" role="img" aria-label="${r.rating}/5">${stars(r.rating)}</p><p class="body">${esc(r.body)}</p><p class="who"><span class="avatar" aria-hidden="true">${esc(r.name.charAt(0).toUpperCase())}</span>${esc(r.name)} · <time datetime="${r.created_at.slice(0, 10)}">${new Date(r.created_at.replace(' ', 'T') + 'Z').toLocaleDateString(t.locale)}</time></p></li>`).join('') : `<li class="empty reveal"><span class="ebig">${icon('message-circle')}</span><p class="stars" aria-hidden="true">★★★★★</p><p>${t.noReviews}</p><a class="btn sm" href="#review-form">${icon('star')} ${t.revFormH}</a></li>`}</ul></div>
${c.static ? `<div class="form reveal" id="review-form"><h3>${t.revFormH}</h3><p class="sub">${t.revStatic}</p><div class="rbtns"><a class="btn maps" href="${mapLink}" target="_blank" rel="noopener">${icon('googlemaps')} ${t.revGoogle}</a><a class="btn wa" href="${wa(t.revWaText)}" target="_blank" rel="noopener">${icon('whatsapp')} ${t.revWa}</a><a class="btn ghost dk" href="mailto:${esc(biz.email)}?subject=${encodeURIComponent(t.revMailSubj)}">${icon('mail')} ${t.revMail}</a></div></div>` : `<form class="form reveal" method="post" action="/review" id="review-form"><h3>${t.revFormH}</h3><p class="sub">${t.revNote}</p>${msg}
<input type="hidden" name="lang" value="${L}">
<p class="hp" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></p>
<div class="frow"><label>${t.fName}<input name="name" required minlength="2" maxlength="40" autocomplete="given-name"></label>
<label>${t.fRating}<select name="rating" required><option value="5">★★★★★</option><option value="4">★★★★☆</option><option value="3">★★★☆☆</option><option value="2">★★☆☆☆</option><option value="1">★☆☆☆☆</option></select></label></div>
<label>${t.fEmail}<input name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email"></label>
<label>${t.fBody}<textarea name="body" required minlength="10" maxlength="600" rows="4"></textarea></label>
<label class="check"><input type="checkbox" name="consent" value="1" required> <span>${t.fConsent} <a href="${t.privacy}">${t.fPrivacy}</a></span></label>
<button class="btn" type="submit">${icon('message-circle')} ${t.fSend}</button></form>`}</div></section>

<section id="visit" class="sec"><div class="wrap"><div class="shead reveal">${kicker(t.visitK)}<h2>${t.visitH}</h2><p class="sub">${t.near}</p></div>
<div class="vgrid"><div class="vcard reveal">
<div class="info"><span class="ibub">${icon('map-pin')}</span><div><h3>${t.addressL}</h3><address><strong>${esc(biz.name)}</strong><br>${esc(biz.street)}<br>${biz.zip} ${biz.city} (${biz.region})</address></div></div>
${hours}
<div class="info"><span class="ibub">${icon('phone')}</span><div><h3>${t.contactL}</h3><p><a href="tel:${biz.phone}">${esc(biz.phoneDisplay)}</a><br><a href="mailto:${esc(biz.email)}">${esc(biz.email)}</a></p></div></div>
<div class="vbtns"><a class="btn call" href="tel:${biz.phone}">${icon('phone')} ${t.call}</a><a class="btn wa" href="${wa('')}" target="_blank" rel="noopener">${icon('whatsapp')} ${t.whatsapp}</a><a class="btn maps" href="${mapLink}" target="_blank" rel="noopener">${icon('googlemaps')} Google Maps</a><a class="btn ig" href="${esc(biz.instagram)}" target="_blank" rel="me noopener">${icon('instagram')} Instagram</a></div></div>
<iframe class="map reveal" title="${t.openMap}: ${esc(biz.name)}" src="${mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></div></section>

<section id="faq" class="sec alt"><div class="wrap narrowc"><div class="shead center reveal">${kicker(t.faqK)}<h2>${t.faqH}</h2></div>${t.faq.map(([qq, a]) => `<details class="reveal"><summary>${qq}</summary><p>${esc(a)}</p></details>`).join('')}</div></section>
</main>${footer(t)}
<nav class="dock" aria-label="Quick contact"><a class="call" href="tel:${biz.phone}">${icon('phone')}<span>${t.call}</span></a><a class="wa" href="${wa(t.waText)}" target="_blank" rel="noopener">${icon('whatsapp')}<span>${t.whatsapp}</span></a><a class="maps" href="${mapLink}" target="_blank" rel="noopener">${icon('googlemaps')}<span>${t.directions}</span></a></nav><script src="/app.js?v=${asset.v}" defer></script></body></html>`;
}

export function privacy(c, t) {
  return `${head(c, t, { title: t.pTitle, desc: t.pTitle, path: t.privacy })}<body>${header(t, false)}
<main id="main" class="sec"><div class="wrap prose"><h1>${t.pTitle.split('|')[0]}</h1>${t.pBody.map(([h, p]) => `<h2>${h}</h2><p>${esc(p)}</p>`).join('')}<p><a href="${t.home}">${t.back}</a></p></div></main>${footer(t)}</body></html>`;
}

export const notFound = (c, t = T.it) => `${head(c, t, { title: '404 | ' + biz.name, desc: '404', path: '/', noindex: true })}<body>${header(t, false)}<main class="sec"><div class="wrap prose"><h1>404</h1><p><a href="/">${biz.name}</a></p></div></main></body></html>`;

export const sitemap = (base) => {
  const imgs = PHOTOS.gallery.map((p) => `<image:image><image:loc>${base}/img/${p[0]}</image:loc></image:image>`).join('');
  const pages = [['/', '/en', imgs], ['/privacy', '/en/privacy', '']];
  const alt = (it, en) => `<xhtml:link rel="alternate" hreflang="it" href="${base}${it}"/><xhtml:link rel="alternate" hreflang="en" href="${base}${en}"/><xhtml:link rel="alternate" hreflang="x-default" href="${base}${it}"/>`;
  const url = ([it, en, im]) => `<url><loc>${base}${it}</loc>${alt(it, en)}${im}</url><url><loc>${base}${en}</loc>${alt(it, en)}${im}</url>`;
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${pages.map(url).join('')}</urlset>`;
};

const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-User', 'Claude-SearchBot', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'CCBot'];
export const robots = (base) => `User-agent: *\nAllow: /\n\n${bots.map((b) => `User-agent: ${b}\nAllow: /\n`).join('\n')}\nSitemap: ${base}/sitemap.xml\n`;

export const llms = (base, cats) => `# ${biz.name}

> Phone accessories shop in ${biz.city} (${biz.region}), Italy, a few minutes from Sassuolo and Casalgrande. Phone cases (wallet cases for iPhone, Samsung and other models), screen protectors, chargers, cables, power banks, headphones and car holders. Products are sold in store only, not online.

- Address: ${addr}, Italy
- Phone / WhatsApp: ${biz.phoneDisplay}
- Email: ${biz.email}
- Instagram: ${biz.instagram}
- Google Maps: ${biz.mapsShort}
- Languages: Italian, English
${biz.hoursText ? `- Opening hours: ${biz.hoursText.split('\n').join('; ')}\n` : ''}
## Pages
- [Home (Italiano)](${base}/): products, shop photos, reviews, location, FAQ
- [Home (English)](${base}/en): products, shop photos, reviews, location, FAQ
- [Privacy](${base}/privacy)

## Products (in store)
${cats.map((x) => `- ${x.title_en}: ${x.desc_en}`).join('\n')}

## FAQ
${T.en.faq.map(([qq, a]) => `- ${qq} ${a}`).join('\n')}
`;

export { T };
