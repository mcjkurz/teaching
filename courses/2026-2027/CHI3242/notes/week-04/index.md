---
layout: default
title: CHI3242 第4週講義
---

<p class="updated">最後更新：2026年9月26日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第4週　什麼是「角色」？（Woloch）</h1>

<h2>1. Woloch：人物空間與人物系統</h2>
<p>Alex Woloch 在《一與眾：小說中的人物空間與人物系統》（<em>The One vs. the Many</em>）裡提出兩個核心概念，用來取代「角色重要／不重要」這種模糊的直覺判斷。</p>
<p><strong>人物空間（character-space）：</strong>一個角色在敘事作品中所佔據的具體、有限的位置。它不是角色「本身」的心理深度，而是「被暗示的人」（an implied person，一個假設具有完整生命與內在世界的人）與敘事話語實際分配給這個人的篇幅、視角、關注度——這兩者交會之後的產物。同一個「被暗示的人」，若被分配到大量、連續、深入的篇幅，就有寬闊的人物空間（如主角）；若只在他人視角中偶爾閃現、被簡化為一個功能或類型，人物空間就十分狹小（如許多次要人物）。</p>
<p><strong>人物系統（character-system）：</strong>小說中所有人物並非各自獨立存在，而是共同組成一個分佈不均的系統，彼此競爭同一份有限的敘事資源（篇幅、視角、情節功能）。主角的空間之所以龐大，正是以壓縮、切割其他人物的空間為代價；次要人物往往被功能化——化為主角故事線上的一個工具、一個背景、一種類型。Woloch特別指出：次要人物常常「暗示」比文本實際給予的空間更豐富的內在生命，這種「被暗示的深度」與「被分配的有限空間」之間的落差，正是人物系統的結構性張力所在，也是小說形式的核心動力之一。</p>
<p>換言之，Woloch把「這個角色有多重要」的印象式判斷，重新表述為一個關於<strong>敘事資源分配</strong>的結構問題：誰得到篇幅？誰的視角被採用？誰的內在生命被展開，誰的則被壓縮成幾句話、一個標籤？</p>

<h2>2. 能否用統計方法操作化「人物空間」？</h2>
<p>人物空間本質上談的是「文本給了這個角色多少注意力、透過這個角色運作了多少敘事資源」。詞頻本身只能告訴我們一個名字出現多少次，卻無法告訴我們：這個角色被<strong>什麼樣</strong>的詞語包圍——動作、情感、身體描寫、社會關係、地點……而這些詞語的分佈，正是敘事話語透過這個角色所展開的內容。</p>
<p>這就是<strong>搭配詞（collocation）</strong>可以介入的地方：計算哪些詞比隨機預期更常出現在一個角色姓名周圍，等於在描繪這個角色的「語言環境」（verbal environment）——某種意義上，這正是人物空間在文本表層留下的痕跡。這不等於Woloch原本的理論（他談的是敘事結構與篇幅分配，而搭配詞談的是詞語共現），但可以作為一種操作化的起點，讓我們用統計方法去追問：這個角色的「空間」裡，究竟被填進了什麼？</p>

<h2>3. 課堂練習：用搭配詞觀察一個角色的「空間」</h2>

<h3>步驟一：準備語料</h3>
<p>選一部較長的小說，取得其 <code>.txt</code> 檔案（例如 <a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora">qhchina-data/corpora</a>）。</p>

<h3>步驟二：建立倉庫</h3>
<p>兩種做法皆可：</p>
<ol>
<li><strong>用 Codespace：</strong>在 GitHub 上建立一個新的空倉庫（勾選「Add a README file」即可，不需要用範本），進入倉庫後按 <strong>Code → Codespaces → Create codespace</strong>，再把小說 <code>.txt</code> 檔放進去（例如存成 <code>data/novel.txt</code>）。</li>
<li><strong>用自己的電腦：</strong>先在電腦上新建一個空資料夾，用 VS Code 打開，把小說 <code>.txt</code> 檔放進去（例如 <code>data/novel.txt</code>），並在裡面完成後面的分析工作；完成後再到 GitHub 建立一個新的空倉庫（同樣勾選「Add a README file」），依照頁面上的指示把這個資料夾接上該倉庫，然後 commit 並 push。</li>
</ol>

<h3>步驟三：交給編程助手</h3>
<p>把下列提示依序複製貼進 OpenCode，記得依你的檔名與角色姓名調整內容。</p>

<div class="prompt">
<p class="prompt-label">提示 1　分句與分詞</p>
<pre>data/novel.txt is this novel's .txt file (UTF-8).
jieba and qhchina are already installed; please install opencc if it isn't already. Do not create a virtual environment.

Write a Python script (segment.py) that:
- loads data/novel.txt
- if the text contains traditional characters, first converts the whole text to simplified with opencc (jieba's dictionary is trained on simplified Chinese, so segmenting traditional text directly gives worse results)
- splits the text into sentences using Chinese sentence-ending punctuation (。！？)
- tokenizes each sentence into words with jieba, removing punctuation marks
- saves the result as sentences.json (a list of lists of word tokens), so I can reuse it without re-segmenting every time</pre>
</div>
<p>若文本被轉換成簡體，記得下一步的目標角色姓名也要用簡體字（例如原文是「賈寶玉」，之後 <code>target_words</code> 要寫「贾宝玉」，否則會完全找不到搭配詞）。</p>

<div class="prompt">
<p class="prompt-label">提示 2　尋找搭配詞</p>
<pre>Using sentences.json from before, write a Python script (collocates.py) that:
- loads sentences.json
- imports find_collocates from qhchina.analytics.collocations and load_stopwords from qhchina
- calls load_stopwords() to get a set of Chinese stopwords
- calls find_collocates on the sentences, with target_words="[CHARACTER NAME]", method="window", horizon=5,
  and filters={"min_word_length": 2, "stopwords": stopwords, "max_p": 0.05}
- sorts the resulting dataframe by obs_local, descending
- saves the full result to output/collocates.csv
- prints the top 30 rows to the terminal</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 3　換一個視窗大小或角色再跑一次</p>
<pre>Rerun collocates.py with horizon=10 instead of 5, and also with a second target word, "[ANOTHER CHARACTER NAME]" (keep horizon=5 for that one).
Save each version to a separate CSV (e.g. output/collocates_5.csv, output/collocates_10.csv, output/collocates_other.csv) so I can compare them side by side.</pre>
</div>

<h3>步驟四：觀察與詮釋</h3>
<p>打開 <code>output/collocates.csv</code>，看看排在前面的搭配詞：</p>
<ul>
<li>這些詞可以分成幾類？（動作、情感、身體、社會關係、地點、物品……）</li>
<li>把 <code>horizon=5</code> 和 <code>horizon=10</code> 的結果相比，排序有明顯變化嗎？為什麼？</li>
<li>把你選的角色和另一個角色（或另一個詞）相比，兩份搭配詞表看起來有系統性的不同嗎？哪一個角色的搭配詞更集中在少數幾類，哪一個更分散？</li>
<li>留在表中的搭配詞，p值是否都小於0.05？這代表什麼——它們與目標詞共現的頻率，在統計上顯著高於隨機預期，而不太可能只是偶然。</li>
<li>回到 Woloch 的說法：這份搭配詞表能不能告訴我們一些關於「人物空間」的線索？它能呈現的，和它<strong>不能</strong>呈現的，分別是什麼？</li>
</ul>

<p>若你用的是 Codespace，做完後請把 <code>segment.py</code>、<code>collocates.py</code>、<code>sentences.json</code> 與 <code>output/</code> 資料夾 commit 並 push 到 GitHub。</p>

<h2>閱讀</h2>
<ul>
<li>Alex Woloch, <em>The One vs. the Many</em>, pp. 12–42。</li>
<li>Franco Moretti, <a href="https://litlab.stanford.edu/LiteraryLabPamphlet2.pdf">“Network Theory, Plot Analysis”</a>（Stanford Literary Lab Pamphlet 2）。</li>
<li>（選讀）Andrew Piper, <em>Enumerations</em>, chapter on characterization。</li>
</ul>
