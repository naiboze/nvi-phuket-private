import { next } from '@vercel/functions';
import { COOKIE_NAME, isValidSession, extractCookie } from './lib/session.js';

const publicRoutes = new Set(['/', '/index.html', '/favicon.svg', '/robots.txt']);
export default async function middleware(request) {
  const path = new URL(request.url).pathname;
  const method = request.method.toUpperCase();
  if (path === '/api/login' || path === '/api/logout') return next();
  // Public access page only; all report content requires an authenticated session.
  if (publicRoutes.has(path)) {
    // Skip entering a code again while a valid session is active.
    if ((path === '/' || path === '/index.html') && method === 'GET' &&
        await isValidSession(extractCookie(request,COOKIE_NAME),process.env.PORTAL_SESSION_SECRET))
      return Response.redirect(new URL('/rapport.html',request.url),302);
    return next();
  }
  // Block unpublished APIs by default, not just the report page.
  if (path.startsWith('/api/')) return new Response('Not Found',{status:404,headers:{'Cache-Control':'no-store'}});
  if (!['GET','HEAD'].includes(method)) return new Response('Method Not Allowed',{status:405});
  if (!await isValidSession(extractCookie(request,COOKIE_NAME),process.env.PORTAL_SESSION_SECRET))
    return Response.redirect(new URL('/?access=required',request.url),302);
  return next();
}
export const config = { matcher: '/:path*', runtime: 'edge' };
