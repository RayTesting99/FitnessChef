const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-lite'; // cheap, fast, good enough for this task

// Render sits behind a proxy; trust it so req.ip is the real client IP.
app.set('trust proxy', 1);

const APP_KEY = process.env.APP_KEY; // optional: when set, /estimate requires a matching x-app-key header
const RATE_LIMIT = 20; // requests per window per IP
const RATE_WINDOW_MS = 60 * 1000;
const MAX_FOOD_CHARS = 300;
const MAX_GRAMS = 5000;

const hits = new Map(); // ip -> { count, resetAt }
setInterval(() => {
  const now = Date.now();
  for (const [ip, h] of hits) if (h.resetAt <= now) hits.delete(ip);
}, RATE_WINDOW_MS).unref();

function rateLimit(req, res, next) {
  const now = Date.now();
  let h = hits.get(req.ip);
  if (!h || h.resetAt <= now) {
    h = { count: 0, resetAt: now + RATE_WINDOW_MS };
    hits.set(req.ip, h);
  }
  h.count++;
  if (h.count > RATE_LIMIT) {
    res.set('Retry-After', String(Math.ceil((h.resetAt - now) / 1000)));
    return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  }
  next();
}

function checkAppKey(req, res, next) {
  if (!APP_KEY) return next();
  const given = Buffer.from(String(req.get('x-app-key') || ''));
  const expected = Buffer.from(APP_KEY);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'Invalid or missing x-app-key.' });
  }
  next();
}

app.post('/estimate', rateLimit, checkAppKey, async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY env var.' });
  }
  const body = req.body || {};
  const food = typeof body.food === 'string' ? body.food.trim() : '';
  if (!food) {
    return res.status(400).json({ error: 'Missing "food" in request body.' });
  }
  if (food.length > MAX_FOOD_CHARS) {
    return res.status(400).json({ error: '"food" must be at most ' + MAX_FOOD_CHARS + ' characters.' });
  }
  // grams is optional; may be a number or a numeric string (index.html sends a string, possibly empty).
  let grams;
  const rawGrams = body.grams;
  if (rawGrams !== undefined && rawGrams !== null && String(rawGrams).trim() !== '') {
    if (typeof rawGrams !== 'number' && typeof rawGrams !== 'string') {
      return res.status(400).json({ error: '"grams" must be a number.' });
    }
    grams = Number(String(rawGrams).trim());
    if (!Number.isFinite(grams) || grams < 0 || grams > MAX_GRAMS) {
      return res.status(400).json({ error: '"grams" must be a number between 0 and ' + MAX_GRAMS + '.' });
    }
  }

  const userMsg = 'Food: ' + food + (grams ? '\nPortion context: this specific serving is ' + grams + 'g total (use only as context for cut/style; answer must still be normalized PER 100 GRAMS).' : '');
  const systemInstruction = 'You are a nutrition estimation engine. Given a food description (which may include details like fat percentage, cut, cooking method, or brand) and optional portion context, estimate its typical nutrition PER 100 GRAMS as cooked/prepared unless the description implies raw. Take described details seriously (e.g. "lean, ~10% fat") and adjust accordingly. Treat the description as the whole dish and let every stated detail move the numbers in the right direction: (1) Sauces, marinades, glazes, dressings, toppings, cheese and spreads that are mentioned add their carbs, sugar, fat and calories; ones described as "no", "without", "plain" or "dry" are excluded. (2) Skin-on, untrimmed or visible fat, and fatty cuts raise fat and calories; skinless, trimmed, lean, fat-free or "fat cap removed" lower them; apply stated fat percentages literally. (3) Cooking fat counts: fried, pan-fried, sauteed, buttered or oiled food includes absorbed oil or butter; grilled, baked, steamed, boiled, poached or air-fried does not add much. (4) Breaded, battered, crumbed or crispy food includes the coating and its absorbed oil. (5) Raw versus cooked changes density: cooked meat is more concentrated per 100 g than raw; drained, rinsed or boiled-and-drained foods have less fat or liquid than undrained. (6) Whole-dish items like rice, pasta, bread, potatoes, beans and vegetables are included when named; use realistic proportions when no amounts are given. (7) Sugar-free, diet, light, low-fat, whole-milk or full-fat labels apply to the named item. If something is not specified, assume the most common plain preparation for that food and no added sauce. Calories should be roughly consistent with the macros (about 4 kcal per g of protein or carbs, 9 per g of fat). Respond with ONLY a JSON object, no prose, no markdown fences: {"cal100": number, "protein100": number, "carbs100": number, "fat100": number}. Round to 1 decimal place.';

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: userMsg }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API error' });
    }

    const text = data.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Estimate failed: ' + err.message });
  }
});

app.get('/', (req, res) => res.send('Macro estimate backend (Gemini) is running.'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
