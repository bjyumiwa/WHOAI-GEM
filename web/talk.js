<!-- /who-vq/web/talk.js -->
<script>
(() => {
  // ← ここを自分の Vercel デプロイ URLに変更！
  const ENDPOINT = "https://your-vercel-app.vercel.app/api/talk";

  async function talk(userMessage, opts = {}) {
    const payload = {
      userMessage,
      personality: opts.personality || "元気",
      state: opts.state || {},
      // お好みで調整
      model: "gpt-4o-mini",
      temperature: 0.7,
      max_tokens: 220,
    };
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.reply || "…";
    } catch (e) {
      console.error("[WHOAI_TALK]", e);
      return "（接続できませんでした）";
    }
  }

  // 共有：簡易 i18n
  const I18N = {
    ja: {
      about:"研究について", start:"スタート", cont:"続きから", langNext:"EN",
      hero:"朝日の海へようこそ", toNight:"夜へ", accessory:"アクセサリー",
      collection:"コレクション", reset:"リセット",
      nightTitle:"また明日", nightPH:"夜空を見ながら、何を話そう？",
      send:"送信", close:"閉じる",
      sunriseToast:"朝日がきれいだね",
      beachGuide:"砂の中に貝があるよ。なでて探してね",
      nightGuide:"夜の海。話そうか？",
      chooseChar:"キャラを選んでね",
    },
    en: {
      about:"About this research", start:"Start", cont:"Continue", langNext:"中文",
      hero:"Welcome to the Sunrise Shore", toNight:"To Night", accessory:"Accessories",
      collection:"Collection", reset:"Reset",
      nightTitle:"See you tomorrow", nightPH:"What shall we talk about under the night sky?",
      send:"Send", close:"Close",
      sunriseToast:"Beautiful sunrise",
      beachGuide:"Shells hide in the sand. Swipe to find them.",
      nightGuide:"It's night by the sea. Shall we talk?",
      chooseChar:"Choose your character",
    },
    zh: {
      about:"关于研究", start:"开始", cont:"继续", langNext:"한국어",
      hero:"欢迎来到朝阳海岸", toNight:"进入夜晚", accessory:"饰品",
      collection:"收藏", reset:"重置",
      nightTitle:"明天见", nightPH:"在星空下我们聊些什么？", send:"发送", close:"关闭",
      sunriseToast:"美丽的朝阳",
      beachGuide:"贝壳藏在沙子里，滑动寻找它们。",
      nightGuide:"夜晚的海边，我们聊聊吧？",
      chooseChar:"选择角色",
    },
    ko: {
      about:"연구에 대하여", start:"시작", cont:"계속", langNext:"日本語",
      hero:"아침 해변에 오신 것을 환영합니다", toNight:"밤으로", accessory:"액세서리",
      collection:"컬렉션", reset:"리셋",
      nightTitle:"내일 또 봐요", nightPH:"밤하늘을 보며 무엇을 이야기할까요?", send:"보내기", close:"닫기",
      sunriseToast:"아름다운 아침 해",
      beachGuide:"조개는 모래 속에 숨어있어요. 쓸어보세요.",
      nightGuide:"밤바다입니다. 이야기해볼까요?",
      chooseChar:"캐릭터를 선택하세요",
    },
  };
  const LANG_ORDER = ["ja", "en", "zh", "ko"];
  const LANG_LABEL = { ja:"日本語", en:"EN", zh:"中文", ko:"한국어" };
  function getLang(){
    return localStorage.getItem("whoai.lang") || "ja";
  }
  function nextLangLabel(lang){
    const idx = LANG_ORDER.indexOf(lang);
    const next = LANG_ORDER[(idx+1)%LANG_ORDER.length];
    return LANG_LABEL[next];
  }
  function setLang(lang){
    localStorage.setItem("whoai.lang", lang);
    document.documentElement.setAttribute("lang", lang);
    return I18N[lang] || I18N.ja;
  }

  // 共有：ストレージ
  const store = {
    get:(k,d)=>{ try{ const v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch{ return d; } },
    set:(k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} },
    remove:(k)=>{ try{ localStorage.removeItem(k); }catch{} },
  };

  // 共有：お手軽UI
  function qs(sel, p=document){ return p.querySelector(sel); }
  function qsa(sel, p=document){ return Array.from(p.querySelectorAll(sel)); }

  // 公開
  window.WHOAI_TALK = { talk };
  window.I18N = I18N;
  window.getLang = getLang;
  window.setLang = setLang;
  window.nextLangLabel = nextLangLabel;
  window.store = store;
  window.$ = qs;
  window.$$ = qsa;
})();
</script>
