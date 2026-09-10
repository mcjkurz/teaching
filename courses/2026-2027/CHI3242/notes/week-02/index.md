---
layout: default
title: CHI3242 第2週講義
---

<p class="updated">最後更新：2026年9月10日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第2週　語言、文本與編碼</h1>

<h2>1. 互動可視化與影片</h2>
<ul>
<li><a href="../../../../../visualizations/character-encoding.html">字符編碼瀏覽器（Character Encoding Explorer）</a>：輸入任意文字，觀察它如何在 UTF-8、UTF-16、GB18030、Big5 等編碼之間變成一串字節，又如何還原。</li>
<li><a href="../../../../../visualizations/bpe-training.html">字節對編碼訓練（Byte-Pair Encoding, BPE）</a>：逐步觀察 BPE 如何從字符或字節出發，合併高頻配對，學習出一套子詞詞表。</li>
<li><a href="https://www.youtube.com/watch?v=kOp0W08Ad0s">你懂乱码吗？锟斤拷烫烫烫（详解ASCII、Unicode、UTF-32、UTF-8编码）| Mojibake?</a>（林粒粒呀，YouTube 影片）：從亂碼現象出發，逐步解釋 ASCII、Unicode、UTF-32 與 UTF-8 的關係。</li>
</ul>

<h2>2. 什麼是「文本」？</h2>
<p>對你來說，文本是字、句子、故事。對電腦來說，文本只是一串數字。電腦不會「看」中文或英文——它只認得兩種狀態：開與關，寫成 <strong>0</strong> 和 <strong>1</strong>。所有文字、標點、表情，都要先變成數字，才能儲存或傳送。讀回來時，必須用同一套規則；規則用錯，就會看到亂碼。這套規則叫<strong>編碼（encoding）</strong>。下面從最小的單位講起。</p>

<h2>3. 比特：最小的開關</h2>
<p>一個<strong>比特（bit，也作位元）</strong>就是一個只能是 0 或 1 的開關。比特愈多，能區分的東西就愈多——每多一個，選擇就翻一倍。</p>
<div class="table-scroll">
<table>
<thead><tr><th>比特數</th><th>所有可能</th><th>一共幾種</th></tr></thead>
<tbody>
<tr><td>1</td><td><code>0</code>　<code>1</code></td><td>2</td></tr>
<tr><td>2</td><td><code>00</code>　<code>01</code>　<code>10</code>　<code>11</code></td><td>4</td></tr>
<tr><td>3</td><td><code>000</code>　<code>001</code>　<code>010</code>　<code>011</code>　<code>100</code>　<code>101</code>　<code>110</code>　<code>111</code></td><td>8</td></tr>
</tbody>
</table>
</div>
<p>規律很簡單：<em>n</em> 個比特 → 2<sup><em>n</em></sup> 種可能。8 個比特合稱一個<strong>字節（byte，也作位元組）</strong>，共 256 種值（0–255）。檔案在硬碟裡、在網路上移動的，就是這些字節。</p>
<p>一長串 0 和 1 不好讀，所以也常寫成<strong>十六進位（hex）</strong>：二進位每位只有 0 和 1，hex 每位有 0–9 和 A–F，共十六個符號。同一個數字，兩種寫法而已。</p>

<h2>4. ASCII：先夠用英文</h2>
<p>電腦最早要處理的是英文。工程師用 7 個比特（128 種）編了一張小表，叫 <strong>ASCII</strong>：英文字母、數字、常見標點，每個字符對應一個數字。第八個比特補 0，所以每個 ASCII 字正好佔 1 個字節。下表三欄是同一個編號的三種寫法。</p>
<div class="table-scroll">
<table>
<thead><tr><th>字符</th><th>十進位</th><th>hex</th><th>二進位</th></tr></thead>
<tbody>
<tr><td><code>A</code></td><td>65</td><td><code>41</code></td><td><code>01000001</code></td></tr>
<tr><td><code>a</code></td><td>97</td><td><code>61</code></td><td><code>01100001</code></td></tr>
<tr><td><code>0</code></td><td>48</td><td><code>30</code></td><td><code>00110000</code></td></tr>
<tr><td><code>!</code></td><td>33</td><td><code>21</code></td><td><code>00100001</code></td></tr>
</tbody>
</table>
</div>
<p>128 格很快就滿了。中文、日文、表情都不在表裡——ASCII 從來沒打算裝下它們。後來各地各自發明編碼（Big5、GBK……），同一個檔案用錯規則打開，就變成亂碼。</p>

<h2>5. Unicode：一張世界文字的大目錄</h2>
<p><strong>Unicode</strong> 的辦法是：做一張幾乎涵蓋全世界文字的大表，每個字符領一個獨一無二的編號。這個編號叫<strong>碼位（code point）</strong>。它只回答「這個字是幾號」，不規定這個號碼在檔案裡要怎麼存。</p>
<p>碼位習慣寫成 <code>U+</code> 再加上一串 hex：</p>
<ul>
<li><code>U+</code> 是標籤，意思是「這是 Unicode 編號」。</li>
<li>後面的符號是 hex，跟二進位是同一個數的另一種寫法。</li>
</ul>
<p>例如「A」的編號是十進位 65，hex 寫成 <code>41</code>，所以是 <code>U+0041</code>（前面多兩個 0，只是把位數寫齊）。「中」的編號是十進位 20013，hex 寫成 <code>4E2D</code>，所以是 <code>U+4E2D</code>。看到 <code>U+4E2D</code>，只要讀成：Unicode 表上，「中」的號碼是 <code>4E2D</code>。</p>

<h2>6. UTF-8：把號碼存成字節</h2>
<p><strong>UTF-8</strong> 負責下一步：把碼位寫成字節，才能存檔或上網。它是<strong>變長</strong>的——號碼小就少佔幾格，號碼大就多佔幾格。英文字母仍只佔 1 個字節（跟 ASCII 一模一樣），中文常佔 3 個，少數古字或表情佔 4 個。英文檔案因此維持小巧，又能裝下全球文字。這也是網路與檔案儲存的事實標準。</p>
<p>同一個字在不同編碼下會變成不同的字節。可用上面的<a href="../../../../../visualizations/character-encoding.html">字符編碼瀏覽器</a>實際看這些差異。</p>

<h3>電腦怎麼知道「這個字佔幾格」</h3>
<p>UTF-8 在每個字節的開頭做記號：</p>
<ul>
<li>這個字只佔 1 格：開頭是 <code>0</code></li>
<li>佔 2 格：第一格開頭 <code>110</code>，後面那一格開頭 <code>10</code></li>
<li>佔 3 格：第一格開頭 <code>1110</code>，後面兩格開頭 <code>10</code></li>
<li>佔 4 格：第一格開頭 <code>11110</code>，後面三格開頭 <code>10</code></li>
</ul>
<p>開頭的記號叫<strong>首字節</strong>與<strong>接續字節</strong>。記號佔掉的位子以外，剩下的 <code>x</code> 用來填碼位的二進位。</p>
<div class="table-scroll">
<table>
<thead><tr><th>字節數</th><th>碼位範圍</th><th>開頭記號</th><th>例子（二進位）</th><th>同一串（hex）</th></tr></thead>
<tbody>
<tr><td>1</td><td>U+0000 – U+007F</td><td><code>0xxxxxxx</code></td><td><code>A</code> → <code>01000001</code></td><td><code>41</code></td></tr>
<tr><td>2</td><td>U+0080 – U+07FF</td><td><code>110xxxxx 10xxxxxx</code></td><td><code>é</code> → <code>11000011 10101001</code></td><td><code>C3 A9</code></td></tr>
<tr><td>3</td><td>U+0800 – U+FFFF</td><td><code>1110xxxx 10xxxxxx 10xxxxxx</code></td><td><code>中</code> → <code>11100100 10111000 10101101</code></td><td><code>E4 B8 AD</code></td></tr>
<tr><td>4</td><td>U+10000 – U+10FFFF</td><td><code>11110xxx 10xxxxxx 10xxxxxx 10xxxxxx</code></td><td><code>🚀</code> → <code>11110000 10011111 10011010 10000000</code></td><td><code>F0 9F 9A 80</code></td></tr>
</tbody>
</table>
</div>
<p>表裡的「碼位範圍」也是 <code>U+</code> 加 hex：例如 U+0000–U+007F 就是編號 00 到 7F，正好是全部 ASCII。</p>
<p>以「中」走一遍。同一個編號，先寫十進位，再寫 hex，再拆成 3 個字節（每個 8 個比特）：</p>
<ol>
<li><strong>十進位：</strong>20013</li>
<li><strong>hex：</strong><code>4E2D</code>（所以寫成 <code>U+4E2D</code>）</li>
<li><strong>3 個字節：</strong>UTF-8 把這個號碼存成 8 + 8 + 8 個比特。3 字節的模板是 <code>1110xxxx 10xxxxxx 10xxxxxx</code>；把 <code>4E2D</code> 的二進位（<code>0100 1110 0010 1101</code>）填進 <code>x</code>，得到：</li>
</ol>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>8 個比特</th><th>hex</th></tr></thead>
<tbody>
<tr><td>第 1 字節</td><td><code>11100100</code></td><td><code>E4</code></td></tr>
<tr><td>第 2 字節</td><td><code>10111000</code></td><td><code>B8</code></td></tr>
<tr><td>第 3 字節</td><td><code>10101101</code></td><td><code>AD</code></td></tr>
</tbody>
</table>
</div>
<p>檔案裡實際存的，就是 <code>E4 B8 AD</code>。</p>
<p>兩個直接後果。第一，<strong>UTF-8 包含全部 ASCII</strong>：hex <code>00</code> 到 <code>7F</code> 的寫法完全相同，舊的英文檔本身就是合法的 UTF-8。第二，每個字節的開頭都在說「我是一個字的開頭」還是「我接在後面」，所以即使從中間開始讀，也能找到字與字的界線。</p>

<h2>7. 中文分詞</h2>
<p>英文以空格分隔詞，電腦很容易切分；中文書寫時詞與詞之間沒有空格，例如「我喜歡吃火鍋」要切成「我／喜歡／吃／火鍋」才有意義。<strong>分詞（segmentation）</strong>就是把一串中文字切成一個個詞的過程。分詞工具不少，例如 spaCy、HanLP、THUNLP；本課用 <code>jieba</code>，它會根據詞典與統計機率來判斷切分位置。分詞結果會直接影響後續的詞頻、搭配、主題模型等所有分析，因此是中文文本處理的第一步。</p>

<h2>8. 詞袋模型（Bag of Words, BoW）</h2>
<p>把一篇文本看作一個「袋子」，只統計每個詞出現幾次，完全忽略詞的順序與語法。例如「貓追狗」和「狗追貓」在詞袋模型裡是一樣的：{貓:1, 狗:1, 追:1}。這個簡化看似粗糙，但對許多任務（如比較兩篇文章的主題、作者用詞差異）已經足夠，也是向量空間模型與主題模型的基礎。</p>

<h2>9. 停用詞（stopwords）</h2>
<p><strong>停用詞</strong>指在文本中出現頻率極高、但對區分文本意義幫助不大的詞，例如中文的「的、了、是、在、我、你」、英文的 "the, is, of, a"。做詞頻或主題分析前，常會先把停用詞移除，以免它們蓋過真正有訊息量的詞。停用詞表並無通用標準，應依語料與研究問題調整——例如研究「我」的頻率變化時，「我」就不能當停用詞刪掉。</p>

<h2>10. Zipf 定律</h2>
<p><strong>Zipf 定律</strong>：在一段夠長的文本中，把所有詞按出現次數由高到低排列，第 <em>n</em> 名的詞的頻率大約與 <em>n</em> 成反比——也就是說，排名第 1 的詞出現次數約是第 2 名的兩倍、第 3 名的三倍，依此類推。結果是少數幾個詞佔了大部分出現次數，而長長的「尾巴」裡有大量只出現一兩次的罕見詞。這解釋了為什麼停用詞會主導詞頻表，也說明文本資料為何高度不均。</p>

<h2>11. 課堂練習</h2>
<p>到 <a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora">qhchina-data/corpora</a> 選一本小說的 <code>.txt</code>，把檔案網址連同下列提示一起貼進 OpenCode：</p>
<div class="prompt">
<p class="prompt-label">提示</p>
<pre>Please download this novel as a .txt file [link]

Then write a .py script that:
- uses jieba to segment the text into words
- prints the 10 most frequent words
- saves a simple png bar chart of the 100 most frequent words (columns only, no labels or annotations)

jieba and matplotlib are already installed; do not create a virtual environment.</pre>
</div>
<p>完成後，看終端機印出的前 10 個詞，再開 <code>.png</code>。左邊幾根最高的柱，多半就是停用詞；整張圖由高到低迅速落下，就是 Zipf 定律。</p>
