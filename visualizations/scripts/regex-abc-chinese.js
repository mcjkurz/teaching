// Regex ABCs for Chinese: ten interactive lessons on real text from 《紅樓夢》.
// Each lesson has sample lines (quoted from misc/紅樓夢.txt), a reference regex
// (used to compute the expected matches) and a checking mode:
//   'exact' - the learner's matches must equal the expected matches exactly
//   'mask'  - the learner must cover exactly the same characters (grouping is free)
// `after` is a note shown once the lesson is solved.

const T1 = '第一回　甄士隱夢幻識通靈　賈雨村風塵懷閨秀';
const T3 = '第三回　賈雨村夤緣復舊職　林黛玉拋父進京都';
const T5 = '第五回　遊幻境指迷十二釵　飲仙醪曲演紅樓夢';
const T6 = '第六回　賈寶玉初試雲雨情　劉姥姥一進榮國府';
const T8 = '第八回　比通靈金鶯微露意　探寶釵黛玉半含酸';
const T10 = '第十回　金寡婦貪利權受辱　張太醫論病細窮源';
const T12 = '第十二回　王熙鳳毒設相思局　賈天祥正照風月鑑';
const T14 = '第十四回　林如海捐館揚州城　賈寶玉路謁北靜王';
const T22 = '第二十二回　聽曲文寶玉悟禪機　製燈謎賈政悲讖語';
const T23 = '第二十三回　西廂記妙詞通戲語　牡丹亭艷曲警芳心';
const T120 = '第一百二十回　甄士隱詳說太虛情　賈雨村歸結紅樓夢';

const LESSONS = [
    {
        title: '1. Literal characters',
        explain: `
            <p>The simplest regex is just the text you are looking for. Chinese characters
            are ordinary characters: no escaping, no special syntax.</p>
            <p>For example, the pattern <code>林</code> would match every 林 in a text.</p>`,
        task: 'These are real chapter titles. Match every occurrence of the surname <b>賈</b>.',
        lines: [T1, T3, T6, T10],
        reference: '賈',
        mode: 'exact',
        hint: 'Just type the character itself.',
        solution: '賈',
    },
    {
        title: '2. Either or: |',
        explain: `
            <p>The pipe <code>|</code> means "or". Wrap the choices in parentheses to limit their reach:
            <code>(元春|迎春|探春|惜春)</code> matches the name of any of the four Jia sisters.</p>
            <p>Each alternative can be as long as you like, and you can list as many as you need.</p>`,
        task: 'Match the names <b>寶玉</b>, <b>黛玉</b> and <b>寶釵</b> wherever they appear in these chapter titles.',
        lines: [T3, T6, T8, T22],
        reference: '(寶玉|黛玉|寶釵)',
        mode: 'exact',
        hint: 'Three alternatives separated by |. Parentheses are optional here.',
        solution: '寶玉|黛玉|寶釵',
    },
    {
        title: '3. The CJK range',
        explain: `
            <p>You can not list every Chinese character by hand, so we use a <b>character class</b>
            with a <b>range</b>. In <code>[a-e]</code> the dash means "everything from a to e";
            <code>[0-9]</code> is any digit.</p>
            <p>The same works for Unicode code points, written as <code>\\uXXXX</code>. The common CJK block
            runs from <code>\\u4e00</code> (一) to <code>\\u9fff</code> (see the copy-paste box above).</p>
            <p>A quantifier after a class repeats it: <code>[0-9]+</code> is "one or more digits in a row".</p>`,
        task: 'These lines are from the top of the e-text. Match every <b>run of Chinese characters</b>, leaving out the brackets, punctuation and symbols.',
        lines: [
            '《紅樓夢》曹雪芹',
            '《二○一六年十月七日版》',
            '《好讀書櫃》經典版',
            '【紅樓夢引子】開闢鴻濛，誰為情種？',
        ],
        reference: '[\\u4e00-\\u9fff]+',
        mode: 'exact',
        hint: 'Put the range inside square brackets and add + after them.',
        solution: '[\\u4e00-\\u9fff]+',
        after: 'Look closely at the date line: it was cut into two pieces. The "○" in 二○一六 is not a Chinese character at all, it is the geometric circle U+25CB, which is only used as a zero. Real corpora are full of such surprises.',
    },
    {
        title: '4. Exactly or at least: {n} {n,}',
        explain: `
            <p>Curly braces say <em>how many</em> times to repeat the previous item.
            <code>[0-9]{4}</code> is exactly four digits (a year), <code>[a-z]{3,}</code> is a lowercase
            word of three letters <em>or more</em>.</p>
            <p>This is handy in Chinese, where there are no spaces between words but punctuation splits text
            into clauses of different length.</p>`,
        task: 'Find the <b>long clauses</b>: runs of <b>10 or more</b> consecutive Chinese characters.',
        lines: [
            '此開卷第一回也。作者自云：因曾歷過一番夢幻之後，故將真事隱去，而借「通靈」之說，撰此《石頭記》一書也。',
            '且說賈珍方要抽身進去，只見張道士站在旁邊陪笑說道：',
            '滿紙荒唐言，一把辛酸淚！',
        ],
        reference: '[\\u4e00-\\u9fff]{10,}',
        mode: 'exact',
        hint: 'The class from the previous lesson, followed by {10,}.',
        solution: '[\\u4e00-\\u9fff]{10,}',
    },
    {
        title: '5. Between n and m: {n,m} and ?',
        explain: `
            <p><code>{2,4}</code> means "two to four times". Two shortcuts are worth remembering:
            <code>?</code> means "optional" (zero or one) and <code>+</code> means "one or more".</p>
            <p>For example <code>colou?r</code> matches both "color" and "colour", and
            <code>[a-z]{2,4}</code> matches a lowercase word of two to four letters.</p>
            <p>Chinese given names are usually one or two characters long.</p>`,
        task: 'Match every person with the surname <b>張</b> together with a one- or two-character given name or title.',
        lines: [
            T10,
            '少不得家內治酒餞行。內有一個張德輝，年過六十',
            '且說賈珍方要抽身進去，只見張道士站在旁邊陪笑說道：',
            '那張道士又向賈珍道：',
        ],
        reference: '張[\\u4e00-\\u9fff]{1,2}',
        mode: 'exact',
        hint: 'Surname, then the CJK range, then {1,2}. Careful: the dot . would also match "，".',
        solution: '張[\\u4e00-\\u9fff]{1,2}',
    },
    {
        title: '6. A list of characters: [ ]',
        explain: `
            <p>Square brackets also work with a hand-written list of characters. <code>[甲乙丙]</code> matches
            one of those three, and <code>[abc]+</code> matches a run made only of a's, b's and c's.</p>
            <p>Ranges are not useful for numerals like 一二三, since their code points are scattered
            all over the code chart, so you spell them out.</p>`,
        task: 'Match the chapter numbers in the table of contents: <b>第一回</b>, <b>第十二回</b>, <b>第一百二十回</b>…',
        lines: [T1, T12, T23, T120],
        reference: '第[一二三四五六七八九十百]+回',
        mode: 'exact',
        hint: '第, then a class of numerals with +, then 回.',
        solution: '第[一二三四五六七八九十百]+回',
    },
    {
        title: '7. Everything except…: [^ ]',
        explain: `
            <p>A caret right after the opening bracket <b>negates</b> the class:
            <code>[^0-9]</code> matches any single character that is <em>not</em> a digit.</p>
            <p>Together with a quantifier this extracts "everything up to a delimiter". In English text
            <code>"[^"]+"</code> matches a quoted phrase: the quote, then anything but a quote, then a quote.
            Chinese uses corner brackets 「 」 for direct speech.</p>`,
        task: 'Match every piece of <b>direct speech</b>, including the brackets 「 」. (Watch the nested 『 』.)',
        lines: [
            '士隱聽了，便迎上來道：「你滿口說些什麼？只聽見些『好』『了』『好』『了』。」那道人笑道：「你若果聽見『好』『了』二字，還算你明白。」',
            '薛蟠道：「我可要說了：女兒悲……」說了半日，不見說底下的。馮紫英笑道：「悲什麼？快說來。」',
            '滿紙荒唐言，一把辛酸淚！',
        ],
        reference: '「[^」]+」',
        mode: 'exact',
        hint: 'Opening 「, then [^」] repeated with +, then the closing 」.',
        solution: '「[^」]+」',
    },
    {
        title: '8. Start of the line: ^',
        explain: `
            <p><code>^</code> outside of brackets is an <b>anchor</b>: it matches the start of the line and
            only matches there. <code>^[0-9]+</code> finds a number at the beginning of a line but ignores
            numbers elsewhere.</p>
            <p>Chinese e-texts usually indent each paragraph with two <b>ideographic spaces</b>
            (full-width spaces, U+3000, written <code>\\u3000</code>). They look like nothing, but they are there.</p>`,
        task: 'Match the <b>paragraph indentation</b> at the start of each line. The chapter title has full-width spaces too, but they are not indentation.',
        lines: [
            '　　此開卷第一回也。作者自云：因曾歷過一番夢幻之後',
            '　　假作真時真亦假，無為有處有還無。',
            T1,
        ],
        reference: '^\\u3000+',
        mode: 'exact',
        hint: 'An anchor, then \\u3000, then +.',
        solution: '^\\u3000+',
    },
    {
        title: '9. End of the line: $',
        explain: `
            <p><code>$</code> is the counterpart of <code>^</code>: it matches the end of the line.
            Combined with a negated class it grabs the <em>last field</em> of a line. For example,
            <code>[^,]+$</code> matches everything after the final comma of a CSV row.</p>`,
        task: 'Every chapter title is a couplet with two halves separated by a full-width space. Match only the <b>second half</b> (the 下聯).',
        lines: [T5, T14, T23, T120],
        reference: '[^\\u3000]+$',
        mode: 'exact',
        hint: 'Anything that is not \\u3000, repeated, then the end of the line.',
        solution: '[^\\u3000]+$',
    },
    {
        title: '10. Rare characters: \\p{Script=Han}',
        explain: `
            <p>The block 4E00–9FFF does not contain every Chinese character. Rarer ones, such as characters
            used only in personal names, live in <b>Extension A</b> (<code>\\u3400–\\u4dbf</code>) and in
            extensions B and beyond (above <code>\\uffff</code>).</p>
            <p>A <b>Unicode property</b> covers them all at once: <code>\\p{Script=Han}</code> matches any
            Han character, wherever it sits in the code chart. (Other examples: <code>\\p{Script=Greek}</code>,
            <code>\\p{Script=Hiragana}</code>.) It needs the Unicode flag, which this page has turned on for you.</p>`,
        task: 'Match every <b>賈</b> plus the <b>one character</b> that follows, in these lists of Jia family members. One of the names will not cooperate with the CJK range from lesson 3.',
        lines: [
            '賈政不慣於俗務，只憑賈赦、賈珍、賈璉、賴大、來升、林之孝',
            '賈㻞、賈珖、賈珩、賈瓔、賈菖、賈菱等各有執事',
        ],
        reference: '賈\\p{Script=Han}',
        mode: 'exact',
        hint: 'Replace the range by \\p{Script=Han}. Or widen the range to start at \\u3400.',
        solution: '賈\\p{Script=Han}',
        after: 'The odd one was 賈㻞 (U+3EDE, Extension A). With [\\u4e00-\\u9fff] you would silently lose it, a classic bug when processing names. If you are curious, this e-text also has characters from Extension B such as 𠳐 and 𤫫, which need more than 16 bits and only work with the u flag.',
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
    $('after').hidden = true;
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
    const after = $('after');
    after.hidden = true;
    if (error) {
        status.className = 'status error';
        status.textContent = 'Invalid regex: ' + error;
    } else if (allCorrect && $('regexInput').value !== '') {
        status.className = 'status success';
        status.textContent = 'Correct! All lines match as expected.';
        after.textContent = l.after || '';
        after.hidden = !l.after;
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
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.dataset.copy;
            const done = () => {
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, () => fallbackCopy(text, done));
            } else {
                fallbackCopy(text, done);
            }
        });
    });
    loadLesson(0);
});

function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
}
