import { json, type Env } from '../_lib/env';

type Lang = 'en' | 'pl' | 'tr';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const oneLine = (s: string) => s.replace(/\s+/g, ' ');
const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

const confirmation: Record<Lang, { subject: string; body: (name: string) => string }> = {
  en: {
    subject: 'Thanks for your request! 🐾',
    body: (n) => `Hi ${n},<br><br>Thank you for your request — I’ve received it and will reply within a day.<br><br>Woof & warm wishes,<br>Gökçen`,
  },
  pl: {
    subject: 'Dziękuję za zgłoszenie! 🐾',
    body: (n) => `Cześć ${n},<br><br>Dziękuję za zgłoszenie — otrzymałam je i odpiszę w ciągu doby.<br><br>Hau i serdeczności,<br>Gökçen`,
  },
  tr: {
    subject: 'Talebiniz için teşekkürler! 🐾',
    body: (n) => `Merhaba ${n},<br><br>Talebiniz için teşekkürler — aldım ve bir gün içinde yanıt vereceğim.<br><br>Hav ve sevgiler,<br>Gökçen`,
  },
};

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const out = (await res.json()) as { success: boolean };
  return out.success;
}

async function sendEmail(env: Env, msg: { to: string; subject: string; html: string; reply_to?: string }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.FROM_EMAIL, ...msg }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return json({ error: 'bad_json' }, { status: 400 });
  }

  const type = raw.type === 'pet' ? 'pet' : 'lesson';
  const lang: Lang = raw.lang === 'pl' || raw.lang === 'tr' ? raw.lang : 'en';
  const name = str(raw.name, 100);
  const email = str(raw.email, 200);
  const errors: string[] = [];
  if (!name) errors.push('name');
  if (!isEmail(email)) errors.push('email');
  if (raw.consent !== 'on') errors.push('consent');

  const fields: [string, string][] = [
    ['Name', name],
    ['Email', email],
    ['Phone / WhatsApp', str(raw.phone, 40)],
    ['Reply language', lang.toUpperCase()],
  ];

  let subject: string;
  if (type === 'lesson') {
    fields.push(
      ['Level', str(raw.level, 5) || 'not sure'],
      ['Lesson type', str(raw.lessonType, 60)],
      ['Goal', str(raw.goal, 300)],
      ['Preferred times', str(raw.slots, 500)],
      ['Free trial', raw.trial === 'on' ? 'yes' : 'no'],
    );
    subject = `📚 Lesson request: ${oneLine(name)}`;
  } else {
    const petName = str(raw.petName, 60);
    const from = str(raw.from, 10);
    const to = str(raw.to, 10);
    if (!petName) errors.push('petName');
    if (!isDate(from) || !isDate(to) || to < from) errors.push('dates');
    if (raw.vaccinated !== 'on') errors.push('vaccinated');
    fields.push(
      ['Dog', petName],
      ['Breed', str(raw.breed, 100)],
      ['Size', str(raw.size, 10)],
      ['Age', str(raw.age, 30)],
      ['Dates', `${from} → ${to}`],
      ['Drop-off', str(raw.dropoff, 5)],
      ['Pick-up', str(raw.pickup, 5)],
      ['With other dogs', str(raw.temperament, 20)],
      ['Special needs', str(raw.needs, 1000)],
      ['Vaccinated', 'yes'],
    );
    subject = `🐶 Pet sitting request: ${oneLine(petName)}, ${from} → ${to}`;
  }
  fields.push(['Message', str(raw.message, 2000)]);

  if (errors.length) return json({ error: 'invalid', fields: errors }, { status: 400 });

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(str(raw['cf-turnstile-response'], 2048), env.TURNSTILE_SECRET_KEY, request.headers.get('cf-connecting-ip'));
    if (!ok) return json({ error: 'captcha' }, { status: 403 });
  }

  const rows = fields
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px;color:#5d5a6e;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:6px 12px">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');
  const ownerHtml = `<div style="font-family:system-ui,sans-serif"><h2 style="color:#ff7a5c">${esc(subject)}</h2><table style="border-collapse:collapse">${rows}</table><p style="color:#5d5a6e">Reply to this email to answer ${esc(name)} directly.</p></div>`;

  if (!env.RESEND_API_KEY || !env.OWNER_EMAIL || !env.FROM_EMAIL) {
    // Not configured yet (local dev): log instead of sending.
    console.log('[request] email not configured; would send:', subject, fields);
    return json({ ok: true, dev: true });
  }

  try {
    await sendEmail(env, { to: env.OWNER_EMAIL, subject, html: ownerHtml, reply_to: email });
    const c = confirmation[lang];
    await sendEmail(env, { to: email, subject: c.subject, html: `<div style="font-family:system-ui,sans-serif;font-size:16px">${c.body(esc(name))}</div>`, reply_to: env.OWNER_EMAIL }).catch((e) =>
      console.error('[request] confirmation failed', e),
    );
  } catch (e) {
    console.error('[request] send failed', e);
    return json({ error: 'send_failed' }, { status: 502 });
  }
  return json({ ok: true });
};
