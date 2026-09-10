---
layout: default
title: CHI3242 第2週講義
---

<p class="updated">最後更新：2026年9月10日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第2週　語言、文本與編碼</h1>

<h2>1. 互動可視化與影片</h2>
<ul>
<li><a href="../../../../../visualizations/character-encoding.html">字符編碼瀏覽器（Character Encoding Explorer）</a>：輸入任意文字，觀察它如何在 UTF-8、UTF-16、GB18030、Big5 等編碼之間變成一串位元組，又如何還原。</li>
<li><a href="../../../../../visualizations/bpe-training.html">位元組對編碼訓練（Byte-Pair Encoding, BPE）</a>：逐步觀察 BPE 如何從字符或位元組出發，合併高頻配對，學習出一套子詞詞表。</li>
<li><a href="https://www.youtube.com/watch?v=kOp0W08Ad0s">你懂乱码吗？锟斤拷烫烫烫（详解ASCII、Unicode、UTF-32、UTF-8编码）| Mojibake?</a>（林粒粒呀，YouTube 影片）：從亂碼現象出發，逐步解釋 ASCII、Unicode、UTF-32 與 UTF-8 的關係。</li>
</ul>

<h2>2. 什麼是「文本」？</h2>
<p>對你來說，文本是字、句子、故事。對電腦來說，文本只是一串數字。電腦不會「看」中文或英文——它只認得兩種狀態：開與關，寫成 <strong>0</strong> 和 <strong>1</strong>。所有文字、標點、表情，都要先變成數字，才能儲存或傳送。讀回來時，必須用同一套規則；規則用錯，就會看到亂碼。這套規則叫<strong>編碼（encoding）</strong>。下面從最小的單位講起。</p>

<h2>3. 位元：最小的開關</h2>
<p>一個<strong>位元（bit）</strong>就是一個只能是 0 或 1 的開關。位元愈多，能區分的東西就愈多——每多一個，選擇就翻一倍。</p>
<div class="table-scroll">
<table>
<thead><tr><th>位元數</th><th>所有可能</th><th>一共幾種</th></tr></thead>
<tbody>
<tr><td>1</td><td><code>0</code>　<code>1</code></td><td>2</td></tr>
<tr><td>2</td><td><code>00</code>　<code>01</code>　<code>10</code>　<code>11</code></td><td>4</td></tr>
<tr><td>3</td><td><code>000</code>　<code>001</code>　<code>010</code>　<code>011</code>　<code>100</code>　<code>101</code>　<code>110</code>　<code>111</code></td><td>8</td></tr>
</tbody>
</table>
</div>
<p>規律很簡單：<em>n</em> 個位元 → 2<sup><em>n</em></sup> 種可能。8 個位元合稱一個<strong>位元組（byte）</strong>，共 256 種值（0–255）。檔案在硬碟裡、在網路上移動的，就是這些位元組。</p>

<h2>4. ASCII：先夠用英文</h2>
<p>電腦最早要處理的是英文。工程師用 7 個位元（128 種）編了一張小表，叫 <strong>ASCII</strong>：英文字母、數字、常見標點，每個字符對應一個數字。第八個位元補 0，所以每個 ASCII 字正好佔 1 個位元組。</p>
<div class="table-scroll">
<table>
<thead><tr><th>字符</th><th>十進位</th><th>二進位</th></tr></thead>
<tbody>
<tr><td><code>A</code></td><td>65</td><td><code>01000001</code></td></tr>
<tr><td><code>a</code></td><td>97</td><td><code>01100001</code></td></tr>
<tr><td><code>0</code></td><td>48</td><td><code>00110000</code></td></tr>
<tr><td><code>!</code></td><td>33</td><td><code>00100001</code></td></tr>
</tbody>
</table>
</div>
<p>128 格很快就滿了。中文、日文、表情都不在表裡——ASCII 從來沒打算裝下它們。後來各地各自發明編碼（Big5、GBK……），同一個檔案用錯規則打開，就變成亂碼。</p>

<h2>5. Unicode 與 UTF-8</h2>
<p><strong>Unicode</strong> 是一張幾乎涵蓋全世界文字的大表：每個字符一個獨一無二的編號（<strong>碼位</strong>，code point）。「中」是 U+4E2D，「A」仍是 U+0041。它只規定「哪個字是幾號」，不規定這個號碼怎麼存成位元組。</p>
<p><strong>UTF-8</strong> 是把碼位寫成位元組的最常見方式，而且是<strong>變長</strong>的：同一個字可能佔 1 到 4 個位元組。英文字母仍只佔 1 個（跟 ASCII 一模一樣），中文常佔 3 個，少數古字或表情佔 4 個。英文檔案因此維持小巧，又能裝下全球文字——這也是網路與檔案儲存的事實標準。</p>
<p>同一個字在不同編碼下會變成不同的位元組。可用上面的<a href="../../../../../visualizations/character-encoding.html">字符編碼瀏覽器</a>實際看這些差異。</p>

<h3>UTF-8 怎麼標記「這個字佔幾格」</h3>
<p>UTF-8 靠位元組開頭的 0 / 1 模式來標長度：<strong>首位元組</strong>以 <code>0</code>、<code>110</code>、<code>1110</code> 或 <code>11110</code> 開頭，分別代表 1、2、3、4 個位元組；後面的<strong>接續位元組</strong>一律以 <code>10</code> 開頭。碼位的二進位值填進剩下的 <code>x</code> 裡。</p>
<div class="table-scroll">
<table>
<thead><tr><th>位元組數</th><th>碼位範圍</th><th>首位元組模式</th><th>例子</th></tr></thead>
<tbody>
<tr><td>1</td><td>U+0000 – U+007F</td><td><code>0xxxxxxx</code></td><td><code>A</code> → <code>01000001</code></td></tr>
<tr><td>2</td><td>U+0080 – U+07FF</td><td><code>110xxxxx 10xxxxxx</code></td><td><code>é</code> → <code>11000011 10101001</code></td></tr>
<tr><td>3</td><td>U+0800 – U+FFFF</td><td><code>1110xxxx 10xxxxxx 10xxxxxx</code></td><td><code>中</code> → <code>11100100 10111000 10101101</code></td></tr>
<tr><td>4</td><td>U+10000 – U+10FFFF</td><td><code>11110xxx 10xxxxxx 10xxxxxx 10xxxxxx</code></td><td><code>🚀</code> → <code>11110000 10011111 10011010 10000000</code></td></tr>
</tbody>
</table>
</div>
<p>兩個直接後果。第一，<strong>UTF-8 包含全部 ASCII</strong>：0x00–0x7F 的寫法完全相同，舊的英文檔本身就是合法的 UTF-8。第二，<strong>可自我同步</strong>：即使從中間開始讀，也能靠開頭模式找到字的邊界。以「中」（U+4E2D）為例，4E2D 的二進位是 <code>0100 111000 101101</code>，填入 3 位元組模板 <code>1110xxxx 10xxxxxx 10xxxxxx</code>，得到 <code>E4 B8 AD</code>。</p>

<h2>6. 中文分詞</h2>
<p>英文以空格分隔詞，電腦很容易切分；中文書寫時詞與詞之間沒有空格，例如「我喜歡吃火鍋」要切成「我／喜歡／吃／火鍋」才有意義。<strong>分詞（segmentation）</strong>就是把一串中文字切成一個個詞的過程。常用工具如 <code>jieba</code>，會根據詞典與統計機率來判斷切分位置。分詞結果會直接影響後續的詞頻、搭配、主題模型等所有分析，因此是中文文本處理的第一步。</p>

<h2>7. 詞袋模型（Bag of Words, BoW）</h2>
<p>把一篇文本看作一個「袋子」，只統計每個詞出現幾次，完全忽略詞的順序與語法。例如「貓追狗」和「狗追貓」在詞袋模型裡是一樣的：{貓:1, 狗:1, 追:1}。這個簡化看似粗糙，但對許多任務（如比較兩篇文章的主題、作者用詞差異）已經足夠，也是向量空間模型與主題模型的基礎。</p>

<h2>8. 停用詞（stopwords）</h2>
<p><strong>停用詞</strong>指在文本中出現頻率極高、但對區分文本意義幫助不大的詞，例如中文的「的、了、是、在、我、你」、英文的 "the, is, of, a"。做詞頻或主題分析前，常會先把停用詞移除，以免它們蓋過真正有訊息量的詞。停用詞表並無通用標準，應依語料與研究問題調整——例如研究「我」的頻率變化時，「我」就不能當停用詞刪掉。</p>

<h2>9. Zipf 定律</h2>
<p><strong>Zipf 定律</strong>：在一段夠長的文本中，把所有詞按出現次數由高到低排列，第 <em>n</em> 名的詞的頻率大約與 <em>n</em> 成反比——也就是說，排名第 1 的詞出現次數約是第 2 名的兩倍、第 3 名的三倍，依此類推。結果是少數幾個詞佔了大部分出現次數，而長長的「尾巴」裡有大量只出現一兩次的罕見詞。這解釋了為什麼停用詞會主導詞頻表，也說明文本資料為何高度不均。</p>
