// Availability calendar: week view of lesson slots and month view of pet-sitting days.
// Busy blocks come from /api/availability; free slots are her working hours minus busy time.

interface Busy { start: string; end: string }
interface Data { demo: boolean; updated: string; lessons: Busy[]; petSitting: Busy[] }
interface Config { tz: string; hours: Record<string, [number, number]>; slotMinutes: number }

const DAY = 86_400_000;

// Offset (ms) of a timezone from UTC at a given instant.
function tzOffset(tz: string, at: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(at);
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return asUtc - at.getTime();
}

// Wall-clock time in `tz` → real instant.
function zoned(tz: string, y: number, m: number, d: number, h = 0, min = 0) {
  const guess = Date.UTC(y, m, d, h, min);
  const first = guess - tzOffset(tz, new Date(guess));
  return new Date(guess - tzOffset(tz, new Date(first)));
}

// Calendar date (y, m, d) of an instant in `tz`.
function ymd(tz: string, at: Date) {
  const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(at).split('-').map(Number);
  return { y, m: m - 1, d };
}

const iso = (p: { y: number; m: number; d: number }) =>
  `${p.y}-${String(p.m + 1).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;

function overlap(busy: { s: number; e: number }[], s: number, e: number) {
  let total = 0;
  for (const b of busy) total += Math.max(0, Math.min(e, b.e) - Math.max(s, b.s));
  return total;
}

export function initAvailability(root: HTMLElement) {
  const L = JSON.parse(root.dataset.labels!);
  const cfg: Config = JSON.parse(root.dataset.config!);
  const locale = { en: 'en-GB', pl: 'pl-PL', tr: 'tr-TR' }[root.dataset.lang as 'en' | 'pl' | 'tr'];
  const body = root.querySelector<HTMLDivElement>('.av-body')!;
  const range = root.querySelector<HTMLParagraphElement>('.av-range')!;
  const prev = root.querySelector<HTMLButtonElement>('.av-prev')!;
  const next = root.querySelector<HTMLButtonElement>('.av-next')!;
  const tzSelect = root.querySelector<HTMLSelectElement>('.av-tz select')!;
  const action = root.querySelector<HTMLDivElement>('.av-action')!;
  const selectedText = root.querySelector<HTMLParagraphElement>('.av-selected')!;
  const useBtn = root.querySelector<HTMLButtonElement>('.av-use')!;
  const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Hide the timezone switch for visitors already in Warsaw time.
  if (tzOffset(localTz, new Date()) === tzOffset(cfg.tz, new Date())) root.querySelector<HTMLElement>('.av-tz')!.hidden = true;

  let data: Data | null = null;
  let tab: 'lessons' | 'pet' = 'lessons';
  let weekOffset = 0;
  let monthOffset = 0;
  let pickedSlot: Date | null = null;
  let rangeStart: string | null = null;
  let rangeEnd: string | null = null;

  const displayTz = () => (tzSelect.value === 'warsaw' ? cfg.tz : localTz);
  const fmt = (opts: Intl.DateTimeFormatOptions, at: Date, tz = displayTz()) =>
    new Intl.DateTimeFormat(locale, { timeZone: tz, ...opts }).format(at);

  function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', text?: string) {
    const e = document.createElement(tag);
    e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function showAction(text: string | null, label = '') {
    action.classList.toggle('hidden', !text);
    action.classList.toggle('flex', !!text);
    selectedText.textContent = text ? `${L.selected}: ${text}` : '';
    useBtn.textContent = label;
  }

  function renderLessons() {
    const busy = data!.lessons.map((b) => ({ s: Date.parse(b.start), e: Date.parse(b.end) }));
    const today = ymd(cfg.tz, new Date());
    // Monday of the current week (Warsaw)
    const todayNoon = zoned(cfg.tz, today.y, today.m, today.d, 12);
    const dow = (todayNoon.getUTCDay() + 6) % 7;
    const monday = new Date(todayNoon.getTime() - dow * DAY + weekOffset * 7 * DAY);
    const days = Array.from({ length: 7 }, (_, i) => ymd(cfg.tz, new Date(monday.getTime() + i * DAY)));
    range.textContent = `${fmt({ day: 'numeric', month: 'short' }, monday, cfg.tz)} – ${fmt({ day: 'numeric', month: 'short', year: 'numeric' }, new Date(monday.getTime() + 6 * DAY), cfg.tz)}`;
    prev.disabled = weekOffset <= 0;
    next.disabled = weekOffset >= 7;

    const grid = el('div', 'grid grid-cols-1 gap-3 sm:grid-cols-7');
    const now = Date.now();
    for (const day of days) {
      const noon = zoned(cfg.tz, day.y, day.m, day.d, 12);
      const col = el('div', 'rounded-2xl bg-paper p-2');
      col.append(
        el('p', 'text-center text-xs font-bold uppercase text-muted', fmt({ weekday: 'short' }, noon, cfg.tz)),
        el('p', 'mb-2 text-center font-display text-lg font-semibold', String(day.d)),
      );
      const hours = cfg.hours[String(noon.getUTCDay())];
      const list = el('div', 'flex flex-wrap gap-1.5 sm:flex-col');
      if (!hours) list.append(el('p', 'w-full py-2 text-center text-sm text-muted', '—'));
      else {
        for (let h = hours[0]; h < hours[1]; h += cfg.slotMinutes / 60) {
          const start = zoned(cfg.tz, day.y, day.m, day.d, Math.floor(h), (h % 1) * 60);
          const end = start.getTime() + cfg.slotMinutes * 60_000;
          const taken = start.getTime() < now + 2 * 3_600_000 || overlap(busy, start.getTime(), end) > 0;
          const label = fmt({ hour: '2-digit', minute: '2-digit' }, start);
          const b = el('button', 'rounded-lg px-2 py-1 text-sm font-bold transition', label);
          b.type = 'button';
          if (taken) {
            b.disabled = true;
            b.className += ' bg-busy text-muted line-through opacity-70';
            b.setAttribute('aria-label', `${label} ${L.busy}`);
          } else {
            const picked = pickedSlot?.getTime() === start.getTime();
            b.className += picked ? ' bg-coral text-white' : ' bg-mint hover:bg-coral hover:text-white';
            b.setAttribute('aria-pressed', String(picked));
            b.onclick = () => { pickedSlot = start; render(); };
          }
          list.append(b);
        }
      }
      col.append(list);
      grid.append(col);
    }
    body.replaceChildren(grid);
    if (pickedSlot) {
      const text = `${fmt({ weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }, pickedSlot)} (${displayTz()})`;
      showAction(text, L.useSlot);
    } else showAction(null);
  }

  function renderPet() {
    const busy = data!.petSitting.map((b) => ({ s: Date.parse(b.start), e: Date.parse(b.end) }));
    const today = ymd(cfg.tz, new Date());
    const first = new Date(Date.UTC(today.y, today.m + monthOffset, 1));
    const y = first.getUTCFullYear(), m = first.getUTCMonth();
    range.textContent = fmt({ month: 'long', year: 'numeric' }, zoned(cfg.tz, y, m, 15, 12), cfg.tz);
    prev.disabled = monthOffset <= 0;
    next.disabled = monthOffset >= 2;
    root.querySelector('.av-partly-legend')!.classList.replace('hidden', 'flex');

    const grid = el('div', 'mx-auto grid max-w-xl grid-cols-7 gap-1.5 sm:gap-2');
    const monday = zoned(cfg.tz, 2024, 0, 1, 12); // a known Monday, for weekday names
    for (let i = 0; i < 7; i++) grid.append(el('p', 'text-center text-xs font-bold uppercase text-muted', fmt({ weekday: 'short' }, new Date(monday.getTime() + i * DAY), cfg.tz)));
    const lead = (new Date(Date.UTC(y, m, 1)).getUTCDay() + 6) % 7;
    for (let i = 0; i < lead; i++) grid.append(el('div'));
    const daysInMonth = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const todayIso = iso(today);
    for (let d = 1; d <= daysInMonth; d++) {
      const key = iso({ y, m, d });
      const s = zoned(cfg.tz, y, m, d).getTime();
      const e = zoned(cfg.tz, y, m, d + 1).getTime();
      const frac = overlap(busy, s, e) / (e - s);
      const past = key < todayIso;
      const state = past ? 'past' : frac >= 0.8 ? 'busy' : frac > 0 ? 'partly' : 'free';
      const inRange = rangeStart && key >= rangeStart && key <= (rangeEnd ?? rangeStart);
      const b = el('button', 'aspect-square rounded-xl text-sm font-bold transition sm:text-base', String(d));
      b.type = 'button';
      if (state === 'past' || state === 'busy') {
        b.disabled = true;
        b.className += state === 'busy' ? ' bg-busy text-muted line-through' : ' text-muted/40';
        if (state === 'busy') b.setAttribute('aria-label', `${d} ${L.busy}`);
      } else {
        b.className += inRange ? ' bg-coral text-white' : state === 'partly' ? ' bg-ball/70 hover:bg-coral hover:text-white' : ' bg-mint hover:bg-coral hover:text-white';
        if (state === 'partly') b.setAttribute('aria-label', `${d} ${L.partly}`);
        b.onclick = () => {
          if (!rangeStart || rangeEnd || key < rangeStart) { rangeStart = key; rangeEnd = null; }
          else rangeEnd = key;
          render();
        };
      }
      grid.append(b);
    }
    body.replaceChildren(grid);
    if (rangeStart) {
      const f = (k: string) => fmt({ day: 'numeric', month: 'short' }, new Date(`${k}T12:00:00Z`), 'UTC');
      showAction(rangeEnd ? `${f(rangeStart)} – ${f(rangeEnd)}` : `${f(rangeStart)} … (${L.selectRange})`, L.useDates);
      useBtn.disabled = !rangeEnd;
    } else {
      showAction(null);
      body.append(el('p', 'mt-3 text-center text-sm text-muted', L.selectRange));
    }
  }

  function render() {
    if (!data) return;
    useBtn.disabled = false;
    prev.setAttribute('aria-label', tab === 'lessons' ? L.prevWeek : L.prevMonth);
    next.setAttribute('aria-label', tab === 'lessons' ? L.nextWeek : L.nextMonth);
    root.querySelector<HTMLElement>('.av-tz')!.style.visibility = tab === 'lessons' ? '' : 'hidden';
    root.querySelector('.av-partly-legend')!.classList.replace('flex', 'hidden');
    tab === 'lessons' ? renderLessons() : renderPet();
  }

  useBtn.addEventListener('click', () => {
    if (tab === 'lessons' && pickedSlot) {
      const warsaw = fmt({ weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }, pickedSlot, cfg.tz);
      window.dispatchEvent(new CustomEvent('request:slot', { detail: `${warsaw} (Warsaw)` }));
    } else if (tab === 'pet' && rangeStart && rangeEnd) {
      window.dispatchEvent(new CustomEvent('request:dates', { detail: { from: rangeStart, to: rangeEnd } }));
    }
    document.getElementById('request')?.scrollIntoView();
  });

  root.querySelectorAll<HTMLButtonElement>('.av-tab').forEach((b, _, all) =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab as typeof tab;
      all.forEach((x) => x.setAttribute('aria-selected', String(x === b)));
      render();
    }),
  );
  prev.addEventListener('click', () => { tab === 'lessons' ? weekOffset-- : monthOffset--; render(); });
  next.addEventListener('click', () => { tab === 'lessons' ? weekOffset++ : monthOffset++; render(); });
  tzSelect.addEventListener('change', render);

  fetch('/api/availability')
    .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    .then((d: Data) => {
      data = d;
      root.querySelector('.av-demo')!.classList.toggle('hidden', !d.demo);
      root.querySelector('.av-updated')!.textContent = `${L.updated}: ${fmt({ hour: '2-digit', minute: '2-digit' }, new Date(d.updated))}`;
      render();
    })
    .catch(() => {
      body.replaceChildren(el('p', 'py-16 text-center text-muted', `🐾 ${L.error}`));
    });
}
