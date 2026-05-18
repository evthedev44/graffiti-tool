export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { base64, mediaType } = req.body;

  if (!base64 || !mediaType) {
    return res.status(400).json({ error: 'Missing image data' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: 'text',
                text: `You are a financial analyst. Analyze this P&L statement and provide:

1. SUMMARY — Key revenue, expense, and profit figures you can identify
2. TOP-DOWN FORECAST — Project the next 12 months based on current trends. Show monthly or quarterly revenue, expenses, and net income estimates in a simple table format.
3. KEY INSIGHTS — 3-5 actionable observations about the business's financial health, growth trajectory, and areas of concern or opportunity.

Be specific with numbers. Format clearly with headers and tables where appropriate.`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Claude API error');
    }

    const result = data.content[0].text;
    return res.status(200).json({ result });

  } catch (err) {
    console.error('API error:', err);
    return res.status(500).json({ error: err.message });
  }
}