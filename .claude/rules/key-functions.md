# TempoRead Key Functions (src/app/app/page.js)

| Function | Purpose |
|----------|---------|
| `calculateORP(word)` | Returns focal letter index (~30–40% into word) |
| `parseText(text)` | Splits input into word array |
| `handleFileUpload(e)` | Routes PDF/DOCX/TXT to appropriate parser |
| `startReading()` | Parses text, enters reader view |
| `togglePlay()` | Play/pause RSVP playback |
| `renderWord(word)` | Returns JSX with ORP-highlighted word |
| `handleAuth(e)` | Sign up / sign in via Supabase |
| `saveDocument()` | Upsert document to Supabase |
| `loadDocument(doc)` | Load from library |
| `deleteDocument(docId)` | Remove from Supabase |

## Key Technical Decisions

- **ORP centering:** useLayoutEffect + getBoundingClientRect measures actual rendered position, applies pixel correction before paint. Applied to: main reader, landing page demo.
- **ThemePanel:** Defined inline in `app/page.js` as a local component — NOT imported from `theme-settings.jsx`. THEMES and FONTS objects are also defined inline in `app/page.js`.
- **Custom sliders:** Pointer-event based. Calculates position from coordinates, snaps values in real-time. Slider owns its label rendering for live updates during drag.
- **PDF parsing:** Server-side only via pdf-parse-new. Client-side PDF.js failed across browsers.
- **Freemium check:** `isPro` boolean on profiles table. Gate checks happen client-side after Supabase auth.
- **Analytics charts:** 7-day activity bar chart + cumulative words over time SVG line chart (last 10 sessions). Both rendered inside `AnalyticsDashboard` component in app/page.js.
