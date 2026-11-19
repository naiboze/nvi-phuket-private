import { clearCookieHeader } from '../lib/session.js';
export default function handler(req,res) {
  res.setHeader('Cache-Control','no-store, private');
  if(req.method !== 'POST') return res.status(405).json({ok:false});
  const origin=req.headers.origin;
  const host=req.headers['x-forwarded-host'] || req.headers.host;
  if(origin && origin !== `https://${host}` && !(host?.startsWith('localhost:') && origin === `http://${host}`)) return res.status(403).json({ok:false});
  res.setHeader('Set-Cookie', clearCookieHeader());
  return res.status(200).json({ok:true});
}
