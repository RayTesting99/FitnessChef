const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-3.1-flash-lite'; // cheap, fast, good enough for this task

app.post('/estimate', async (req, res) => {
  if (!API_KEY) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY env var.' });
  }
  const { food, grams } = req.body || {};
  if (!food || typeof food !== 'string') {
    return res.status(400).json({ error: 'Missing "food" in request body.' });
  }

  const userMsg = 'Food: ' + food + (grams ? '\nPortion context: this specific serving is ' + grams + 'g total (use only as context for cut/style; answer must still be normalized PER 100 GRAMS).' : '');
  const systemInstruction = 'You are a nutrition estimation engine. Given a food description (which may include details like fat percentage, cut, cooking method, or brand) and optional portion context, estimate its typical nutrition PER 100 GRAMS as cooked/prepared unless the description implies raw. Take described details seriously (e.g. "lean, ~10% fat") and adjust accordingly. Respond with ONLY a JSON object, no prose, no markdown fences: {"cal100": number, "protein100": number, "carbs100": number, "fat100": number}. Round to 1 decimal place.';

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
