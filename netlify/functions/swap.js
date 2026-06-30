// netlify/functions/swap.js
// This runs on Netlify's servers — your Claude API key stays secret here, never in the browser.

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { title, sourceMedium, targetMedium, synopsis } = body;

  if (!title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing title' }) };
  }

  const synopsisBlock = synopsis
    ? `\n\nHere is the synopsis:\n${synopsis.slice(0, 600)}`
    : '';

  const prompt = `You are a brilliant cultural critic who finds deep emotional connections between books and films.

A user loved this ${sourceMedium}: "${title}"${synopsisBlock}

Recommend exactly 5 ${targetMedium} that match its emotional texture — not just its genre.
Think about: the pacing, the atmosphere, the emotional register, the specific kind of longing or tension or joy it creates. Go beyond the obvious.

Return ONLY valid JSON with no markdown, no explanation, no text outside the JSON object.

Format exactly like this:
{
  "recommendations": [
    {
      "title": "Title Here",
      "author": "Author name or Director name",
      "year": "2019",
      "type": "movie",
      "vibe_reason": "One evocative sentence explaining the emotional connection — be specific and poetic, never generic.",
      "synopsis": "Two sentences describing the story."
    }
  ]
}

Rules:
- "type" must be exactly "movie", "tv", or "book" (always lowercase)
- "vibe_reason" must be specific — never say "similar themes" or "same genre". Describe the feeling.
- Include a mix of well-known and lesser-known titles
- All 5 recommendations must be real, existing works`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return { statusCode: 502, body: JSON.stringify({ error: 'Claude API failed' }) };
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Strip any accidental markdown code fences
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed  = JSON.parse(cleaned);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed),
    };

  } catch (err) {
    console.error('Swap function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get recommendations' }),
    };
  }
};