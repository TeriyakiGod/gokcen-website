export interface Env {
  GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  LESSONS_CALENDAR_ID?: string;
  PETSITTING_CALENDAR_ID?: string;
  ASSETS: Fetcher;
  EMAIL?: SendEmail;
  OWNER_EMAIL?: string;
  FROM_EMAIL?: string;
  SEND_CONFIRMATIONS?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers },
  });
}
