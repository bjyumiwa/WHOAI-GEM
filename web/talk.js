// /web/talk.js  ← タグなしの“純JS”。HTMLから <script src="./web/talk.js"> で読み込み
(function(){
  // 同一ドメインでAPIが動くならこれでOK。
  // 静的サイトから別ドメインAPIを呼ぶときは 'https://your-app.vercel.app' のように書く。
  const PROD_API_BASE = '';
  const API_BASE = (location.hostname === 'localhost')
    ? 'http://localhost:3000'   // vercel dev を使う場合
    : (PROD_API_BASE || '');
  const ENDPOINT = API_BASE + '/api/talk';

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
    try{
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('bad status '+res.status);
      const data = await res.json();
      return { reply: data?.reply || '' };
    }catch(e){
      const s = payload.state || {};
      return { reply: `（モック）${text}。きょう集めた貝は ${s.totalCollected ?? 0} 個だよ。` };
    }
  }

  window.WHOAI_TALK = { talk };
})();
