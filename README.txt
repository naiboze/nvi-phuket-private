NVI × INTERCONTINENTAL PHUKET RESORT — PRIVATE CLIENT PORTAL (VERCEL)
=====================================================================

This folder is a complete, ready-to-deploy private portal.
Everything is in English. The client version hides the editing studio;
the editable master file is kept separately by NVI.

MAIN FILES
----------
- index.html .......... private black & gold access page (NVI logo + access key)
- rapport.html ........ the personalised report: 5 sections, 10 sequences, appendix
- middleware.js ....... verifies the session before any access to the report
- api/login.js, api/logout.js, lib/session.js ... server-side authentication
- vercel.json, package.json ... deployment configuration
- robots.txt, favicon.svg

HOW IT WORKS
------------
The access key is NEVER written in the files. It lives only in two Vercel
Environment Variables that you set at deploy time:
  PORTAL_PASSWORD .......... the client access key (12+ characters)
  PORTAL_SESSION_SECRET .... a strong random secret (32+ characters)
A visitor opens the site, accepts the confidentiality checkbox, enters the key,
and only then can reach /rapport.html. Direct access to /rapport.html without a
valid session is redirected back to the access page. Sessions expire after 12h.

DEPLOY — GITHUB + VERCEL (no terminal)
--------------------------------------
1) On GitHub, create a NEW private repository, e.g. "nvi-phuket-private".
2) Add file -> Upload files -> drag ALL the files AND folders from this folder
   (keep the api/ and lib/ folders intact) -> Commit changes.
3) On vercel.com -> Add New -> Project -> import that repository -> Deploy.
4) In the Vercel project: Settings -> Environment Variables (Production), add:
     PORTAL_PASSWORD          = (the client access key given to you by NVI)
     PORTAL_SESSION_SECRET    = (the random secret given to you by NVI)
5) Redeploy: Deployments -> Redeploy (Production), without cache.
6) Test in a private browser window:
   - the root URL shows the black NVI access page
   - a wrong key is refused
   - the correct key + confidentiality checkbox opens the report
   - /rapport.html without a session redirects to the access page

DEPLOY — VERCEL CLI (alternative)
---------------------------------
  npx vercel login
  npx vercel           (create the project)
  (set the two env vars in the Vercel dashboard)
  npx vercel --prod

NOTES
-----
- Never put the key or the secret in the files, in an email or in the HTML.
- Changing PORTAL_PASSWORD then redeploying changes the client key.
- Changing PORTAL_SESSION_SECRET logs out all previous sessions.
- Vercel Hobby is for non-commercial use; a commercial deployment needs a paid plan.
- The report is presented as anonymised and does not concern this establishment.

Produced by NVI.
