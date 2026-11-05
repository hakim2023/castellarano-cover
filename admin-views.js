// Admin pages (shared by server.js and the Netlify functions). Interface in Italian, English or Arabic (RTL).
import { esc, brandmark, asset } from './views.js';
import { icon, ICON_CHOICES } from './icons.js';

export const ADMIN_LANGS = ['it', 'en', 'ar'];
const AT = {
  it: {
    title: 'Pannello admin', login: 'Accedi', password: 'Password', wrongPw: 'Password errata.', tooMany: 'Troppi tentativi. Riprova tra 15 minuti.',
    forgot: 'Password dimenticata?', sendLink: 'Invia link via email', linkSent: 'Se l’email è configurata, abbiamo inviato un link a {email}. Valido 30 minuti.',
    mailOff: 'Invio email non configurato: manca RESEND_API_KEY su Netlify.', wait: 'Un link è stato inviato da poco. Riprova tra 2 minuti.',
    newPw: 'Nuova password (min. 10 caratteri)', confirmPw: 'Ripeti la password', setPw: 'Salva nuova password', setPwTitle: 'Scegli una nuova password',
    pwChanged: 'Password cambiata. Accedi con la nuova password.', badLink: 'Link non valido o scaduto. Richiedine uno nuovo.', pwMismatch: 'Le password non coincidono o sono più corte di 10 caratteri.',
    back: 'Torna al login', logout: 'Esci', viewSite: 'Vedi sito', tabReviews: 'Recensioni', tabProducts: 'Prodotti', tabSettings: 'Impostazioni',
    pending: 'In attesa', approved: 'Pubblicata', hidden: 'Nascosta', publish: 'Pubblica', hide: 'Nascondi', del: 'Elimina', confirmDel: 'Sì, elimina', edit: 'Modifica', save: 'Salva', add: 'Aggiungi',
    noReviews: 'Nessuna recensione per ora.', addReview: 'Aggiungi una recensione (solo reali)', name: 'Nome', rating: 'Voto', status: 'Stato', comment: 'Commento',
    photo: 'Foto (facoltativa, JPG/PNG/WebP, max 4 MB)', removePhoto: 'Rimuovi foto', byAdmin: 'aggiunta dall’admin', toApprove: 'da approvare',
    addProduct: 'Aggiungi prodotto', order: 'Ordine', icon: 'Icona', titleIt: 'Titolo (italiano)', titleEn: 'Titolo (inglese)', textIt: 'Testo (italiano)', textEn: 'Testo (inglese)',
    phone: 'Telefono', email: 'Email del negozio', instagram: 'Link Instagram', hours: 'Orari (una riga per voce, es. Mo-Sa 09:00-19:30; vuoto = nascosti)',
    annIt: 'Avviso in alto (italiano, vuoto = nessuno)', annEn: 'Avviso in alto (inglese)', saveSettings: 'Salva impostazioni',
    security: 'Sicurezza', changePw: 'Cambia password', changePwHint: 'Ti invieremo un link a {email} per scegliere la nuova password.', localPw: 'Per cambiare la password su questo computer usa: npm run set-password',
    resetTitle: 'Ripristina impostazioni iniziali', resetHint: 'Riporta prodotti, telefono, email, Instagram, orari e avvisi ai valori iniziali. Le recensioni non vengono toccate.',
    resetConfirm: 'Sì, voglio ripristinare', reset: 'Ripristina', saved: 'Salvato.', deleted: 'Eliminato.', resetDone: 'Impostazioni iniziali ripristinate.', invalid: 'Controlla i campi e riprova.',
    mailSubject: 'Reimposta la password admin – Castellarano Cover', mailBody: 'Hai chiesto di cambiare la password del pannello admin. Apri questo link entro 30 minuti:', mailIgnore: 'Se non sei stato tu, ignora questa email: la password resta invariata.',
  },
  en: {
    title: 'Admin panel', login: 'Log in', password: 'Password', wrongPw: 'Wrong password.', tooMany: 'Too many attempts. Try again in 15 minutes.',
    forgot: 'Forgot password?', sendLink: 'Email me a reset link', linkSent: 'If email is set up, a link was sent to {email}. Valid for 30 minutes.',
    mailOff: 'Email sending is not set up: RESEND_API_KEY is missing on Netlify.', wait: 'A link was sent a moment ago. Try again in 2 minutes.',
    newPw: 'New password (min. 10 characters)', confirmPw: 'Repeat password', setPw: 'Save new password', setPwTitle: 'Choose a new password',
    pwChanged: 'Password changed. Log in with your new password.', badLink: 'Invalid or expired link. Request a new one.', pwMismatch: 'Passwords do not match or are shorter than 10 characters.',
    back: 'Back to login', logout: 'Log out', viewSite: 'View site', tabReviews: 'Reviews', tabProducts: 'Products', tabSettings: 'Settings',
    pending: 'Pending', approved: 'Published', hidden: 'Hidden', publish: 'Publish', hide: 'Hide', del: 'Delete', confirmDel: 'Yes, delete', edit: 'Edit', save: 'Save', add: 'Add',
    noReviews: 'No reviews yet.', addReview: 'Add a review (real ones only)', name: 'Name', rating: 'Rating', status: 'Status', comment: 'Comment',
    photo: 'Photo (optional, JPG/PNG/WebP, max 4 MB)', removePhoto: 'Remove photo', byAdmin: 'added by admin', toApprove: 'to approve',
    addProduct: 'Add product', order: 'Order', icon: 'Icon', titleIt: 'Title (Italian)', titleEn: 'Title (English)', textIt: 'Text (Italian)', textEn: 'Text (English)',
    phone: 'Phone', email: 'Shop email', instagram: 'Instagram link', hours: 'Opening hours (one per line, e.g. Mo-Sa 09:00-19:30; empty = hidden)',
    annIt: 'Top banner (Italian, empty = none)', annEn: 'Top banner (English)', saveSettings: 'Save settings',
    security: 'Security', changePw: 'Change password', changePwHint: 'We will email a link to {email} to choose the new password.', localPw: 'To change the password on this computer run: npm run set-password',
    resetTitle: 'Reset to initial settings', resetHint: 'Restores products, phone, email, Instagram, hours and banners to the original values. Reviews are not touched.',
    resetConfirm: 'Yes, I want to reset', reset: 'Reset', saved: 'Saved.', deleted: 'Deleted.', resetDone: 'Initial settings restored.', invalid: 'Check the fields and try again.',
    mailSubject: 'Reset the admin password – Castellarano Cover', mailBody: 'You asked to change the admin panel password. Open this link within 30 minutes:', mailIgnore: 'If this wasn’t you, ignore this email: the password stays the same.',
  },
  ar: {
    title: 'لوحة الإدارة', login: 'تسجيل الدخول', password: 'كلمة المرور', wrongPw: 'كلمة المرور غير صحيحة.', tooMany: 'محاولات كثيرة جدًا. حاول مرة أخرى بعد 15 دقيقة.',
    forgot: 'نسيت كلمة المرور؟', sendLink: 'أرسل رابط إعادة التعيين بالبريد', linkSent: 'إذا كان البريد مُعدًّا، فقد أرسلنا رابطًا إلى {email}. صالح لمدة 30 دقيقة.',
    mailOff: 'إرسال البريد غير مُعدّ: المفتاح RESEND_API_KEY غير موجود في Netlify.', wait: 'تم إرسال رابط قبل قليل. حاول مرة أخرى بعد دقيقتين.',
    newPw: 'كلمة مرور جديدة (10 أحرف على الأقل)', confirmPw: 'أعد كتابة كلمة المرور', setPw: 'احفظ كلمة المرور الجديدة', setPwTitle: 'اختر كلمة مرور جديدة',
    pwChanged: 'تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.', badLink: 'الرابط غير صالح أو منتهي الصلاحية. اطلب رابطًا جديدًا.', pwMismatch: 'كلمتا المرور غير متطابقتين أو أقصر من 10 أحرف.',
    back: 'العودة إلى تسجيل الدخول', logout: 'تسجيل الخروج', viewSite: 'عرض الموقع', tabReviews: 'التقييمات', tabProducts: 'المنتجات', tabSettings: 'الإعدادات',
    pending: 'قيد الانتظار', approved: 'منشور', hidden: 'مخفي', publish: 'نشر', hide: 'إخفاء', del: 'حذف', confirmDel: 'نعم، احذف', edit: 'تعديل', save: 'حفظ', add: 'إضافة',
    noReviews: 'لا توجد تقييمات بعد.', addReview: 'أضف تقييمًا (حقيقيًا فقط)', name: 'الاسم', rating: 'التقييم', status: 'الحالة', comment: 'التعليق',
    photo: 'صورة (اختيارية، JPG/PNG/WebP، بحد أقصى 4 ميغابايت)', removePhoto: 'إزالة الصورة', byAdmin: 'أضافه المسؤول', toApprove: 'بانتظار الموافقة',
    addProduct: 'إضافة منتج', order: 'الترتيب', icon: 'الأيقونة', titleIt: 'العنوان (بالإيطالية)', titleEn: 'العنوان (بالإنجليزية)', textIt: 'النص (بالإيطالية)', textEn: 'النص (بالإنجليزية)',
    phone: 'الهاتف', email: 'بريد المتجر', instagram: 'رابط إنستغرام', hours: 'ساعات العمل (سطر لكل فترة، مثل Mo-Sa 09:00-19:30؛ فارغ = مخفية)',
    annIt: 'شريط الإعلان (بالإيطالية، فارغ = بدون)', annEn: 'شريط الإعلان (بالإنجليزية)', saveSettings: 'حفظ الإعدادات',
    security: 'الأمان', changePw: 'تغيير كلمة المرور', changePwHint: 'سنرسل رابطًا إلى {email} لاختيار كلمة المرور الجديدة.', localPw: 'لتغيير كلمة المرور على هذا الكمبيوتر استخدم: npm run set-password',
    resetTitle: 'استعادة الإعدادات الأولية', resetHint: 'يعيد المنتجات والهاتف والبريد وإنستغرام وساعات العمل والإعلانات إلى القيم الأصلية. لا يتم المساس بالتقييمات.',
    resetConfirm: 'نعم، أريد الاستعادة', reset: 'استعادة', saved: 'تم الحفظ.', deleted: 'تم الحذف.', resetDone: 'تمت استعادة الإعدادات الأولية.', invalid: 'تحقق من الحقول وحاول مرة أخرى.',
    mailSubject: 'إعادة تعيين كلمة مرور الإدارة – Castellarano Cover', mailBody: 'لقد طلبت تغيير كلمة مرور لوحة الإدارة. افتح هذا الرابط خلال 30 دقيقة:', mailIgnore: 'إذا لم تكن أنت، فتجاهل هذه الرسالة: ستبقى كلمة المرور كما هي.',
  },
};
export const adminText = (lang) => AT[ADMIN_LANGS.includes(lang) ? lang : 'it'];
/** Reads the admin language from ?lang= or the alang cookie. */
export const adminLang = (url, cookie = '') => {
  const q = new URL(url, 'http://x').searchParams.get('lang');
  if (ADMIN_LANGS.includes(q)) return q;
  const m = /(?:^|; )alang=(it|en|ar)/.exec(cookie);
  return m ? m[1] : 'it';
};
export const NOTICES = ['saved', 'deleted', 'resetDone', 'invalid', 'pwChanged', 'linkSent', 'mailOff', 'wait', 'badLink', 'pwMismatch', 'wrongPw', 'tooMany'];
const fill = (s, email) => s.replace('{email}', esc(email || ''));
const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

function page(t, lang, A, title, body, { loggedIn = false, csrf = '' } = {}) {
  const langs = ADMIN_LANGS.map((l) => `<a href="${A}?lang=${l}"${l === lang ? ' aria-current="true"' : ''} lang="${l}">${l.toUpperCase()}</a>`).join('');
  return `<!doctype html><html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css?v=${asset.v}"></head><body class="admin">
<header class="atop"><div class="wrap abar"><a class="alogo" href="${A}" aria-label="${t.title}">${brandmark()}</a><nav class="alangs" aria-label="Language">${langs}</nav>
${loggedIn ? `<form method="post" action="${A}"><input type="hidden" name="op" value="logout"><input type="hidden" name="csrf" value="${csrf}"><button class="abtn ghost" type="submit">${t.logout}</button></form>` : ''}</div></header>
<main class="wrap amain">${body}</main></body></html>`;
}
const flash = (t, code, email) => (code && t[code] ? `<p class="flash ${['invalid', 'badLink', 'pwMismatch', 'wrongPw', 'tooMany', 'mailOff', 'wait'].includes(code) ? 'bad' : 'ok'}" role="status">${fill(t[code], email)}</p>` : '');

/** Login page. o: { lang, notice, action, resetAction, adminEmail } — resetAction/adminEmail only when email reset is available. */
export function adminLogin(A, o = {}) {
  const lang = o.lang || 'it', t = adminText(lang);
  const forgot = o.resetAction ? `<details class="aforgot"><summary>${t.forgot}</summary><form method="post" action="${o.resetAction}"><input type="hidden" name="op" value="request"><input type="hidden" name="lang" value="${lang}"><p class="muted">${fill(t.changePwHint, o.adminEmail)}</p><button class="abtn ghost wide" type="submit">${icon('mail')} ${t.sendLink}</button></form></details>` : '';
  return page(t, lang, A, t.title, `<section class="acard alogin"><h1>${t.title}</h1>${flash(t, o.notice, o.adminEmail)}
<form method="post" action="${o.action || A}" class="aform1"><input type="hidden" name="op" value="login"><input type="hidden" name="lang" value="${lang}"><label>${t.password}<input type="password" name="password" required maxlength="200" autocomplete="current-password"></label><button class="abtn wide" type="submit">${t.login}</button></form>${forgot}</section>`);
}

/** Page opened from the emailed link. */
export function adminResetForm(A, o = {}) {
  const lang = o.lang || 'it', t = adminText(lang);
  const body = o.valid
    ? `<form method="post" action="${o.action}" class="aform1"><input type="hidden" name="op" value="set"><input type="hidden" name="lang" value="${lang}"><input type="hidden" name="token" value="${esc(o.token)}"><label>${t.newPw}<input type="password" name="password" required minlength="10" maxlength="200" autocomplete="new-password"></label><label>${t.confirmPw}<input type="password" name="password2" required minlength="10" maxlength="200" autocomplete="new-password"></label><button class="abtn wide" type="submit">${t.setPw}</button></form>`
    : `<p><a class="abtn ghost wide" href="${A}">${t.back}</a></p>`;
  return page(t, lang, A, t.setPwTitle, `<section class="acard alogin"><h1>${t.setPwTitle}</h1>${flash(t, o.notice || (o.valid ? '' : 'badLink'))}${body}</section>`);
}

const sel = (name, opts, cur) => `<select name="${name}">${opts.map(([v, l]) => `<option value="${v}"${String(v) === String(cur) ? ' selected' : ''}>${l}</option>`).join('')}</select>`;

/** Main panel. o: { lang, notice, resetAction, adminEmail, biz } */
export function adminPanel(A, csrf, { reviews, cats }, o = {}) {
  const lang = o.lang || 'it', t = adminText(lang), biz = o.biz;
  const RATINGS = [5, 4, 3, 2, 1].map((n) => [n, stars(n)]);
  const STATUSES = ['approved', 'pending', 'hidden'].map((s) => [s, t[s]]);
  const hid = (op, extra = '') => `<input type="hidden" name="op" value="${op}"><input type="hidden" name="csrf" value="${csrf}">${extra}`;
  const idf = (id) => `<input type="hidden" name="id" value="${esc(id)}">`;
  const pending = reviews.filter((r) => r.status === 'pending').length;
  const delBox = (op, id) => `<details class="adel"><summary class="abtn danger-ghost">${icon('trash-2')} ${t.del}</summary><form method="post" action="${A}">${hid(op, idf(id))}<button class="abtn danger" type="submit">${t.confirmDel}</button></form></details>`;
  const reviewFields = (r = {}) => `<label>${t.name}<input name="name" value="${esc(r.name || '')}" required maxlength="40"></label>
<label>${t.rating}${sel('rating', RATINGS, r.rating || 5)}</label><label>${t.status}${sel('status', STATUSES, r.status || 'approved')}</label>
<label class="full">${t.comment}<textarea name="body" required minlength="10" maxlength="600" rows="4">${esc(r.body || '')}</textarea></label>
${r.photo ? `<label class="check full"><input type="checkbox" name="remove_photo" value="1"> <span>${t.removePhoto}</span></label>` : ''}
<label class="full">${t.photo}<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"></label>`;
  const reviewCard = (r) => `<article class="acard rv">
<div class="rvhead"><span class="pill ${r.status}">${t[r.status]}</span><span class="stars" aria-label="${r.rating}/5">${stars(r.rating)}</span></div>
<p class="rvname"><strong>${esc(r.name)}</strong> <small class="muted">${esc(String(r.created_at).slice(0, 10))}</small></p>
<p class="rvbody">${esc(r.body)}</p><p class="muted small">${esc(r.email) || t.byAdmin}</p>
${r.photo ? `<img class="athumb" src="/uploads/${esc(r.photo)}" alt="" width="160" height="120" loading="lazy">` : ''}
<div class="rvacts"><form method="post" action="${A}">${hid('review_status', idf(r.id) + `<input type="hidden" name="status" value="${r.status === 'approved' ? 'hidden' : 'approved'}">`)}<button class="abtn ${r.status === 'approved' ? 'ghost' : ''}" type="submit">${r.status === 'approved' ? t.hide : t.publish}</button></form>${delBox('review_delete', r.id)}</div>
<details class="aedit"><summary>${t.edit}</summary><form method="post" action="${A}" enctype="multipart/form-data" class="agrid">${hid('review_save', idf(r.id))}${reviewFields(r)}<button class="abtn full" type="submit">${t.save}</button></form></details></article>`;
  const catFields = (x = {}) => `<label>${t.order}<input type="number" name="pos" value="${x.pos ?? 99}" min="0" max="999" inputmode="numeric"></label><label>${t.icon}${sel('icon', ICON_CHOICES.map((i) => [i, i]), x.icon || 'smartphone')}</label>
<label>${t.titleIt}<input name="title_it" value="${esc(x.title_it || '')}" required maxlength="60"></label><label>${t.titleEn}<input name="title_en" value="${esc(x.title_en || '')}" required maxlength="60"></label>
<label class="full">${t.textIt}<input name="desc_it" value="${esc(x.desc_it || '')}" maxlength="160"></label><label class="full">${t.textEn}<input name="desc_en" value="${esc(x.desc_en || '')}" maxlength="160"></label>`;
  const catCard = (x) => `<details class="acard pc"><summary><span class="pcic">${icon(x.icon)}</span><span>${esc(lang === 'it' ? x.title_it : x.title_en)}</span><small class="muted">#${x.pos}</small></summary>
<form method="post" action="${A}" class="agrid">${hid('cat_save', idf(x.id))}${catFields(x)}<button class="abtn full" type="submit">${t.save}</button></form>${delBox('cat_delete', x.id)}</details>`;
  const security = o.resetAction
    ? `<form method="post" action="${o.resetAction}">${hid('request')}<input type="hidden" name="lang" value="${lang}"><p class="muted">${fill(t.changePwHint, o.adminEmail)}</p><button class="abtn ghost" type="submit">${icon('mail')} ${t.changePw}</button></form>`
    : `<p class="muted">${t.localPw}</p>`;
  return page(t, lang, A, t.title, `${flash(t, o.notice, o.adminEmail)}
<nav class="atabs"><a href="#reviews">${t.tabReviews}${pending ? ` <b class="badge">${pending}</b>` : ''}</a><a href="#products">${t.tabProducts}</a><a href="#settings">${t.tabSettings}</a><a href="/" target="_blank" rel="noopener">${t.viewSite}</a></nav>
<section id="reviews" class="asec"><h2>${t.tabReviews}${pending ? ` <small class="muted">· ${pending} ${t.toApprove}</small>` : ''}</h2>
<details class="acard aadd"><summary>+ ${t.addReview}</summary><form method="post" action="${A}" enctype="multipart/form-data" class="agrid">${hid('review_add')}${reviewFields()}<button class="abtn full" type="submit">${t.add}</button></form></details>
${reviews.map(reviewCard).join('') || `<p class="muted">${t.noReviews}</p>`}</section>
<section id="products" class="asec"><h2>${t.tabProducts}</h2>${cats.map(catCard).join('')}
<details class="acard aadd"><summary>+ ${t.addProduct}</summary><form method="post" action="${A}" class="agrid">${hid('cat_save', idf(0))}${catFields()}<button class="abtn full" type="submit">${t.add}</button></form></details></section>
<section id="settings" class="asec"><h2>${t.tabSettings}</h2>
<form method="post" action="${A}" class="acard agrid">${hid('settings_save')}
<label>${t.phone}<input name="phoneDisplay" value="${esc(biz.phoneDisplay)}" required maxlength="30" inputmode="tel"></label>
<label>${t.email}<input type="email" name="email" value="${esc(biz.email)}" required maxlength="120"></label>
<label class="full">${t.instagram}<input type="url" name="instagram" value="${esc(biz.instagram)}" required maxlength="200"></label>
<label class="full">${t.hours}<textarea name="hoursText" rows="3" maxlength="400" dir="ltr">${esc(biz.hoursText)}</textarea></label>
<label class="full">${t.annIt}<input name="announce_it" value="${esc(biz.announce_it)}" maxlength="160" dir="ltr"></label>
<label class="full">${t.annEn}<input name="announce_en" value="${esc(biz.announce_en)}" maxlength="160" dir="ltr"></label>
<button class="abtn full" type="submit">${t.saveSettings}</button></form>
<div class="acard"><h3>${icon('shield-check')} ${t.security}</h3>${security}</div>
<div class="acard adanger"><h3>${t.resetTitle}</h3><p class="muted">${t.resetHint}</p><form method="post" action="${A}">${hid('reset_defaults')}<label class="check"><input type="checkbox" name="confirm" value="1" required> <span>${t.resetConfirm}</span></label><button class="abtn danger" type="submit">${t.reset}</button></form></div></section>`, { loggedIn: true, csrf });
}

/** Plain-text + HTML email for the reset link. */
export function resetEmail(lang, link) {
  const t = adminText(lang);
  return { subject: t.mailSubject, text: `${t.mailBody}\n\n${link}\n\n${t.mailIgnore}`, html: `<div dir="${lang === 'ar' ? 'rtl' : 'ltr'}" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5"><p>${t.mailBody}</p><p><a href="${esc(link)}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none">${t.setPw}</a></p><p style="color:#555;font-size:13px">${t.mailIgnore}</p></div>` };
}
