// Regex ABCs for Chinese: ten core lessons plus four extras on real and realistic text.
// Sources: 《紅樓夢》 (misc/紅樓夢.txt), 《明史》 (misc/明史.txt), a Tang poem, and a few
// invented lines in the style of contemporary (simplified) Chinese social media and news.
// Each lesson has sample lines, a reference regex (used to compute the expected
// matches) and a checking mode:
//   'exact' - the learner's matches must equal the expected matches exactly
//   'mask'  - the learner must cover exactly the same characters (grouping is free)
// `after` is a note shown once the lesson is solved.

// 《紅樓夢》 chapter titles
const T1 = '第一回\u3000甄士隱夢幻識通靈\u3000賈雨村風塵懷閨秀';
const T3 = '第三回\u3000賈雨村夤緣復舊職\u3000林黛玉拋父進京都';
const T5 = '第五回\u3000遊幻境指迷十二釵\u3000飲仙醪曲演紅樓夢';
const T6 = '第六回\u3000賈寶玉初試雲雨情\u3000劉姥姥一進榮國府';
const T10 = '第十回\u3000金寡婦貪利權受辱\u3000張太醫論病細窮源';
const T14 = '第十四回\u3000林如海捐館揚州城\u3000賈寶玉路謁北靜王';
const T23 = '第二十三回\u3000西廂記妙詞通戲語\u3000牡丹亭艷曲警芳心';
const T120 = '第一百二十回\u3000甄士隱詳說太虛情\u3000賈雨村歸結紅樓夢';

const LESSONS = [
    {
        title: '1. Literal characters',
        explain: `
            <p>The simplest regex is just the text you are looking for. Chinese characters
            are ordinary characters: no escaping, no special syntax.</p>
            <p>For example, the pattern <code>林</code> would match every 林 in a text.</p>`,
        task: 'These are chapter titles of 《紅樓夢》. Match every occurrence of the surname <b>賈</b>.',
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
            <p>Each alternative is a whole sequence, not a single character: <code>元春|迎春</code> means
            "元春 or 迎春". Parentheses are only needed when the choice sits inside a longer pattern:
            <code>賈(元|迎)春</code> is 賈元春 or 賈迎春, whereas <code>賈元|迎春</code> would mean
            "賈元 or 迎春".</p>`,
        task: 'These lines are from the 《明史》. Match the three reign titles <b>洪武</b>, <b>永樂</b> and <b>宣德</b>.',
        lines: [
            '洪武二十五年九月，立為皇太孫。',
            '洪武三年，封燕王。十三年，之藩北平。',
            '曾經永樂十八年調守北京者，各注其下曰「調北京」',
            '萬全都司宣德五年，分直隸及山西等處衛所添設。',
        ],
        reference: '(洪武|永樂|宣德)',
        mode: 'exact',
        hint: 'Three alternatives separated by |. Parentheses are optional here.',
        solution: '洪武|永樂|宣德',
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
        task: 'Match every <b>run of characters from the CJK block</b> 4E00–9FFF. Brackets, punctuation, digits, Latin letters and other symbols end a run.',
        lines: [
            '《紅樓夢》曹雪芹',
            '《史記·天官書》有客星之名，而不詳其形狀。',
            '本清朝作品在全世界都屬於公有領域，因為作者逝世已經超過100年。',
            '#今天也要加油# 周末去了趟深圳湾公园，风景真好！',
            '牀前明月光，疑是地上霜。',
        ],
        reference: '[\\u4e00-\\u9fff]+',
        mode: 'exact',
        hint: 'Put the range inside square brackets and add + after them.',
        solution: '[\\u4e00-\\u9fff]+',
        after: 'The block covers simplified and traditional characters alike, and old poems as well as hashtags. Digits, Latin letters, punctuation and symbols end a run.',
    },
    {
        title: '4. At least n: {n,}',
        explain: `
            <p>Curly braces say <em>how many</em> times to repeat the previous item.
            <code>[0-9]{4}</code> is exactly four digits (a year), <code>[a-z]{3,}</code> is a lowercase
            word of three letters <em>or more</em>.</p>
            <p>This is handy in Chinese, where there are no spaces between words but punctuation splits text
            into clauses of different length. Long clauses are often titles, formulas or quotations.</p>`,
        task: 'Find the <b>long clauses</b>: runs of <b>10 or more</b> consecutive Chinese characters.',
        lines: [
            '太祖開天行道肇紀立極大聖至神仁文義武俊德成功高皇帝，諱元璋，字國瑞，姓朱氏。',
            '且說賈珍方要抽身進去，只見張道士站在旁邊陪笑說道：',
            '这家餐馆的红烧肉真的太好吃了，下次还会再来！',
            '牀前明月光，疑是地上霜。',
        ],
        reference: '[\\u4e00-\\u9fff]{10,}',
        mode: 'exact',
        hint: 'The class from the previous lesson, followed by {10,}.',
        solution: '[\\u4e00-\\u9fff]{10,}',
        after: 'The very first match is the emperor Taizu\'s full posthumous title (太祖開天行道…高皇帝), 29 characters long, printed in the 《明史》 right before his name 諱元璋.',
    },
    {
        title: '5. Between n and m: {n,m}',
        explain: `
            <p><code>{2,4}</code> means "two to four times". Two shortcuts are worth remembering:
            <code>?</code> means "optional" (zero or one) and <code>+</code> means "one or more".</p>
            <p>For example <code>colou?r</code> matches both "color" and "colour", and
            <code>[a-z]{2,4}</code> matches a lowercase word of two to four letters.</p>
            <p>Chinese given names are usually one or two characters long.</p>`,
        task: 'Match every person with the surname <b>張</b> together with a one- or two-character given name. Lines from the 《明史》.',
        lines: [
            '侍郎桂萼、張璁，少詹事方獻夫署三法司',
            '遼東巡按御史劉臺以論張居正逮下獄，削籍。',
            '夫福壽力戰死之，蠻子海牙遁歸張士誠，康茂才降。',
            '米脂賊張獻忠聚眾應之。',
            '張溥《宋史紀事本末》一百九卷',
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
        task: 'These are the volume headings of the 《明史》. Match each <b>volume number</b> in full: 卷九, 卷十二, 卷一百, …',
        lines: ['卷九', '卷十二', '卷二十九', '卷一百'],
        reference: '卷[一二三四五六七八九十百]+',
        mode: 'exact',
        hint: '卷, then a class of numerals with +.',
        solution: '卷[一二三四五六七八九十百]+',
    },
    {
        title: '7. Everything except…: [^ ]',
        explain: `
            <p>A caret right after the opening bracket <b>negates</b> the class:
            <code>[^0-9]</code> matches any single character that is <em>not</em> a digit.</p>
            <p>Together with a quantifier this extracts "everything up to a delimiter". In English text
            <code>"[^"]+"</code> matches a quoted phrase: the quote, then anything but a quote, then a quote.
            Classical and traditional texts use corner brackets 「 」 for direct speech.</p>`,
        task: 'Match every piece of <b>direct speech</b>, including the brackets 「 」. (Watch the nested 『 』.)',
        lines: [
            '元將徹里不花憚不敢攻。乃曰：「得毋當舉大事乎？」卜之吉，大喜，遂以閏三月甲戌朔入濠見子興。',
            '太祖撫之曰：「而誠純孝，顧不念我乎。」洪武二十五年九月，立為皇太孫。',
            '士隱聽了，便迎上來道：「你滿口說些什麼？只聽見些『好』『了』『好』『了』。」那道人笑道：「你若果聽見『好』『了』二字，還算你明白。」',
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
        task: 'Match the <b>paragraph indentation</b> at the start of each line (from 《紅樓夢》). The chapter title has full-width spaces too, but they are not indentation.',
        lines: [
            '\u3000\u3000此開卷第一回也。作者自云：因曾歷過一番夢幻之後',
            '\u3000\u3000假作真時真亦假，無為有處有還無。',
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
        title: '10. Escaping and digits: \\[ \\d',
        explain: `
            <p>Some characters have a special meaning in regexes: <code>[ ] ( ) { } . * + ? ^ $ | \\</code>.
            To match one literally, put a backslash in front: <code>\\(</code> is a real opening parenthesis,
            <code>\\.</code> a real dot.</p>
            <p>The shortcut <code>\\d</code> means "a digit" (same as <code>[0-9]</code>), so
            <code>\\(\\d+\\)</code> matches things like (12).</p>`,
        task: 'E-texts converted from the web keep <b>footnote markers</b> like [2] in the running text. Match the markers only, not other numbers.',
        lines: [
            '太祖時年二十五[2]，謀避兵，卜於神，去留皆不吉。',
            '辟范祖幹、葉儀、許元等十三人，分直講經史[3]。',
            '二十一年春二月甲申，立鹽茶課。己亥，置寶源局[4]。',
            '截至2023年底，全国常住人口约14亿[7]，比2022年减少了85万。',
        ],
        reference: '\\[\\d+\\]',
        mode: 'exact',
        hint: 'Escaped bracket, \\d with +, escaped bracket. A plain [\\d+] is a character class and would match single digits.',
        solution: '\\[\\d+\\]',
        after: 'Handy for cleaning: replacing this pattern with nothing removes every footnote marker from the 《明史》 file, which has 188 of them.',
    },
    {
        title: '11. Extra: invisible characters',
        extra: true,
        explain: `
            <p>Not every character in a text is a visible one. Digitised texts often hide
            <b>zero-width spaces</b> (U+200B) and <b>private-use characters</b> (U+E000–U+F8FF): code points that
            have no standard meaning, used by editors as placeholders for rare characters missing in the font.</p>
            <p>You can put several things in one class. <code>[abc0-9]</code> matches a, b, c or a digit.</p>`,
        task: 'These lines from the 《明史》 contain characters you can not see, or that show up as boxes. Match every <b>zero-width space</b> and every <b>private-use character</b>. Where the match is invisible, a small tag will appear when you get it right.',
        lines: [
            '不祥之民，天將災\u200b\u200b之\u200b\u200b，陛下何誅焉！',
            '誠如陛下\u200b\u200b言。妾與陛下起貧賤',
            '獨辰及邵\ue16f、傅啟讓，帝素知其名',
            '【列傳第一百六十一左良玉〈（鄧\ue16f·賀人龍）〉·高傑〈（劉澤清）〉·祖寬】',
            '洪武元年春正月乙亥，祀天地於南郊，即皇帝位。',
        ],
        reference: '[\\u200b\\ue000-\\uf8ff]',
        mode: 'mask',
        hint: 'One class with two items: \\u200b, and the range \\ue000-\\uf8ff.',
        solution: '[\\u200b\\ue000-\\uf8ff]',
        after: 'Now you can see them: 災之 and 陛下言 look like ordinary words but contain up to four hidden characters, so a search for "災之" finds nothing and a word segmenter sees garbage. Checking the character classes of a corpus before analysis is a good habit.',
    },
    {
        title: '12. Extra: simplified vs traditional',
        extra: true,
        explain: `
            <p>Simplified and traditional forms of the same character are <b>different code points</b>:
            張 is U+5F35, but 张 is U+5F20. A regex for one will never match the other.</p>
            <p>When a corpus mixes both (a common situation with web text), list both variants in a class:
            <code>[鳥鸟]</code> matches 鳥 or 鸟.</p>`,
        task: 'Match every person with the surname <b>張 or 张</b> and a one- or two-character given name.',
        lines: [
            '遼東巡按御史劉臺以論張居正逮下獄，削籍。',
            '米脂賊張獻忠聚眾應之。',
            '会议名单：张伟、张丽、张军。',
        ],
        reference: '[張张][\\u4e00-\\u9fff]{1,2}',
        mode: 'exact',
        hint: 'Put both surnames in one class, then the same range and {1,2} as before.',
        solution: '[張张][\\u4e00-\\u9fff]{1,2}',
        after: 'With plain 張 the last line would have been missed entirely, without any error. Tools such as OpenCC convert between the two systems, but converting is not always one-to-one (e.g. 發 and 髮 are both 发 in simplified).',
    },
    {
        title: '13. Extra: full-width characters',
        extra: true,
        explain: `
            <p>Chinese typing often produces <b>full-width</b> forms of ASCII characters: ２０２４ instead of 2024,
            ＧＤＰ instead of GDP. They occupy the same width as a Chinese character, but they are different code points:
            <code>\\d</code> and <code>[0-9]</code> will <em>not</em> match ２０２４.</p>
            <p>The full-width block runs from <code>\\uff01</code> to <code>\\uff5e</code> and mirrors ASCII
            (which starts at 0x21). This block also holds the Chinese comma ，, the question mark ？ and the exclamation mark ！.</p>`,
        task: 'Match every <b>run of full-width characters</b>: letters, digits and signs. Notice which punctuation is caught as well.',
        lines: [
            '２０２４年第一季度ＧＤＰ同比增长５．３％',
            '价格：９９元，包邮！',
            '2024年第一季度GDP同比增长5.3%',
        ],
        reference: '[\\uff01-\\uff5e]+',
        mode: 'exact',
        hint: 'A class with a range from \\uff01 to \\uff5e, then +.',
        solution: '[\\uff01-\\uff5e]+',
        after: 'The last line is the half-width version: no match at all, although a human reads the same thing. Normalising full-width to half-width (Unicode NFKC) is a standard first step in cleaning Chinese text. Also note that ： ， ！ were matched: they are full-width forms of : , ! so they are not in the CJK range either.',
    },
    {
        title: '14. Extra: any Han character, \\p{Script=Han}',
        extra: true,
        explain: `
            <p>The block 4E00–9FFF does not contain every Chinese character. Rarer ones, such as characters
            used only in personal names, live in <b>Extension A</b> (<code>\\u3400–\\u4dbf</code>) and in
            extensions B and beyond (above <code>\\uffff</code>). The ideographic zero 〇 is in yet another block.</p>
            <p>A <b>Unicode property</b> covers them all at once: <code>\\p{Script=Han}</code> matches any
            Han character, wherever it sits in the code chart. (Other examples: <code>\\p{Script=Greek}</code>,
            <code>\\p{Script=Hiragana}</code>.) It needs the Unicode flag, which this page has turned on for you.</p>`,
        task: 'Match every <b>run of Han characters</b> using the Unicode property instead of the range. Look at what happens on each line.',
        lines: [
            '卷二百〇五',
            '賈㻞、賈珖、賈珩、賈瓔、賈菖、賈菱等各有執事',
            '《二○一六年十月七日版》',
        ],
        reference: '\\p{Script=Han}+',
        mode: 'exact',
        hint: 'Replace the range by \\p{Script=Han}, and keep the +.',
        solution: '\\p{Script=Han}+',
        after: 'Three lookalike problems in one. 〇 (U+3007, the proper ideographic zero in 卷二百〇五) and 㻞 (U+3EDE, Extension A) are Han characters that the plain range would miss. The circle ○ in 二○一六 (U+25CB) looks like a zero but is only a geometric symbol, so it still breaks the run. Some e-texts (like this 紅樓夢 file) use ○, others (like the 《明史》 file) use both, so normalising ○ to 〇 is a common cleaning step.',
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

// Invisible characters would make a match look empty, so inside a match they get a visible tag.
function showInvisible(s) {
    return s.replace(/[\u200b\ue000-\uf8ff]/g, ch => {
        const label = ch === '\u200b' ? 'ZWSP' : 'U+' + ch.charCodeAt(0).toString(16).toUpperCase();
        return '<span class="inv">' + label + '</span>';
    });
}

function highlight(text, matches) {
    let html = '';
    let pos = 0;
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    matches.forEach(([s, e]) => {
        html += esc(text.slice(pos, s)) + '<mark>' + showInvisible(esc(text.slice(s, e))) + '</mark>';
        pos = e;
    });
    return html + esc(text.slice(pos));
}

function renderSteps() {
    $('steps').innerHTML = LESSONS.map((l, i) => {
        const cls = ['step'];
        if (l.extra) cls.push('extra');
        if (i === state.current) cls.push('active');
        if (state.solved[i]) cls.push('done');
        const divider = l.extra && !LESSONS[i - 1].extra ? '<span class="extras-label">Extras: pitfalls</span>' : '';
        return `${divider}<button class="${cls.join(' ')}" data-i="${i}" title="${l.title.replace(/"/g, '&quot;')}">${state.solved[i] ? '✓' : i + 1}</button>`;
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
