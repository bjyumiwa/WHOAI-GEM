// /api/talk.js  ← <script>タグは不要。Node側のコードです
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method === 'GET') return res.status(200).json({ ok: true, endpoint: '/api/talk', expect: 'POST' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OPENAI_API_KEY is not set' });
    }

    // 受信
    let body = req.body ?? {};
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }

    const model = body.model || 'gpt-4o-mini';
    const temperature = typeof body.temperature === 'number' ? body.temperature : 0.7;
    const max_tokens = typeof body.max_tokens === 'number' ? body.max_tokens : 220;

    // メッセージ化
    const systemPrompt = 'あなたは親しみやすいキャラクターです。短く優しく返答してください。';
    let messages;
    if (body.userMessage) {
      const hist = Array.isArray(body.history) ? body.history : [];
      messages = [
        { role: 'system', content: systemPrompt },
        ...hist.map(h => ({ role: (h.role === 'assistant' || h.role === 'system') ? h.role : 'user', content: String(h.content ?? '') })),
        { role: 'user', content: String(body.userMessage ?? '') }
      ];
    } else if (Array.isArray(body.messages) && body.messages.length) {
      messages = body.messages.map(m => ({ role: (m.role === 'assistant' || m.role === 'system') ? m.role : 'user', content: String(m.content ?? '') }));
    } else {
      return res.status(400).json({ error: 'No input' });
    }

    // OpenAI
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({ model, messages, temperature, max_tokens })
    });

    const text = await r.text();
    if (!r.ok) return res.status(502).json({ error: 'OpenAI error', status: r.status, detail: text });

    let data; try { data = JSON.parse(text); } catch { return res.status(502).json({ error: 'Bad JSON from OpenAI', raw: text }); }
    const reply = data?.choices?.[0]?.message?.content?.trim() ?? '';
    return res.status(200).json({ reply, model });
  } catch (e) {
    console.error('[talk.js]', e);
    return res.status(500).json({ error: 'Server error', detail: String(e) });
  }
}
