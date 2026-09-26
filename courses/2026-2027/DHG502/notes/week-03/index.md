---
layout: default
title: DHG 502 Week 3 Notes
---

<p class="updated">Last updated: Sep 26, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 3 — Building a Corpus: Regular Expressions (Regex)</h1>

<h2>1. What is a regular expression?</h2>
<p>A <strong>regular expression (regex)</strong> is a small pattern language for describing the <em>shape</em> of text, rather than one exact string. Instead of searching for the literal word "1898," you can search for "any four digits," and instead of removing one specific footnote marker, you can remove "any bracketed number." Regex lets a computer find, extract, or clean text based on structure — which is exactly what most historical source-to-data work requires: pulling dates, names, or chapter headings out of OCR'd text; stripping page numbers and footnote markers; splitting a long file into consistent units (chapters, entries, records).</p>
<p>A regex is matched against text left to right. Most characters in a pattern are <strong>literal</strong> — they match themselves — but a small set of characters (<code>. * + ? ^ $ [ ] ( ) | \ { }</code>) are <strong>metacharacters</strong>: they mean something special (see below). If you want to match one of these characters literally, you <strong>escape</strong> it with a backslash, e.g. <code>\.</code> matches an actual period rather than "any character."</p>

<h2>2. The basics (RegexOne)</h2>
<p>These building blocks come from the interactive practice site <a href="https://regexone.com/">RegexOne</a>, which covers the same core vocabulary used in Python's <code>re</code> module and in almost every other regex implementation.</p>
<div class="table-scroll">
<table>
<thead><tr><th>Pattern</th><th>Meaning</th><th>Example</th></tr></thead>
<tbody>
<tr><td><code>abc</code></td><td>literal characters — matches exactly "abc"</td><td><code>cat</code> matches "cat" in "concatenate"</td></tr>
<tr><td><code>.</code></td><td>any single character (except a newline)</td><td><code>c.t</code> matches "cat," "cot," "c_t"</td></tr>
<tr><td><code>[abc]</code></td><td>a character class — one character out of the set</td><td><code>[aeiou]</code> matches any single vowel</td></tr>
<tr><td><code>[a-z]</code>, <code>[0-9]</code></td><td>a range inside a character class</td><td><code>[A-Za-z]</code> matches any English letter</td></tr>
<tr><td><code>[^abc]</code></td><td>negation — any character <em>not</em> in the set</td><td><code>[^0-9]</code> matches anything that is not a digit</td></tr>
<tr><td><code>\d</code>, <code>\w</code>, <code>\s</code></td><td>shorthand classes: digit, "word" character (letter/digit/underscore), whitespace</td><td><code>\d{4}</code> matches a 4-digit year</td></tr>
<tr><td><code>?</code></td><td>the preceding item is optional (0 or 1 time)</td><td><code>colou?r</code> matches "color" and "colour"</td></tr>
<tr><td><code>*</code></td><td>0 or more of the preceding item</td><td><code>ab*c</code> matches "ac," "abc," "abbbc"</td></tr>
<tr><td><code>+</code></td><td>1 or more of the preceding item</td><td><code>\d+</code> matches one or more digits</td></tr>
<tr><td><code>{n}</code>, <code>{n,}</code>, <code>{n,m}</code></td><td>exactly n / at least n / between n and m repetitions</td><td><code>\d{3}-\d{4}</code> matches a phone-style pattern like "555-1234"</td></tr>
<tr><td><code>^</code>, <code>$</code></td><td>anchors: start / end of the line (or string)</td><td><code>^Chapter</code> matches only if the line begins with "Chapter"</td></tr>
<tr><td><code>a|b</code></td><td>alternation — matches "a" or "b"</td><td><code>cat|dog</code> matches "cat" or "dog"</td></tr>
<tr><td><code>( )</code></td><td>a group — bundles a sub-pattern, and can be captured for extraction</td><td><code>(\d{4})-(\d{2})-(\d{2})</code> captures year, month, day separately</td></tr>
</tbody>
</table>
</div>
<p>Worked example: to pull dates written as "1898-03-12" out of a messy text file, the pattern <code>\d{4}-\d{2}-\d{2}</code> says "four digits, a dash, two digits, a dash, two digits" — it will match that shape wherever it occurs, without you having to know the date in advance. Wrapping each part in parentheses, <code>(\d{4})-(\d{2})-(\d{2})</code>, additionally lets your code pull out the year, month, and day as separate values.</p>
<p>Practice the basics interactively at <a href="https://regexone.com/">regexone.com</a> before moving to the Chinese-specific material below.</p>

<h2>3. The Chinese addition: why <code>\w</code> and <code>[a-z]</code> are not enough</h2>
<p>The shorthand classes above (<code>\w</code>, <code>[a-z]</code>, etc.) are built for the Latin alphabet and digits — they simply do not match Chinese characters. Working with Chinese-language sources requires a few extra tools, covered in the interactive page <a href="../../../../../visualizations/regex-abc-chinese.html">Regex ABCs for Chinese</a> (eleven core lessons plus four extras on real-world pitfalls, using examples from 《紅樓夢》 and 《明史》).</p>
<div class="table-scroll">
<table>
<thead><tr><th>Pattern / issue</th><th>What it addresses</th></tr></thead>
<tbody>
<tr><td><code>[\u4e00-\u9fff]</code></td><td>Matches one common Chinese character — the main CJK Unified Ideographs Unicode block.</td></tr>
<tr><td><code>[\u3400-\u4dbf]</code></td><td>CJK Extension A: rarer characters that fall outside the main block above (needed for some names and archaic characters).</td></tr>
<tr><td><code>\p{Script=Han}</code></td><td>Matches any Han character across <em>all</em> Unicode blocks and extensions in one shot, so you don't have to remember individual ranges. In Python, use the third-party <code>regex</code> module (not the built-in <code>re</code>); in JavaScript, add the <code>u</code> flag.</td></tr>
<tr><td>Full-width vs. half-width punctuation</td><td>Chinese text typically uses full-width punctuation (<code>，。！？</code>), which looks similar to but is a different character from ASCII punctuation (<code>,.!?</code>). A pattern written only for ASCII punctuation will silently fail to match Chinese-style punctuation.</td></tr>
<tr><td><code>\u3000</code></td><td>The ideographic (full-width) space — a different character from the ordinary ASCII space (<code>\u0020</code>). OCR'd or copy-pasted Chinese text often mixes the two, which breaks patterns that only look for a normal space.</td></tr>
<tr><td>Simplified vs. traditional characters</td><td>The same word can be two different character strings, e.g. 討論 (traditional) vs. 讨论 (simplified). A pattern or character class built around one will not match the other. Either normalize the text first (e.g. with <code>opencc</code>, as in the collocation exercises) or explicitly include both variants in your class/alternation.</td></tr>
</tbody>
</table>
</div>
<p>Putting several of these together, a pattern for classical-novel chapter headings such as "第一回" or "第一一八回" might look like <code>^第[一二三四五六七八九十百千0-9]+回</code>: an anchor (<code>^</code>), a literal character (<code>第</code>), a character class of Chinese numerals mixed with plain digits, a quantifier (<code>+</code>), and another literal (<code>回</code>) — combining the RegexOne basics with the Chinese-specific character classes above.</p>
<p>Work through the interactive lessons at <a href="../../../../../visualizations/regex-abc-chinese.html">Regex ABCs for Chinese</a>; each step gives you a real sentence from a classical or modern Chinese text and asks you to write the pattern that isolates a specific piece of it.</p>

<h2>4. In-class / take-home exercise</h2>
<p>Paste the following into OpenCode, adjusting the file name and the pattern you need for your own source.</p>
<div class="prompt">
<p class="prompt-label">Prompt</p>
<pre>I have a historical text file, source.txt, that needs cleaning before analysis.

Write a Python script (clean.py) that:
- loads source.txt
- uses a regular expression to find and report all footnote markers of the form [1], [2], [23], etc. (a number in square brackets)
- uses a regular expression to find and report all four-digit years (e.g. 1898)
- removes the footnote markers from the text and saves the cleaned result as source_clean.txt
- prints how many footnote markers and how many years were found

Explain the regex patterns you used, in plain language, in a short comment above each one.</pre>
</div>
<p>Check the printed counts and the cleaned file, then try adapting the same script to a pattern relevant to your own source (a chapter heading, a date format, a name list, an OCR artifact) — this is exactly the kind of "transformation log" step described in this week's readings.</p>

<h2>Readings</h2>
<ul>
<li><a href="https://regexone.com/">RegexOne</a> (interactive practice)</li>
<li><a href="../../../../../visualizations/regex-abc-chinese.html">Regex ABCs for Chinese</a> (interactive practice)</li>
<li>Jo Guldi, <em>The Dangerous Art of Text Mining: A Methodology for Digital History</em>, Introduction and Chapter 1</li>
</ul>
