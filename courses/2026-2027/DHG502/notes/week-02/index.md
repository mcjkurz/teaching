---
layout: default
title: DHG 502 Week 2 Notes
---

<p class="updated">Last updated: Sep 14, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 2 — Language, Text, and Encoding</h1>

<h2>1. Interactive visualization and video</h2>
<ul>
<li><a href="../../../../../visualizations/character-encoding.html">Character Encoding Explorer</a>: type any text and watch how it becomes a sequence of bytes under UTF-8, UTF-16, GB18030, Big5, and other encodings — and how it is decoded again.</li>
<li><a href="../../../../../visualizations/bpe-training.html">Byte-Pair Encoding (BPE) training</a>: watch BPE start from characters or bytes, merge frequent pairs, and grow a subword vocabulary.</li>
<li><a href="https://www.youtube.com/watch?v=kOp0W08Ad0s">你懂乱码吗？锟斤拷烫烫烫（详解ASCII、Unicode、UTF-32、UTF-8编码）| Mojibake?</a> (林粒粒呀, YouTube; in Chinese): starts from garbled text and walks through ASCII, Unicode, UTF-32, and UTF-8.</li>
</ul>

<h2>2. What is a “text”?</h2>
<p>To you, a text is words, sentences, a story. To a computer, a text is only a sequence of numbers. The machine does not “see” Chinese or English — it only distinguishes two states: on and off, written as <strong>0</strong> and <strong>1</strong>. Every character, punctuation mark, and emoji must first become a number before it can be stored or sent. When it is read back, the same rule must be used; if the rule is wrong, you see garbled characters (mojibake). That rule is called an <strong>encoding</strong>. The sections below start from the smallest unit.</p>

<h2>3. The bit: the smallest switch</h2>
<p>A <strong>bit</strong> is a switch that can only be 0 or 1. The more bits you have, the more things you can distinguish — each extra bit doubles the number of choices.</p>
<div class="table-scroll">
<table>
<thead><tr><th>Bits</th><th>All possibilities</th><th>How many</th></tr></thead>
<tbody>
<tr><td>1</td><td><code>0</code>　<code>1</code></td><td>2</td></tr>
<tr><td>2</td><td><code>00</code>　<code>01</code>　<code>10</code>　<code>11</code></td><td>4</td></tr>
<tr><td>3</td><td><code>000</code>　<code>001</code>　<code>010</code>　<code>011</code>　<code>100</code>　<code>101</code>　<code>110</code>　<code>111</code></td><td>8</td></tr>
</tbody>
</table>
</div>
<p>The pattern is simple: <em>n</em> bits → 2<sup><em>n</em></sup> possibilities. Eight bits make one <strong>byte</strong>, with 256 possible values (0–255). What files store on disk and what travels over the network are these bytes.</p>
<p>A long string of 0s and 1s is hard to read, so the same numbers are often written in <strong>hexadecimal (hex)</strong>: binary uses only 0 and 1 in each place; hex uses 0–9 and A–F, sixteen symbols. Two notations, one number.</p>

<h2>4. ASCII: enough for English, at first</h2>
<p>Early computers mainly had to handle English. Engineers used 7 bits (128 slots) for a small table called <strong>ASCII</strong>: letters, digits, and common punctuation, each character mapped to a number. The eighth bit is filled with 0, so each ASCII character occupies exactly 1 byte. The three columns below are three writings of the same number.</p>
<div class="table-scroll">
<table>
<thead><tr><th>Character</th><th>Decimal</th><th>hex</th><th>Binary</th></tr></thead>
<tbody>
<tr><td><code>A</code></td><td>65</td><td><code>41</code></td><td><code>01000001</code></td></tr>
<tr><td><code>a</code></td><td>97</td><td><code>61</code></td><td><code>01100001</code></td></tr>
<tr><td><code>0</code></td><td>48</td><td><code>30</code></td><td><code>00110000</code></td></tr>
<tr><td><code>!</code></td><td>33</td><td><code>21</code></td><td><code>00100001</code></td></tr>
</tbody>
</table>
</div>
<p>Those 128 slots filled up quickly. Chinese, Japanese, and emoji are not in the table — ASCII was never meant to hold them. Later, different regions invented their own encodings (Big5, GBK, and others). Open the same file with the wrong rule and it becomes garbled text.</p>

<h2>5. Unicode: a world catalogue of writing</h2>
<p><strong>Unicode</strong>’s approach is to keep one large table covering almost every writing system, and to give each character a unique number. That number is a <strong>code point</strong>. It only answers “which number is this character?”; it does not say how that number should be stored in a file.</p>
<p>Code points are conventionally written as <code>U+</code> followed by hex:</p>
<ul>
<li><code>U+</code> is a label meaning “this is a Unicode number.”</li>
<li>The symbols after it are hex — another way of writing the same number as binary.</li>
</ul>
<p>For example, “A” is decimal 65, hex <code>41</code>, so it is written <code>U+0041</code> (the two extra zeros only pad the width). “中” is decimal 20013, hex <code>4E2D</code>, so it is <code>U+4E2D</code>. Read <code>U+4E2D</code> as: in the Unicode table, the number for “中” is <code>4E2D</code>.</p>

<h2>6. UTF-8: storing the number as bytes</h2>
<p><strong>UTF-8</strong> does the next step: it writes the code point as bytes so it can be saved to a file or sent over a network. It is <strong>variable-length</strong> — small numbers take fewer bytes, large numbers take more. English letters still occupy 1 byte (identical to ASCII); Chinese characters usually take 3; a few rare characters and many emoji take 4. English files therefore stay compact, while the same encoding can hold writing from anywhere. This is the de facto standard for the web and for file storage.</p>
<p>The same character becomes different bytes under different encodings. Use the <a href="../../../../../visualizations/character-encoding.html">Character Encoding Explorer</a> above to see those differences.</p>

<h3>How the computer knows “how many bytes this character uses”</h3>
<p>UTF-8 marks the start of each byte:</p>
<ul>
<li>This character uses 1 byte: the byte starts with <code>0</code></li>
<li>2 bytes: the first starts with <code>110</code>, the following one with <code>10</code></li>
<li>3 bytes: the first starts with <code>1110</code>, the following two with <code>10</code></li>
<li>4 bytes: the first starts with <code>11110</code>, the following three with <code>10</code></li>
</ul>
<p>These marks are the <strong>leading byte</strong> and the <strong>continuation bytes</strong>. The remaining <code>x</code> positions are filled with the binary digits of the code point.</p>
<div class="table-scroll">
<table>
<thead><tr><th>Bytes</th><th>Code-point range</th><th>Leading marks</th><th>Example (binary)</th><th>Same sequence (hex)</th></tr></thead>
<tbody>
<tr><td>1</td><td>U+0000 – U+007F</td><td><code>0xxxxxxx</code></td><td><code>A</code> → <code>01000001</code></td><td><code>41</code></td></tr>
<tr><td>2</td><td>U+0080 – U+07FF</td><td><code>110xxxxx 10xxxxxx</code></td><td><code>é</code> → <code>11000011 10101001</code></td><td><code>C3 A9</code></td></tr>
<tr><td>3</td><td>U+0800 – U+FFFF</td><td><code>1110xxxx 10xxxxxx 10xxxxxx</code></td><td><code>中</code> → <code>11100100 10111000 10101101</code></td><td><code>E4 B8 AD</code></td></tr>
<tr><td>4</td><td>U+10000 – U+10FFFF</td><td><code>11110xxx 10xxxxxx 10xxxxxx 10xxxxxx</code></td><td><code>🚀</code> → <code>11110000 10011111 10011010 10000000</code></td><td><code>F0 9F 9A 80</code></td></tr>
</tbody>
</table>
</div>
<p>The “code-point range” column is also <code>U+</code> plus hex: U+0000–U+007F means numbers 00 through 7F, which is all of ASCII.</p>
<p>Walk through “中”. The same number is written first in decimal, then in hex, then split into 3 bytes (8 bits each):</p>
<ol>
<li><strong>Decimal:</strong> 20013</li>
<li><strong>hex:</strong> <code>4E2D</code> (hence <code>U+4E2D</code>)</li>
<li><strong>3 bytes:</strong> UTF-8 stores this number as 8 + 8 + 8 bits. The 3-byte template is <code><span class="bit-prefix">1110</span><span class="bit-payload">xxxx</span> <span class="bit-prefix">10</span><span class="bit-payload">xxxxxx</span> <span class="bit-prefix">10</span><span class="bit-payload">xxxxxx</span></code>; fill in the binary of <code>4E2D</code> (<code><span class="bit-payload">0100 1110 0010 1101</span></code>) at the <code>x</code> positions, and you get:</li>
</ol>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>8 bits</th><th>hex</th></tr></thead>
<tbody>
<tr><td>Byte 1</td><td><code><span class="bit-prefix">1110</span><span class="bit-payload">0100</span></code></td><td><code>E4</code></td></tr>
<tr><td>Byte 2</td><td><code><span class="bit-prefix">10</span><span class="bit-payload">111000</span></code></td><td><code>B8</code></td></tr>
<tr><td>Byte 3</td><td><code><span class="bit-prefix">10</span><span class="bit-payload">101101</span></code></td><td><code>AD</code></td></tr>
</tbody>
</table>
</div>
<p>Bold marks are the leading/continuation prefixes; <span class="bit-payload">orange</span> bits are filled in from the code point. What the file actually stores is <code>E4 B8 AD</code>.</p>
<p>Two immediate consequences. First, <strong>UTF-8 contains all of ASCII</strong>: hex <code>00</code> through <code>7F</code> are written identically, so an old English file is already valid UTF-8. Second, the start of each byte says “I begin a character” or “I continue one,” so even if you start reading in the middle of a file, you can still find the boundaries between characters.</p>

<h2>7. Chinese text segmentation</h2>
<p>English marks word boundaries with spaces, so a computer can split text easily. Written Chinese does not put spaces between words: 「我喜歡吃火鍋」 has to be cut into 「我／喜歡／吃／火鍋」 before word-level analysis makes sense. <strong>Segmentation</strong> is that process of cutting a string of characters into words. There are several tools (spaCy, HanLP, THUNLP); this course uses <code>jieba</code>, which decides cut points from a dictionary and statistical probabilities. Segmentation results feed directly into every later analysis — word frequencies, collocations, topic models — so it is the first step in processing Chinese text.</p>

<h2>8. Bag of Words (BoW)</h2>
<p>Treat a text as a “bag”: count how many times each word appears, and ignore order and syntax entirely. 「貓追狗」 and 「狗追貓」 are the same bag: {貓:1, 狗:1, 追:1}. The simplification is crude, but it is already enough for many tasks (comparing topics across documents, or differences in an author’s vocabulary), and it is the basis of vector-space models and topic models.</p>

<h2>9. Stopwords</h2>
<p><strong>Stopwords</strong> are words that appear extremely often but do little to distinguish one text from another: in Chinese, 「的、了、是、在、我、你」; in English, “the, is, of, a.” Before frequency or topic analysis, they are often removed so they do not drown out words that carry more information. There is no universal stopword list; it should follow the corpus and the research question. If you are studying how often 「我」 appears, 「我」 cannot be treated as a stopword and deleted.</p>

<h2>10. Zipf’s law</h2>
<p><strong>Zipf’s law</strong>: in a text that is long enough, rank all words by frequency from high to low. The frequency of the word in rank <em>n</em> is roughly inversely proportional to <em>n</em> — the most frequent word appears about twice as often as the second, three times as often as the third, and so on. A handful of words account for most occurrences, and a long “tail” contains many rare words that appear only once or twice. That is why stopwords dominate a frequency table, and why textual data are so uneven.</p>

<h2>11. In-class exercise</h2>
<p>From <a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora">qhchina-data/corpora</a>, pick a novel’s <code>.txt</code> file. Replace <code>[link]</code> in the prompt below with the file URL, then paste it into OpenCode:</p>
<div class="prompt">
<p class="prompt-label">Prompt</p>
<pre>Please download this novel as a .txt file [link]

Then write a .py script that:
- uses jieba to segment the text into words
- prints the 10 most frequent words
- saves a simple png bar chart of the 100 most frequent words (columns only, no labels or annotations)

jieba and matplotlib are already installed; do not create a virtual environment.</pre>
</div>
<p>When it finishes, look at the top 10 words printed in the terminal, then open the <code>.png</code>. The tallest bars on the left are usually stopwords; the rapid drop from left to right is Zipf’s law.</p>
<p>Commit and push when you are done, so the work is preserved — anything not pushed lives only in your Codespace (or on your laptop) and is lost if that environment is deleted.</p>
