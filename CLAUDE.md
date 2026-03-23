# TempoRead

RSVP speed reading web app for university students. Built with Next.js 16, Supabase, Tailwind v4. Deployed on Vercel.

**Owner:** Idir (Perth, Australia)
**Live:** speedread-five.vercel.app (legacy URL)

## Brand — ZERO TOLERANCE

Brand is **TempoRead**. Never use "FlashRead", "SpeedRead", "Requiem", `sr-prefs`, `rq-prefs`, or `fr-prefs`.
- localStorage prefix: `tr-prefs`
- Logo: "Tempo" (font-light) + "Read" (accent color, font-semibold)

## Routing — READ CAREFULLY

```
src/app/page.js                    → LANDING PAGE at /
src/app/app/page.js                → MAIN APP at /app    → 90% of dev happens here
src/app/app/loading.js             → Loading skeleton for /app
src/app/api/extract-pdf/route.js   → PDF extraction endpoint
src/app/api/extract-url/route.js   → URL article extraction endpoint
src/app/layout.js                  → Root layout
src/lib/supabase-client.js         → Browser Supabase client (SSR, use this)
```

The app page import path is `../../lib/supabase-client` (two levels up from `src/app/app/`).
The landing page does NOT use Supabase.

## Tech Stack

- Next.js 16.1.3 (App Router, React 19, React Compiler via `reactCompiler: true`)
- Tailwind CSS v4 + inline styles for theme colors
- Supabase (`@supabase/ssr` + `@supabase/supabase-js`) for auth + data
- `pdf-parse-new` for PDF parsing (SERVER-SIDE ONLY — never use unpdf, pdf-poppler, react-pdf, or client-side PDF.js)
- `mammoth` for DOCX parsing (client-side, works reliably)
- `@extractus/article-extractor` for URL import (server-side)
- Geist font + Google Fonts per theme + OpenDyslexic CDN

## Commands

```bash
npm run dev              # Start dev server
npm run build            # Production build
rm -rf .next && npm run dev   # Clear build cache (first thing to try when things break)
pkill -f "next dev"      # Kill stale dev servers
git add . && git commit -m "msg" && git push   # Deploy (Vercel auto-deploys on push)
git commit --allow-empty -m "trigger rebuild" && git push  # Force Vercel redeploy
```

## Code Conventions

- All pages use `'use client'` directive
- State: useState/useEffect/useCallback/useRef (no external state library)
- Tailwind utilities + inline styles for dynamic theme colors
- Card style: `bg-slate-900/50 backdrop-blur-sm border border-slate-800/50 rounded-2xl`
- Buttons: gradient with theme accent colors, rounded-xl
- Custom pointer-event sliders (NEVER use HTML range inputs — they have snap/jerk issues)
- Toast notifications (NEVER `alert()`)
- Confirm modals for destructive actions (NEVER `confirm()`)
- ORP focal letter: `useLayoutEffect` + `getBoundingClientRect` for pixel-perfect centering

## Code Delivery Rules

- ALWAYS provide complete files — partial snippets cause integration bugs
- If new packages: include `npm install` command
- If schema changes: provide full SQL for Supabase SQL Editor

## Pricing

- **Free:** $0 — paste text, TXT upload, RSVP reader, 5,000 word limit, keyboard shortcuts, comprehension recall
- **Pro:** $5 AUD/month or $35 AUD/year — PDF/DOCX, URL import, unlimited, cloud library, analytics, themes
- **Pro+:** $10 AUD/month or $69 AUD/year — AI features (NOT built yet, NOT on landing page)

## Current State

Stripe integration not yet built. Legacy packages and orphaned files cleaned up.
`app/page.js` uses `tr-prefs` localStorage key.
