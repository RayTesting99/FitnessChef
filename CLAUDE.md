# FitnessChef

FitnessChef is a macro-tracking mobile app built with **React Native + Expo**. Users log food and track calories, protein, carbs and fat against daily targets.

## Mission

Spread awareness of a healthy, balanced diet and support a lifestyle that never feels restricted, with tracking that is easy and reliable. Design consequences: targets are a guide, not a rulebook (avoid guilt-based wording); any rewards or games should reward consistent logging, never eating less; keep copy free of weight-loss framing; AI numbers are always labelled as estimates.

## Current repo state

The repo holds:

- `mobile/`: the Expo (React Native, TypeScript) app. Free-tier flow: Home (today's progress, streak, XP, editable daily targets), Log meal (USDA search, manual entry, and an "Estimate with AI" text description that calls the Gemini backend), History (Today shown separately from earlier days, a 7-day calorie chart, edit and delete entries). Local storage only (AsyncStorage). Run with `cd mobile && npx expo start` and scan the QR code in Expo Go. Theme lives in `mobile/src/theme.ts` (default palette plus a warm `kitchen` palette used on the Log screens). Cartoon artwork is hand-drawn SVG in `mobile/src/art/svgs.ts` (rendered with `react-native-svg`); per-screen decoration layouts are in `mobile/src/art/decor.ts`.
- `server.js`: the Express backend, deployed and live at **https://fitnesschef.onrender.com**. It proxies to Google Gemini (`gemini-3.1-flash-lite`) and needs the `GEMINI_API_KEY` env var.
- `package.json`: the backend's package (`npm start` → `node server.js`, Node >= 18).
- `index.html`: the original single-file web prototype ("Macro Tracker"). It stores the log, targets, backend URL and an optional app key in `localStorage` and calls `/estimate`, sending the key as `x-app-key` when one is set. Use it as a reference for UX and logic when building the Expo app.

## Backend API

- `GET /`: health check (plain text).
- `POST /estimate`: body `{ "food": string, "grams"?: number | string }` → `{ "cal100", "protein100", "carbs100", "fat100" }`. Values are **per 100 g**, so the client scales them by the portion size. Protections: per-IP rate limit (20 requests/minute, 429 with `Retry-After`), `food` max 300 characters, `grams` between 0 and 5000 (a numeric string is accepted because `index.html` sends one), and an optional `x-app-key` header checked against the `APP_KEY` env var (401 on mismatch; the check is skipped when `APP_KEY` is unset).

The backend currently handles **text descriptions only**. Photo and video analysis (the paid feature) needs new endpoints that send image or video parts to Gemini. Don't assume they exist yet.

Render free-tier instances sleep when idle, so the first request can take 30–60 s. The client should show a loading state and use a generous timeout.

## Food data sources: Gemini vs USDA

There are **two separate ways to get macros into a log entry**. They are not duplicates and not fallbacks for each other.

| | USDA FoodData Central | Gemini backend |
|---|---|---|
| Tier | Free | Paid |
| Input | User searches a food name, picks a result, enters grams | Photo or video of a meal (planned) |
| What it does | Looks up **real, published** nutrition data | **AI estimate** of macros |
| Where it runs | Directly from the app (dev), later via the backend | Only through the Render backend |
| Key | api.data.gov key (`EXPO_PUBLIC_USDA_API_KEY`, `DEMO_KEY` fallback) | `GEMINI_API_KEY`, server-side only |
| Status | Built in `mobile/src/lib/usda.ts` | Text endpoint exists; image/video does not |

**What the Gemini backend does today:** `POST /estimate` is **text-only**. It receives `{ food, grams? }` (a text description such as "lean ground beef, ~10% fat") and Gemini estimates macros per 100 g from that text. It never receives or analyzes an image or video. The `index.html` prototype uses it that way.

**What the Gemini backend will do for the paid tier:** new endpoints that accept a photo or video and send it to Gemini as image/video parts. These do not exist yet.

**Current app wiring:** Log meal offers USDA search, manual entry, and "Estimate with AI" (text description, via `mobile/src/lib/estimate.ts`). The estimate button calls `POST /estimate` with a 90 s timeout (Render cold starts) and sends `x-app-key` when `EXPO_PUBLIC_APP_KEY` is set. The key is bundled into the client, so it is a deterrent against casual abuse only, not real auth. `/estimate` still has no per-user auth or paywall, and the text estimate is currently available to everyone; which tier it belongs to is undecided. Add real per-user server-side gating before any paid feature depends on it. `index.html` has an optional App key field (next to the backend URL) and shows a specific message on 401 or 429, so it keeps working when `APP_KEY` is set as long as the same key is entered there.

Both sources produce the same result shape, macros **per 100 g**, so they feed into one shared log entry (`Entry` in `mobile/src/types.ts`).

## Product model: freemium

**Status:** monetization is under review. The priority is a solid, genuinely free core app first; whether and how to charge (and for what) is deferred until real people have used it. The tiers below are the working plan, not a commitment.

**Free tier**
- Manual food entry (name, grams, macros).
- Food search through the **USDA FoodData Central** API (https://fdc.nal.usda.gov/api-guide). It's free and needs an api.data.gov key. This is the sole free-tier search source and returns generic/average macros (e.g. "beef", "beef flank"), not brand-specific products. Search runs on submit (not per keystroke) and results are cached in memory to stay under the USDA rate limit.
- Daily targets, the daily log and history.

**Paid tier**
- AI macro analysis from a photo or video of a meal, through the Gemini backend.
- **Planned, not built yet:** brand-specific product search (e.g. Australian brands). It is not part of the free tier and is planned as a paid feature alongside the photo/video analysis. Data source and approach are undecided.
- The paywall must be enforced **server-side** on the AI endpoints, not only hidden in the UI.

## Gamification (v1: keep it simple)

- **Logging streak**: consecutive days with at least one logged entry. Compute it from the user's local calendar date.
- **Basic XP**: award a fixed amount of XP for logging actions (e.g. per entry, plus a bonus for hitting the day's targets). Use a simple level curve.
- **Out of scope for v1**: leaderboards, social features, badges and achievements systems, friends.

## Conventions

- Never ship API keys (Gemini, USDA) in the client bundle. Gemini stays behind the backend. USDA calls can go direct from the client during early dev, but should move behind the backend before release.
- Store macros per 100 g internally and scale by grams for display and totals. This matches the backend contract.
