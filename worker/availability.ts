import { json, type Env } from './env';
import { freeBusy, getAccessToken, type Busy } from './google';

const WEEKS = 9;
const CACHE_SECONDS = 600;

// Plausible-looking fake data so the calendar UI works before Google is connected.
function demoData(now: Date): { lessons: Busy[]; petSitting: Busy[] } {
  const lessons: Busy[] = [];
  const petSitting: Busy[] = [];
  const day0 = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  for (let d = 0; d < WEEKS * 7; d++) {
    const day = new Date(day0.getTime() + d * 86_400_000);
    const seed = (day.getUTCDate() * 7 + day.getUTCMonth() * 13) % 11;
    // Lessons: a few busy hours per day (times in UTC; Warsaw is UTC+1/+2)
    for (const h of [8, 10, 13, 15, 17]) {
      if ((seed + h) % 3 === 0) {
        const s = new Date(day.getTime() + h * 3_600_000);
        lessons.push({ start: s.toISOString(), end: new Date(s.getTime() + 3_600_000).toISOString() });
      }
    }
    // Pet sitting: a stay starting roughly every 9 days, 2–4 days long
    if (d % 9 === 2) {
      const len = 2 + (seed % 3);
      petSitting.push({ start: day.toISOString(), end: new Date(day.getTime() + len * 86_400_000).toISOString() });
    }
  }
  return { lessons, petSitting };
}

export async function handleAvailability(request: Request, env: Env, ctx: ExecutionContext) {
  const cache = caches.default;
  const cacheKey = new Request(new URL('/api/availability', request.url).toString());
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const now = new Date();
  const until = new Date(now.getTime() + WEEKS * 7 * 86_400_000);
  let body: Record<string, unknown>;

  if (!env.GOOGLE_SERVICE_ACCOUNT_JSON || !env.LESSONS_CALENDAR_ID || !env.PETSITTING_CALENDAR_ID) {
    body = { demo: true, updated: now.toISOString(), ...demoData(now) };
  } else {
    try {
      const token = await getAccessToken(env.GOOGLE_SERVICE_ACCOUNT_JSON, 'https://www.googleapis.com/auth/calendar.freebusy');
      const cals = await freeBusy(token, [env.LESSONS_CALENDAR_ID, env.PETSITTING_CALENDAR_ID], now, until);
      body = {
        demo: false,
        updated: now.toISOString(),
        lessons: cals[env.LESSONS_CALENDAR_ID]?.busy ?? [],
        petSitting: cals[env.PETSITTING_CALENDAR_ID]?.busy ?? [],
      };
    } catch (e) {
      console.error('[availability]', e);
      return json({ error: 'calendar_unavailable' }, { status: 502 });
    }
  }

  const res = json(body, { headers: { 'cache-control': `public, max-age=${CACHE_SECONDS}` } });
  ctx.waitUntil(cache.put(cacheKey, res.clone()));
  return res;
}
