import { createHash, timingSafeEqual } from 'node:crypto';
import { makeSessionToken, cookieHeader } from '../lib/session.js';

const sameOrigin = (req) => {
  const origin = req.headers.origin;
  if (!origin) return true;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return origin === `https://${host}` || (host?.startsWith('localhost:') && origin === `http://${host}`);
};

export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store, private');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method !== 'POST') return res.status(405).json({ok:false,message:'Method not allowed'});
  if(!sameOrigin(req)) return res.status(403).json({ok:false,message:'Origin not allowed'});
  const configured = process.env.PORTAL_PASSWORD;
  const secret = process.env.PORTAL_SESSION_SECRET;
  if(!configured || configured.length < 12 || !secret || secret.length < 32)
    return res.status(503).json({ok:false,message:'Private access is not yet configured. Please contact NVI.'});
  let supplied = req.body?.password;
  let accepted = req.body?.acceptedConfidentiality === true;
  if(typeof req.body === 'string') {
    try { const body=JSON.parse(req.body); supplied=body.password; accepted=body.acceptedConfidentiality === true; } catch { supplied=undefined; accepted=false; }
  }
  if(!accepted) return res.status(400).json({ok:false,message:'Please accept the confidentiality commitment.'});
  if(typeof supplied !== 'string' || supplied.length > 256)
    return res.status(400).json({ok:false,message:'Invalid access code.'});
  const a=createHash('sha256').update(supplied).digest();
  const b=createHash('sha256').update(configured).digest();
  if(!timingSafeEqual(a,b)) return res.status(401).json({ok:false,message:'The access code is incorrect.'});
  try {
    const token=await makeSessionToken(secret);
    res.setHeader('Set-Cookie',cookieHeader(token));
    return res.status(200).json({ok:true,redirect:'/rapport.html#maison'});
  } catch {
    return res.status(503).json({ok:false,message:'Service temporarily unavailable.'});
  }
}
