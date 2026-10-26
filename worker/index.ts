// Serves the static site and the two API endpoints.
import { handleAvailability } from './availability';
import { handleRequest } from './request';
import { json, type Env } from './env';

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/availability') {
      return request.method === 'GET' ? handleAvailability(request, env, ctx) : json({ error: 'method' }, { status: 405 });
    }
    if (pathname === '/api/request') {
      return request.method === 'POST' ? handleRequest(request, env) : json({ error: 'method' }, { status: 405 });
    }
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
