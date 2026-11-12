# FitnessChef

A macro-tracking mobile app. Log what you eat, track calories, protein, carbs and fat against your daily targets, and build a logging streak. Built with React Native + Expo.

## Features

- **Log meals three ways**
  - Search USDA FoodData Central (real, published nutrition data)
  - Enter nutrition manually (per serving, like a label, or per 100 g)
  - **Estimate with AI**: describe a meal in plain text (for example "200g chicken breast and rice") and get an estimated per-100g breakdown. These are estimates, not measurements.
- **Daily targets** you can edit, with progress bars for calories, protein, carbs and fat
- **History** with today shown separately, a 7-day calorie chart, and edit/delete for any entry
- **Streak and XP** based on days you log
- Everything is stored on the device. There are no accounts.

## Repository layout

| Path | What it is |
|---|---|
| `mobile/` | The Expo (React Native, TypeScript) app |
| `server.js` | Express backend that proxies text estimates to Google Gemini |
| `index.html` | The original single-file web prototype |
| `CLAUDE.md` | Project notes and conventions |

## Run the app

Requires Node 18+ and the Expo Go app on your phone (same Wi-Fi as your computer).

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go. Use `npx expo start --clear` after changing `.env`.

Optional settings go in `mobile/.env` (see `mobile/.env.example`):

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_USDA_API_KEY` | Your own free [api.data.gov](https://fdc.nal.usda.gov/api-key-signup) key. Falls back to the heavily rate-limited `DEMO_KEY`. |
| `EXPO_PUBLIC_API_URL` | Backend URL. Defaults to the hosted backend. |
| `EXPO_PUBLIC_APP_KEY` | Must match the backend's `APP_KEY` if you set one. |

Note that `EXPO_PUBLIC_*` values are bundled into the app, so never put a secret there that you need to keep private.

## Run the backend

```bash
npm install
GEMINI_API_KEY=your-key npm start
```

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Required. Google Gemini API key (server-side only). |
| `APP_KEY` | Optional. If set, `POST /estimate` requires a matching `x-app-key` header. |
| `PORT` | Optional. Defaults to 3000. |

`POST /estimate` takes `{ "food": string, "grams"?: number }` and returns macros per 100 g. It is rate limited to 20 requests per minute per IP and validates its input. On Render's free tier the first request after idle can take up to a minute.

## Status

The free core is working. Monetization (for example AI photo analysis) is still undecided, and there are no user accounts yet, so the optional `APP_KEY` is only a deterrent against casual abuse, not real authentication.
