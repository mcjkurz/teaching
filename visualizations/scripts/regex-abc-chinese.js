// Regex ABCs for Chinese: five interactive lessons.
// Each lesson has sample lines, a reference regex (used to compute the expected
// matches) and a checking mode:
//   'exact' - the learner's matches must equal the expected matches exactly
//   'mask'  - the learner must cover exactly the same characters (grouping is free)

const LESSONS = [
    {
        title: '1. Literal characters',
        explain: `
            <p>The simplest regex is just the text you are looking for. Chinese characters
            are ordinary characters: no escaping, no special syntax.</p>
            <p>The pattern <code>賈</code> matches every 賈 in the text.</p>`,
        task: 'Match every occurrence of the surname <b>賈</b>.',
        lines: [
            '賈寶玉、林黛玉、薛寶釵',
            '賈母、王熙鳳、賈政',
            '史湘雲、賈迎春、妙玉',
        ],
        reference: '賈',
        mode: 'exact',
        hint: 'Just type the character itself.',
        solution: '賈',
    },
    {
        title: '2. The CJK range',
        explain: `
            <p>You can not write "any Chinese character" character by character, so we use a
            <b>character class</b> with a <b>range</b>: <code>[\\u4e00-\\u9fff]</code>.
            <code>\\u4e00</code> is the first common CJK character (一) and <code>\\u9fff</code>
            the last one; everything in between is matched.</p>
            <p>Add <code>+</code> to mean "one or more in a row", so a whole run of Chinese is a single match.</p>`,
        task: 'Match every <b>run of Chinese characters</b>, but leave out the numbers, Latin letters and punctuation.',
        lines: [
            '紅樓夢 Hong Lou Meng, 1791',
            '第1回：甄士隱夢幻識通靈',
            '曹雪芹 (c. 1715–1763) 著',
        ],
        reference: '[\\u4e00-\\u9fff]+',
        mode: 'exact',
        hint: 'Put the range inside square brackets and add + after them.',
        solution: '[\\u4e00-\\u9fff]+',
    },
    {
        title: '3. How many characters? { }',
        explain: `
            <p>Chinese has no spaces between words, so patterns often say <em>how many</em> characters
            may follow. Quantifiers do that:</p>
            <p><code>?</code> zero or one &nbsp; <code>+</code> one or more &nbsp;
            <code>{2}</code> exactly two &nbsp; <code>{1,2}</code> one or two</p>
            <p>Chinese given names are usually one or two characters, so a surname plus a given name is
            <code>張[\\u4e00-\\u9fff]{1,2}</code>.</p>`,
        task: 'Match every person with the surname <b>張</b> followed by a one- or two-character given name. Do not match the "、" or the other people.',
        lines: [
            '張道士、張華、張金哥',
            '王熙鳳、張友士、張材',
            '賈璉、張若錦、薛蟠',
        ],
        reference: '張[\\u4e00-\\u9fff]{1,2}',
        mode: 'exact',
        hint: 'Surname, then the CJK range, then {1,2}. Careful: the dot . would also match "、".',
        solution: '張[\\u4e00-\\u9fff]{1,2}',
    },
    {
        title: '4. Choosing characters: [ ] and |',
        explain: `
            <p>Square brackets also work with a list of characters. <code>[林薛]</code> matches
            either 林 or 薛, and <code>[一二三四五六七八九十百]</code> matches one Chinese numeral.
            (Ranges like <code>\\u4e00-\\u9fff</code> are not useful for numerals because they are scattered in the code chart.)</p>
            <p>For longer alternatives use <code>|</code>: <code>(黛玉|寶釵)</code>.</p>`,
        task: 'Match the chapter numbers such as <b>第一回</b>, <b>第十二回</b>, <b>第一百二十回</b>.',
        lines: [
            '第一回 甄士隱夢幻識通靈',
            '第十二回 王熙鳳毒設相思局',
            '第二十三回 西廂記妙詞通戲語',
            '第一百二十回 甄士隱詳說太虛情',
        ],
        reference: '第[一二三四五六七八九十百]+回',
        mode: 'exact',
        hint: '第, then a class of numerals with +, then 回.',
        solution: '第[一二三四五六七八九十百]+回',
    },
    {
        title: '5. Everything except Chinese: [^ ]',
        explain: `
            <p>A caret right after the opening bracket <b>negates</b> the class:
            <code>[^\\u4e00-\\u9fff]</code> matches any single character that is <em>not</em> a
            common CJK character. This is the classic way to find punctuation, spaces, digits and
            Latin letters in Chinese text (for example, to strip them before counting words).</p>
            <p>Note that Chinese punctuation such as 「，。！」 lives outside of the 4E00–9FFF range.</p>`,
        task: 'Match every character that is <b>not</b> a Chinese character: punctuation, spaces, digits and letters.',
        lines: [
            '滿紙荒唐言，一把辛酸淚！',
            '都云作者癡，誰解其中味？',
            '《石頭記》 (1791), ch. 1',
        ],
        reference: '[^\\u4e00-\\u9fff]',
        mode: 'mask',
        hint: 'Same range as before, but put ^ right after the [.',
        solution: '[^\\u4e00-\\u9fff]+',
    },
];

// ---------------------------------------------------------------------------

const state = { current: 0, solved: LESSONS.map(() => false) };

const $ = id => document.getElementById(id);

function buildRegex(source) {
    if (source === '') return { re: null, error: null };
    try {
        return { re: new RegExp(source, 'gu'), error: null };
    } catch (e1) {
        try {
            // Fall back to non-unicode mode (allows sloppy escapes like \-)
            return { re: new RegExp(source, 'g'), error: null };
        } catch (e2) {
            return { re: null, error: e2.message };
        }
    }
}

// Returns [start, end) pairs of all non-empty matches.
function findMatches(re, text) {
    const out = [];
    if (!re) return out;
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        if (m[0] === '') { re.lastIndex++; continue; }
        out.push([m.index, m.index + m[0].length]);
    }
    return out;
}

function toMask(matches, length) {
    const mask = new Array(length).fill(false);
    matches.forEach(([s, e]) => { for (let i = s; i < e; i++) mask[i] = true; });
    return mask.join(',');
}

function sameMatches(mode, a, b, length) {
    if (mode === 'mask') return toMask(a, length) === toMask(b, length);
    return JSON.stringify(a) === JSON.stringify(b);
}

function highlight(text, matches) {
    let html = '';
    let pos = 0;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    matches.forEach(([s, e]) => {
        html += esc(text.slice(pos, s)) + '<mark>' + esc(text.slice(s, e)) + '</mark>';
        pos = e;
    });
    return html + esc(text.slice(pos));
}

function renderSteps() {
    $('steps').innerHTML = LESSONS.map((l, i) => {
        const cls = ['step'];
        if (i === state.current) cls.push('active');
        if (state.solved[i]) cls.push('done');
        return `<button class="${cls.join(' ')}" data-i="${i}">${state.solved[i] ? '✓' : i + 1}</button>`;
    }).join('');
}

function loadLesson(i) {
    state.current = i;
    const l = LESSONS[i];
    $('lessonTitle').textContent = l.title;
    $('lessonExplain').innerHTML = l.explain;
    $('task').innerHTML = '<span class="task-label">Task</span> ' + l.task;
    $('regexInput').value = '';
    $('hint').hidden = true;
    $('hint').textContent = l.hint;
    $('prevBtn').disabled = i === 0;
    $('nextBtn').disabled = i === LESSONS.length - 1;
    renderSteps();
    update();
    $('regexInput').focus();
}

function update() {
    const l = LESSONS[state.current];
    const { re, error } = buildRegex($('regexInput').value);
    const refRe = new RegExp(l.reference, 'gu');

    let allCorrect = true;
    $('samples').innerHTML = l.lines.map(text => {
        const got = findMatches(re, text);
        const want = findMatches(refRe, text);
        const ok = sameMatches(l.mode, got, want, text.length);
        if (!ok) allCorrect = false;
        return `<div class="sample ${ok ? 'ok' : 'bad'}">
            <span class="badge">${ok ? '✓' : '✗'}</span>
            <span class="text">${highlight(text, got)}</span>
            <span class="count">${got.length} match${got.length === 1 ? '' : 'es'}</span>
        </div>`;
    }).join('');

    const status = $('status');
    if (error) {
        status.className = 'status error';
        status.textContent = 'Invalid regex: ' + error;
    } else if (allCorrect && $('regexInput').value !== '') {
        status.className = 'status success';
        status.textContent = 'Correct! All lines match as expected.';
        state.solved[state.current] = true;
        renderSteps();
    } else {
        status.className = 'status';
        status.textContent = 'Highlighted text is what your regex currently matches. Make every line ✓.';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    $('regexInput').addEventListener('input', update);
    $('steps').addEventListener('click', e => {
        const b = e.target.closest('.step');
        if (b) loadLesson(+b.dataset.i);
    });
    $('prevBtn').addEventListener('click', () => loadLesson(state.current - 1));
    $('nextBtn').addEventListener('click', () => loadLesson(state.current + 1));
    $('hintBtn').addEventListener('click', () => { $('hint').hidden = false; });
    $('solutionBtn').addEventListener('click', () => {
        $('regexInput').value = LESSONS[state.current].solution;
        update();
    });
    loadLesson(0);
});
