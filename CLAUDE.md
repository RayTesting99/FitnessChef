# FitnessChef

FitnessChef is a macro-tracking mobile app built with **React Native + Expo**. Users log food and track calories, protein, carbs and fat against daily targets.

## Current repo state

The repo holds:

- `mobile/`: the Expo (React Native, TypeScript) app. Free-tier flow only so far: Home, Log meal (USDA search), History, with a streak and XP. Local storage only (AsyncStorage). It does **not** call the Gemini backend yet. Run with `cd mobile && npx expo start` and scan the QR code in Expo Go. Theme lives in `mobile/src/theme.ts`.
- `server.js`: the Express backend, deployed and live at **https://fitnesschef.onrender.com**. It proxies to Google Gemini (`gemini-3.1-flash-lite`) and needs the `GEMINI_API_KEY` env var.
- `package.json`: the backend's package (`npm start` → `node server.js`, Node >= 18). Its `description` field still says "Anthropic API". That's stale; the backend uses Gemini.
- `index.html`: the original single-file web prototype ("Macro Tracker"). It stores the log, targets and backend URL in `localStorage` and calls `/estimate`. Use it as a reference for UX and logic when building the Expo app.

## Backend API

- `GET /`: health check (plain text).
- `POST /estimate`: body `{ "food": string, "grams"?: number }` → `{ "cal100", "protein100", "carbs100", "fat100" }`. Values are **per 100 g**, so the client scales them by the portion size.

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

**Current app wiring:** the `mobile/` app does **not** call the backend at all. Log meal uses USDA only. `/estimate` is currently used only by the old `index.html` prototype and is not a user-facing feature in the Expo app. Whether to expose the text estimate in the app (and under which tier) is undecided. Note `/estimate` has no auth or paywall, so anyone who knows the URL can spend the Gemini quota. Add server-side gating before the app uses it.

Both sources produce the same result shape, macros **per 100 g**, so they feed into one shared log entry (`Entry` in `mobile/src/types.ts`).

## Product model: freemium

**Free tier**
- Manual food entry (name, grams, macros).
- Food search through the **USDA FoodData Central** API (https://fdc.nal.usda.gov/api-guide). It's free and needs an api.data.gov key.
- Daily targets, the daily log and history.

**Paid tier**
- AI macro analysis from a photo or video of a meal, through the Gemini backend.
- The paywall must be enforced **server-side** on the AI endpoints, not only hidden in the UI.

## Gamification (v1: keep it simple)

- **Logging streak**: consecutive days with at least one logged entry. Compute it from the user's local calendar date.
- **Basic XP**: award a fixed amount of XP for logging actions (e.g. per entry, plus a bonus for hitting the day's targets). Use a simple level curve.
- **Out of scope for v1**: leaderboards, social features, badges and achievements systems, friends.

## Conventions

- Never ship API keys (Gemini, USDA) in the client bundle. Gemini stays behind the backend. USDA calls can go direct from the client during early dev, but should move behind the backend before release.
- Store macros per 100 g internally and scale by grams for display and totals. This matches the backend contract.
