// Shared HMAC session protocol: browser never receives the session secret.
export const COOKIE_NAME = '__Host-nvi_phuket_session';
export const SESSION_SECONDS = 12 * 60 * 60;
const enc = new TextEncoder();

const encode64Url = (bytes) => btoa(Array.from(bytes, x => String.fromCharCode(x)).join('')).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const decode64Url = (value) => {
  const raw = atob(value.replace(/-/g,'+').replace(/_/g,'/') + '='.repeat((4 - value.length % 4) % 4));
  return Uint8Array.from(raw, x => x.charCodeAt(0));
};
const keyFor = async (secret, usage) => crypto.subtle.importKey('raw', enc.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, usage);

export async function makeSessionToken(secret) {
  if (!secret || secret.length < 32) throw new Error('Session secret not configured');
  const exp = Math.floor(Date.now()/1000) + SESSION_SECONDS;
  const random = new Uint8Array(16);
  crypto.getRandomValues(random);
  const payload = `v1.${exp.toString(36)}.${encode64Url(random)}`;
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC',await keyFor(secret,['sign']),enc.encode(payload)));
  return `${payload}.${encode64Url(sig)}`;
}

export async function isValidSession(token,secret) {
  if (!token || typeof token !== 'string' || token.length > 500 || !secret || secret.length < 32) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 4 || parts[0] !== 'v1' || !/^[0-9a-z]{1,12}$/.test(parts[1]) || !/^[A-Za-z0-9_-]{22}$/.test(parts[2]) || !/^[A-Za-z0-9_-]{43}$/.test(parts[3])) return false;
    const exp = parseInt(parts[1],36);
    const now = Math.floor(Date.now()/1000);
    if (!Number.isSafeInteger(exp) || exp <= now || exp > now + SESSION_SECONDS) return false;
    const data = parts.slice(0,3).join('.');
    return await crypto.subtle.verify('HMAC',await keyFor(secret,['verify']),decode64Url(parts[3]),enc.encode(data));
  } catch { return false; }
}

export function extractCookie(request,name=COOKIE_NAME) {
  const header = request.headers.get('cookie') || '';
  const found = header.split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='));
  return found ? found.slice(name.length+1) : null;
}

export function cookieHeader(token) {
  return `${COOKIE_NAME}=${token}; Path=/; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`;
}
export function clearCookieHeader() {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
