<!-- /api/talk.js -->
<script>
(function () {
  const ENDPOINT = '/api/talk';

  async function talk(text, opts = {}) {
    const payload = {
      userMessage: String(text ?? ''),
      history: Array.isArray(opts.history) ? opts.history : [],
      personality: opts.personality || '',
      model: opts.model || 'gpt-4o-mini',
      temperature: typeof opts.temperature === 'number' ? opts.temperature : 0.7,
      max_tokens: typeof opts.max_tokens === 'number' ? opts.max_tokens : 220,
      state: opts.state || {}
    };

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('bad status ' + res.status);
      const data = await res.json();
      return { reply: data?.reply || '' };
    } catch (e) {
      // フォールバック（デモ用モック）
      const s = payload.state || {};
      const mock = `（モック）${text}。きょう集めた貝は ${s.totalCollected ?? 0} 個だよ。`;
      return { reply: mock };
    }
  }

  // グローバル公開
  window.WHOAI_TALK = { talk };
})();
</script>
