/* Structured data deck: sections and a tiny syntax highlighter (loaded before deck.js). */
window.HOOKS = {};
window.SECTIONS = [
  { id: 'why',     zh: '從文字到記錄',   en: 'From text to records' },
  { id: 'tables',  zh: '表格',           en: 'Tables: CSV and TSV' },
  { id: 'json',    zh: 'JSON',           en: 'JSON' },
  { id: 'db',      zh: '數據庫與 SQL',   en: 'Databases and SQL' },
  { id: 'llm',     zh: '用模型抽取信息', en: 'Extraction with a language model' },
  { id: 'inclass', zh: '課堂練習',       en: 'In class' },
  { id: 'sum',     zh: '總結',           en: 'Summary' }
];

/* <pre class="code" data-lang="json|sql|py"> is coloured on load */
(function () {
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const span = (c, t) => `<span class="${c}">${esc(t)}</span>`;
  const RULES = {
    json: [/("(?:[^"\\]|\\.)*")(\s*:)|("(?:[^"\\]|\\.)*")|(-?\b\d+(?:\.\d+)?\b)|\b(null|true|false)\b/g,
      m => m[1] ? span('k', m[1]) + esc(m[2]) : m[3] ? span('s', m[3]) : m[4] ? span('n', m[4]) : span('x', m[5])],
    sql: [/(--.*$)|('(?:[^']|'')*')|\b(\d+)\b|\b(SELECT|FROM|WHERE|ORDER BY|GROUP BY|JOIN|ON|AS|AND|OR|DESC|ASC|COUNT|CREATE TABLE|INSERT INTO|VALUES|INTEGER|TEXT|PRIMARY KEY|REFERENCES|LIMIT)\b/gm,
      m => m[1] ? span('c', m[1]) : m[2] ? span('s', m[2]) : m[3] ? span('n', m[3]) : span('k', m[4])],
    py: [/(#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(\d+)\b|\b(import|from|def|return|for|in|with|as|if|else|True|False|None)\b/gm,
      m => m[1] ? span('c', m[1]) : m[2] ? span('s', m[2]) : m[3] ? span('n', m[3]) : span('x', m[4])]
  };
  document.querySelectorAll('pre.code[data-lang]').forEach(pre => {
    const rule = RULES[pre.dataset.lang];
    if (!rule) return;
    const [re, fn] = rule, src = pre.textContent;
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) {
      out += esc(src.slice(last, m.index)) + fn(m);
      last = re.lastIndex;
    }
    pre.innerHTML = out + esc(src.slice(last));
  });
})();
