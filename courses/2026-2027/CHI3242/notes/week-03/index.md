---
layout: default
title: CHI3242 第3週講義
---

<script>
window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] } };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<p class="updated">最後更新：2026年9月21日</p>
<p><a href="../../">CHI 3242 課程大綱</a> · <a href="../../slides/collocations/">投影片（Slides）</a></p>
<h1>第3週　搭配詞（補課）</h1>

<h2>1. 什麼是搭配詞？</h2>
<p><strong>搭配詞（collocation）</strong>：兩個詞在自然語言中傾向於彼此靠近出現，稱為<strong>共現（cooccur）</strong>。例如「喝—茶」「天氣—好」是搭配，「喝—桌子」不是。Firth（1957）的名言是：<em>You shall know a word by the company it keeps.</em>（觀其伴，知其義。）</p>
<p>問題是：怎樣「測量」這種吸引力，並且和偶然區分開？基本想法是：如果詞語是隨機排列的，兩個詞相鄰的次數會是多少？真實語料裡的次數比這個多得多，就是搭配詞。</p>

<h2>2. 觀察值與期望值</h2>
<ul>
<li><strong>目標詞</strong> X（例：王婆），<strong>搭配詞</strong> Y（例：痛苦）。在 X 左右各 <em>k</em> 個詞的<strong>視窗</strong>內數 Y 出現幾次，這個次數是<strong>觀察值 O</strong>。</li>
<li><strong>期望值 E</strong>：如果純屬偶然，預期會出現幾次。像從 10 顆球（5 紅）中抽 4 顆，預期抽到 \(4 \times 0.5 = 2\) 顆紅球；抽得越多，平均越接近 2。</li>
</ul>
<p>算 E 分三步：</p>
<ol>
<li>隨機抽一個詞剛好是 Y 的機率：\(P(Y) = \dfrac{\text{count}(Y)}{N}\)（\(N\) 是語料總詞數）。</li>
<li>X 周圍的位置數：\(\text{count}(X) \times \text{視窗大小} \times 2\)（左右兩邊）。</li>
<li>\(E = P(Y) \times \text{位置數}\)。</li>
</ol>
<p>例（數字為示意）：</p>
<ul>
<li>語料總詞數 \(N = 50{,}000\)，count(王婆) \(= 200\)，count(痛苦) \(= 50\)，視窗 3 + 3。</li>
<li>機率：\(P(\text{痛苦}) = \dfrac{50}{50{,}000} = 0.001\)</li>
<li>位置數：\(200 \times 3 \times 2 = 1{,}200\)</li>
<li>期望值：\(E = 0.001 \times 1{,}200 = 1.2\)</li>
<li>若實際觀察值 \(O = 8\)，則 \(\dfrac{O}{E} = \dfrac{8}{1.2} \approx 6.7\)：共現次數是偶然預期的 6.7 倍。</li>
</ul>

<h2>3. 互信息 MI 與 PPMI</h2>
<p>把 \(O/E\) 取以 2 為底的對數，就得到（點）<strong>互信息 MI</strong>：\[\mathrm{MI} = \log_2 \frac{O}{E}\]<strong>對數</strong> \(\log_2 x\) 就是「2 的幾次方等於 \(x\)」：比值每多一倍，MI 加 1；比值每少一半，MI 減 1；\(O = E\) 時 \(\mathrm{MI} = 0\)。上例 \(\mathrm{MI} = \log_2 6.7 \approx 2.74\)。</p>
<div class="table-scroll">
<table>
<thead><tr><th>\(O/E\)</th><th>MI</th><th>意思</th></tr></thead>
<tbody>
<tr><td>\(1/4\)</td><td>\(-2\)</td><td>遠少於偶然</td></tr>
<tr><td>\(1/2\)</td><td>\(-1\)</td><td>少於偶然</td></tr>
<tr><td>\(1\)</td><td>\(0\)</td><td>如偶然</td></tr>
<tr><td>\(2\)</td><td>\(+1\)</td><td>多一倍</td></tr>
<tr><td>\(4\)</td><td>\(+2\)</td><td>4 倍</td></tr>
<tr><td>\(8\)</td><td>\(+3\)</td><td>8 倍</td></tr>
</tbody>
</table>
</div>
<p><strong>PPMI</strong>（正的點互信息）：把負值一律設為 0：\[\mathrm{PPMI} = \max\!\left(0,\ \log_2 \frac{O}{E}\right)\]負值表示兩詞互相「排斥」，但語料不夠大時不可靠。PPMI 常用於詞向量。</p>

<h2>4. 簡單指標的問題</h2>
<p>Evert 舉了一個例子（語料約 100 萬詞）：<em>the Iliad</em> 與 <em>must also</em> 都出現 \(O = 10\) 次，期望值都是 \(E = 1\)（\(E = \dfrac{f_1 \times f_2}{N}\)）。所以 \(O/E = 10\)、\(\mathrm{MI} = 3.32\)，兩者分數完全一樣。</p>
<div class="table-scroll">
<table>
<thead><tr><th>詞對</th><th>\(f_1\)</th><th>\(f_2\)</th><th>\(O\)</th><th>\(E\)</th><th>\(O/E\)</th><th>MI</th></tr></thead>
<tbody>
<tr><td>the Iliad</td><td>100,000</td><td>10</td><td>10</td><td>1</td><td>10</td><td>3.32</td></tr>
<tr><td>must also</td><td>1,000</td><td>1,000</td><td>10</td><td>1</td><td>10</td><td>3.32</td></tr>
</tbody>
</table>
</div>
<p>但直覺上 <em>the Iliad</em> 強得多：Iliad 只出現 10 次，而每一次前面都是 the，\(O = 10\) 已是可能的最大值；<em>must</em> 與 <em>also</em> 各出現 1,000 次，本來可以共現多得多。\(O\) 與 \(E\) 忽略了語料中其他的一切，我們還要看兩個詞<strong>沒有</strong>共現的情況。</p>

<h2>5. 列聯表</h2>
<p>對兩個事件 \(X\)、\(Y\)，每個個案恰好落入四格之一：</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>Y 發生</th><th>Y 不發生</th></tr></thead>
<tbody>
<tr><th>X 發生</th><td>a（兩者都發生）</td><td>b（只有 X）</td></tr>
<tr><th>X 不發生</th><td>c（只有 Y）</td><td>d（都沒有）</td></tr>
</tbody>
</table>
</div>
<p>列聯表無處不在：吸煙 × 肺癌、慣用手 × 性別、兩個詞 × 句子。問題都一樣：兩個性質是否<strong>互相獨立</strong>？搭配詞的判斷也是如此。詞對的 \(O\) 就是左上角的 \(a\)。</p>

<h2>6. Fisher 精確檢定</h2>
<h3>預備知識：n 選 k</h3>
<p>從 \(n\) 個中選 \(k\) 個、不計順序，有\[\binom{n}{k} = \frac{n!}{k!\,(n-k)!}\]種選法。例如從 8 杯中選 4 杯：\(\binom{8}{4} = \dfrac{8!}{4!\,4!} = 70\)。</p>
<h3>奶茶實驗</h3>
<p>Fisher（1935）：一位女士聲稱能分辨奶茶是「先倒牛奶」還是「先倒茶」。8 杯外觀相同（4 杯先牛奶、4 杯先茶），她要指出哪 4 杯先牛奶。全部答對的機率只有 \(\dfrac{1}{70} \approx 0.014\)，靠猜很不可能；答對 3 杯的機率 \(\dfrac{17}{70} \approx 0.243\)，可能只是運氣。這就是 <strong>Fisher 精確檢定</strong>的想法。</p>
<h3>一張表的機率</h3>
<p>固定各行各列的總數，一張特定的表（a, b, c, d）在「純屬偶然」下的機率是：</p>
<p>\[p = \frac{\dbinom{a+b}{a}\dbinom{c+d}{c}}{\dbinom{N}{a+c}}\]其中 \(N = a + b + c + d\)。</p>
<p>例：20 位學生（10 女 10 男），10 位有讀書，其中 8 位是女生。這張表的機率加上所有<strong>更極端</strong>的表（9 位、10 位女生讀書）的機率，總和 \(p \approx 0.0115 &lt; 0.05\)，所以性別與讀書的關聯<strong>顯著</strong>（示意數字）。</p>
<h3>回到 the Iliad / must also</h3>
<p>兩個詞對的完整列聯表（N = 1,000,000 個雙詞組）：</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>the Iliad：\(w_2\) = Iliad</th><th>\(w_2\) ≠ Iliad</th><th>must also：\(w_2\) = also</th><th>\(w_2\) ≠ also</th></tr></thead>
<tbody>
<tr><th>\(w_1\)（the / must）</th><td>10</td><td>99,990</td><td>10</td><td>990</td></tr>
<tr><th>非 \(w_1\)</th><td><strong>0</strong></td><td>900,000</td><td><strong>990</strong></td><td>998,010</td></tr>
</tbody>
</table>
</div>
<p>兩者的 \(O\) 相同，但 <em>the Iliad</em> 的 \(c = 0\)（每個 Iliad 前面都是 the），<em>must also</em> 的 \(c = 990\)。Fisher 檢定給出 \(p \approx 1 \times 10^{-10}\)（the Iliad）與 \(p \approx 1 \times 10^{-7}\)（must also）。兩者都「顯著」，但 the Iliad 的 \(p\) 小 1000 倍。實際用法是把 \(p\) 值當作分數來<strong>排序</strong>：the Iliad 排在前面，而 \(O/E\) 和 MI 做不到這一點。</p>

<h2>7. 三種「相鄰」的定義</h2>
<p>Evert：先決定什麼是一個<strong>共現項目（item）</strong>，再問每個項目是否含 \(w_1\)、是否含 \(w_2\)。同一張列聯表，只是「項目」不同：</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>視窗法</th><th>句子法</th><th>語法關係法</th></tr></thead>
<tbody>
<tr><th>「相鄰」是指</th><td>k 個詞之內</td><td>同一個句子</td><td>有語法關係（如形容詞→名詞）</td></tr>
<tr><th>計數單位</th><td>詞</td><td>句子</td><td>搭配對</td></tr>
<tr><th>需要</th><td>選定 k</td><td>分句</td><td>句法分析器</td></tr>
</tbody>
</table>
</div>
<p>例：在小語料中找 (好, 天氣)。視窗法數視窗內的詞；句子法數同時含「好」和「天氣」的句子（一個句子有兩個也只算 1 次）；語法關係法只數「形容詞→名詞」的修飾關係，「心情不好」這種謂語用法不算。各方法的 \(O\) 就是各自列聯表的 \(a\)。</p>

<h2>8. 回顧</h2>
<ol>
<li><strong>搭配詞</strong>：兩個詞比偶然更常在附近一起出現。</li>
<li><strong>觀察值 \(O\) 對期望值 \(E\)</strong>；取對數得 MI，去掉負值得 PPMI。</li>
<li><strong>列聯表</strong>：也記錄「沒有」共現的情況（a, b, c, d）。</li>
<li><strong>Fisher 精確檢定</strong>：這張表在「純屬偶然」下有多不可能？</li>
<li><strong>三種「相鄰」</strong>：視窗、句子、語法關係，同一張表、不同的「項目」。</li>
<li><strong>下一步</strong>：在真實語料上計算，比較不同的指標。</li>
</ol>

<h2>閱讀</h2>
<ul>
<li>Stefan Evert, “Corpora and Collocations”（本課主要參考）。</li>
<li>（選讀）Paul Baker, <em>Using Corpora in Discourse Analysis</em> (2006), Chapter 5, “Collocations”。</li>
<li>（選讀）J. R. Firth, “A Synopsis of Linguistic Theory” (1957)。</li>
</ul>
