export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, sourceMedium, targetMedium, synopsis } = req.body;
  if (!title) return res.status(400).json({ error: 'Missing title' });

  const synopsisBlock = synopsis ? `\n\nHere is the synopsis:\n${synopsis.slice(0, 600)}` : '';

  const prompt = `You are a brilliant cultural critic who finds deep emotional connections between books and films.

A user loved this ${sourceMedium}: "${title}"${synopsisBlock}

Recommend exactly 5 ${targetMedium} that match its emotional texture — not just its genre.
Think about: the pacing, the atmosphere, the emotional register, the specific kind of longing or tension or joy it creates.

Return ONLY valid JSON with no markdown, no explanation outside the JSON.

Format exactly like this:
{
  "recommendations": [
    {
      "title": "Title Here",
      "author": "Author or Director name",
      "year": "2019",
      "type": "movie",
      "vibe_reason": "One evocative sentence explaining the emotional connection.",
      "synopsis": "Two sentences describing the story."
    }
  ]
}

Rules:
- type must be exactly "movie", "tv", or "book" (lowercase)
- vibe_reason must be specific and evocative — never say "similar themes" or "same genre"
- Include a mix of well-known and lesser-known titles
- Do not recommend the direct adaptation of the input work
- All 5 must be real existing works`;

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

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json(parsed);
  } catch (err) {
    console.error('Swap error:', err);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}