# FlashRead Features & Backlog

## Built & Working
- RSVP engine with ORP focal letter (configurable color, pixel-perfect via useLayoutEffect)
- Variable speed (100–1000 WPM) via custom pointer-event sliders, speed ramping
- Font size adjustment (XS–XXL), keyboard shortcuts (Space, arrows, R, brackets)
- PDF upload (server-side pdf-parse-new), DOCX (client mammoth), TXT, paste text, URL import (Pro)
- Supabase auth (email/password), document library, progress tracking, auto-save every 10s
- Freemium gating (free: paste + TXT + 5K words; Pro: PDF/DOCX/URL + unlimited + library)
- Reading analytics: session tracking, 4 stat cards (words read, time, avg WPM, streak), 7-day activity bar chart, cumulative words over time line chart
- Comprehension recall prompts at configurable intervals
- 6 color themes (Emerald default, Midnight, Parchment, Rosé, Ocean, Noir)
- 6+ fonts (System, Georgia, Literata, JetBrains Mono, Atkinson Hyperlegible, OpenDyslexic)
- Text context sidebar, toast system, confirm modals, onboarding banner
- Landing page with live RSVP demo, feature grid, pricing section

## Must Do Before Charging Users
1. Deploy Stripe integration (code exists, not deployed)
2. Connect flashread.com.au domain to Vercel
3. Set up support@flashread.com.au email forwarding
4. Build Terms of Service and Privacy Policy pages
5. ~~Fix theme localStorage key~~ — app/page.js already uses `fr-prefs`. Delete orphaned `src/app/components/theme-settings.jsx` (still uses old key, not imported anywhere)
6. Remove legacy packages from package.json (pdf-poppler, pdf2pic, react-pdf, unpdf)
7. Remove legacy `src/lib/supabase.js` (old non-SSR client, use `supabase-client.js`)

## Feature Backlog (Not Built)
- AI document tools (summarization, flashcards, key concepts) — Pro+ tier
- Camera scan OCR for textbook pages
- Chunk mode (2–3 word display for dense prose)
- Offline mode via service workers
- Spaced repetition (SM-2 algorithm)
- Social sharing cards
- Browser extension
