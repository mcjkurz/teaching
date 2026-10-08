---
layout: default
title: CHI3242 第6週講義
---

<p class="updated">最後更新：2026年10月8日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第6週　從詞語到語料庫：正則表達式（Regex）</h1>

<h2>1. 什麼是正則表達式？</h2>
<p><strong>正則表達式（regular expression，簡稱 regex）</strong>是一種描述文本「形狀」的小型模式語言，而不是只描述某一個固定的字符串。例如，你不必搜尋字面上的「1898」，而可以搜尋「任意四個數字」；你也不必刪除某一個特定的註腳標記，而可以刪除「任何方括號裡的數字」。有了 regex，電腦就能根據文本的<strong>結構</strong>來查找、提取或清理內容。這正是處理文本資料時最常見的需求，例如：</p>
<ul>
<li>從 OCR（文字識別）得到的文本中提取日期、人名或章回標題；</li>
<li>刪除頁碼和註腳標記；</li>
<li>把一個長文件切分成統一的單位（章節、條目、記錄）。</li>
</ul>
<p>regex 從左到右逐字匹配文本。模式裡的大多數字符是<strong>字面字符</strong>：它們只匹配自己。少數字符（<code>. * + ? ^ $ [ ] ( ) | \ { }</code>）是<strong>元字符（metacharacter）</strong>，有特殊含義（見下表）。如果想匹配這些字符本身，就要在前面加反斜線來<strong>轉義（escape）</strong>。例如 <code>\.</code> 匹配真正的句點，而不是「任意字符」。</p>

<h2>2. 基本語法（RegexOne）</h2>
<p>下面這些基本單元來自互動練習網站 <a href="https://regexone.com/">RegexOne</a>。它們在 Python 的 <code>re</code> 模塊以及幾乎所有其他語言的 regex 中都通用。</p>
<div class="table-scroll">
<table>
<thead><tr><th>模式</th><th>含義</th><th>例子</th></tr></thead>
<tbody>
<tr><td><code>abc</code></td><td>字面字符：恰好匹配「abc」</td><td><code>cat</code> 能匹配 "concatenate" 中的 "cat"</td></tr>
<tr><td><code>.</code></td><td>任意單個字符（換行除外）</td><td><code>c.t</code> 匹配 "cat"、"cot"、"c_t"</td></tr>
<tr><td><code>[abc]</code></td><td>字符類：集合中的任意一個字符</td><td><code>[aeiou]</code> 匹配任意一個元音字母</td></tr>
<tr><td><code>[a-z]</code>、<code>[0-9]</code></td><td>字符類中的範圍</td><td><code>[A-Za-z]</code> 匹配任意英文字母</td></tr>
<tr><td><code>[^abc]</code></td><td>取反：不在集合中的任意字符</td><td><code>[^0-9]</code> 匹配任何不是數字的字符</td></tr>
<tr><td><code>\d</code>、<code>\w</code>、<code>\s</code></td><td>簡寫字符類：數字、「單詞」字符（字母／數字／下劃線）、空白</td><td><code>\d{4}</code> 匹配四位數的年份</td></tr>
<tr><td><code>?</code></td><td>前一項可有可無（0 次或 1 次）</td><td><code>colou?r</code> 匹配 "color" 和 "colour"</td></tr>
<tr><td><code>*</code></td><td>前一項出現 0 次或多次</td><td><code>ab*c</code> 匹配 "ac"、"abc"、"abbbc"</td></tr>
<tr><td><code>+</code></td><td>前一項出現 1 次或多次</td><td><code>\d+</code> 匹配一個或多個數字</td></tr>
<tr><td><code>{n}</code>、<code>{n,}</code>、<code>{n,m}</code></td><td>恰好 n 次／至少 n 次／n 到 m 次</td><td><code>\d{3}-\d{4}</code> 匹配類似電話號碼的 "555-1234"</td></tr>
<tr><td><code>^</code>、<code>$</code></td><td>錨點：一行（或字符串）的開頭／結尾</td><td><code>^Chapter</code> 只在該行以 "Chapter" 開頭時才匹配</td></tr>
<tr><td><code>a|b</code></td><td>或：匹配 "a" 或 "b"</td><td><code>cat|dog</code> 匹配 "cat" 或 "dog"</td></tr>
<tr><td><code>( )</code></td><td>分組：把一段子模式打包，還可以「捕獲」出來單獨使用</td><td><code>(\d{4})-(\d{2})-(\d{2})</code> 分別捕獲年、月、日</td></tr>
</tbody>
</table>
</div>
<p><strong>完整例子：</strong>想從一份雜亂的文本中找出形如「1898-03-12」的日期，可以用 <code>\d{4}-\d{2}-\d{2}</code>，意思是「四個數字、一個短橫、兩個數字、一個短橫、兩個數字」。不管日期出現在哪裡，只要形狀吻合就能匹配，你不需要事先知道有哪些日期。如果把每一部分用括號括起來，寫成 <code>(\d{4})-(\d{2})-(\d{2})</code>，程式還能把年、月、日分別取出來。</p>
<p>在進入下面的中文專題之前，建議先到 <a href="https://regexone.com/">regexone.com</a> 做完基礎練習。</p>

<h2>3. 中文的特殊之處：為什麼 <code>\w</code> 和 <code>[a-z]</code> 不夠用？</h2>
<p>上面的簡寫類（<code>\w</code>、<code>[a-z]</code> 等）是為拉丁字母和數字設計的，所以<strong>匹配不到漢字</strong>。處理中文文本需要一些額外工具，請見互動頁面 <a href="../../../../../visualizations/regex-abc-chinese.html">中文正則表達式入門（Regex ABCs for Chinese）</a>。頁面包含 11 節核心課程，另有 4 節講解實際使用中的常見陷阱，例子取自《紅樓夢》和《明史》。</p>
<div class="table-scroll">
<table>
<thead><tr><th>模式／問題</th><th>解決什麼</th></tr></thead>
<tbody>
<tr><td><code>[\u4e00-\u9fff]</code></td><td>匹配一個常用漢字，即 Unicode 的主要「中日韓統一表意文字」區塊。</td></tr>
<tr><td><code>[\u3400-\u4dbf]</code></td><td>CJK 擴展 A 區：落在上面主區塊之外的較少見漢字（一些人名和古字會用到）。</td></tr>
<tr><td><code>\p{Script=Han}</code></td><td>一次匹配所有 Unicode 區塊和擴展區的漢字，不必記各個範圍。在 Python 中需使用第三方的 <code>regex</code> 模塊（不是內置的 <code>re</code>）；在 JavaScript 中要加上 <code>u</code> 標誌。</td></tr>
<tr><td>全角與半角標點</td><td>中文通常使用全角標點（<code>，。！？</code>），看起來和 ASCII 標點（<code>,.!?</code>）相似，其實是不同的字符。只針對 ASCII 標點寫的模式，遇到中文標點會悄悄地匹配不到。</td></tr>
<tr><td><code>\u3000</code></td><td>表意文字空格（全角空格），和普通的 ASCII 空格（<code> </code>）是不同的字符。OCR 或複製貼上得到的中文文本常常兩種混用，導致只找普通空格的模式失效。</td></tr>
<tr><td>簡體與繁體</td><td>同一個詞可能是兩個不同的字符串，例如 討論（繁體）和 讨论（簡體）。只針對其中一種寫的模式或字符類，匹配不到另一種。解決辦法：先統一文本（例如用 <code>opencc</code>，搭配詞練習中用過），或在字符類／「或」中把兩種寫法都寫進去。</td></tr>
</tbody>
</table>
</div>
<p><strong>綜合例子：</strong>想匹配古典小說的回目標題，如「第一回」或「第一一八回」，可以寫成 <code>^第[一二三四五六七八九十百千0-9]+回</code>。拆開來看：</p>
<ul>
<li><code>^</code>：錨點，必須從行首開始；</li>
<li><code>第</code>：字面字符；</li>
<li><code>[一二三四五六七八九十百千0-9]</code>：字符類，混合了中文數字和阿拉伯數字；</li>
<li><code>+</code>：量詞，出現一次或多次；</li>
<li><code>回</code>：字面字符。</li>
</ul>
<p>這就是把 RegexOne 的基本語法和中文專用的字符類結合起來使用。</p>
<p>請完成互動課程 <a href="../../../../../visualizations/regex-abc-chinese.html">中文正則表達式入門（Regex ABCs for Chinese）</a>：每一步會給你一句真實的古典或現代中文文本，要你寫出能把指定部分提取出來的模式。</p>

<h2>4. 課堂／課後練習</h2>
<p>把下面的提示詞貼給你的智能體（agent），並根據你自己的文本調整文件名和需要的模式。</p>
<div class="prompt">
<p class="prompt-label">提示詞（Prompt）</p>
<pre>我有一個需要在分析前清理的文本文件 source.txt。

請寫一個 Python 腳本（clean.py），完成以下工作：
- 讀取 source.txt
- 用正則表達式找出並報告所有形如 [1]、[2]、[23] 的註腳標記（方括號裡的數字）
- 用正則表達式找出並報告所有四位數的年份（例如 1898）
- 從文本中刪除註腳標記，並把清理後的結果存成 source_clean.txt
- 打印找到的註腳標記數量和年份數量

請在每個正則表達式上方用一小段註釋，以通俗的語言解釋你用的模式。</pre>
</div>
<p>先檢查打印出的數量和清理後的文件，然後試著把同一個腳本改成適用於你自己文本的模式（例如章回標題、日期格式、人名列表、OCR 產生的雜訊）。</p>

<h2>延伸閱讀與練習</h2>
<ul>
<li><a href="https://regexone.com/">RegexOne</a>（互動練習）</li>
<li><a href="../../../../../visualizations/regex-abc-chinese.html">中文正則表達式入門（Regex ABCs for Chinese）</a>（互動練習）</li>
</ul>
