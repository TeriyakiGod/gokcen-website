# gokcen-website
This is a website for my wife's business. She teaches English online and pet sits dogs.

Built with Astro + Tailwind, Three.js for the dogs, and a Cloudflare Worker (`worker/`) that
serves the site plus the calendar and request-form endpoints. Pages are in English (`/en/`), Polish (`/pl/`) and Turkish (`/tr/`).

## Run it locally

```bash
npm install
npm run dev        # fast page editing, no /api endpoints
npm run build && npm run preview   # full site incl. calendar + form at http://localhost:8788
```

Without any secrets the calendar shows example data and the form logs requests to the
terminal instead of emailing them. With `OWNER_EMAIL` and `FROM_EMAIL` set in `.dev.vars`,
`wrangler dev` simulates the email binding and logs the full email instead of sending it.

## Where to change things

| What | File |
| --- | --- |
| Prices, working hours, email, WhatsApp, Instagram | `src/config/business.ts` |
| All text (EN / PL / TR) | `src/i18n/en.ts`, `pl.ts`, `tr.ts` |
| Photos and their descriptions | `public/photos/` + `src/data/gallery.ts` |
| "Word of the day" idioms | `src/data/idioms.ts` |
| Level quiz questions | `src/data/quiz.ts` |
| The 3D dogs | `src/three/DogScene.ts` |

### Swapping in real photos
Put the photo in `public/photos/` (e.g. `dogs-1.jpg`, ideally ≤ 2000px wide), then in
`src/data/gallery.ts` change its `src` to `/photos/dogs-1.jpg`, update `width`/`height`,
and remove `placeholder: true`. The hero and about photos are `heroPhoto` and `aboutPhoto`.

## Connecting Google Calendar
The site only ever sees *busy/free* times, never event titles.

1. In [Google Cloud Console](https://console.cloud.google.com/) create a project and enable the **Google Calendar API**.
2. *IAM & Admin → Service accounts → Create*. Open it → *Keys → Add key → JSON*. Keep the downloaded file safe.
3. In Google Calendar, for each of the two calendars (Lessons, Pet sitting): *Settings and sharing →
   Share with specific people → add the service account's email* with permission
   **"See only free/busy (hide details)"**. Copy each *Calendar ID* from *Integrate calendar*.
4. Set the values in Cloudflare (see below): `GOOGLE_SERVICE_ACCOUNT_JSON` (the whole JSON file),
   `LESSONS_CALENDAR_ID`, `PETSITTING_CALENDAR_ID`.

Changes in her calendar appear on the site within ~10 minutes.

## Email (Cloudflare Email Service) and spam protection (Turnstile)
Requests are emailed through the Worker's `EMAIL` (`send_email`) binding. The domain must use
Cloudflare DNS.

1. In the Cloudflare dashboard go to *Email Service*. Under *Email Routing*, add Gökçen's inbox
   as a **destination address** and click the verification link it receives.
2. Under *Email Sending*, **Onboard Domain** for the site's domain (adds SPF/DKIM/DMARC records).
3. Set `OWNER_EMAIL` (the verified inbox) and `FROM_EMAIL` (e.g. `hello@domain.pl`) in `wrangler.toml`.
4. Optional: set `SEND_CONFIRMATIONS = "true"` to also email each client a confirmation in their
   language. Sending to addresses other than verified ones needs the **Workers Paid** plan
   ($5/month); notifications to Gökçen work on the free plan.
5. In the dashboard create a **Turnstile** widget for the domain. Set the secret with
   `wrangler secret put TURNSTILE_SECRET_KEY` and the build variable `PUBLIC_TURNSTILE_SITE_KEY`.

## Deploying to Cloudflare Workers
```bash
wrangler secret put GOOGLE_SERVICE_ACCOUNT_JSON
wrangler secret put TURNSTILE_SECRET_KEY
PUBLIC_TURNSTILE_SITE_KEY=<site key> npm run deploy
```
Or connect the GitHub repo in *Workers & Pages → Create → Import a repository*, with build command
`npm run build` and deploy command `npx wrangler deploy`. Then add the custom domain under the
Worker's *Settings → Domains & Routes*.

For local testing with real services, copy `.dev.vars.example` to `.dev.vars` and fill it in.
