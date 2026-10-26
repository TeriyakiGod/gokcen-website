export interface Env {
  GOOGLE_SERVICE_ACCOUNT_JSON?: string;
  LESSONS_CALENDAR_ID?: string;
  PETSITTING_CALENDAR_ID?: string;
  RESEND_API_KEY?: string;
  OWNER_EMAIL?: string;
  FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

export function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json; charset=utf-8', ...init.headers },
  });
}
