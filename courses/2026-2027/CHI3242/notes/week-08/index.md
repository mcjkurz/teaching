---
layout: default
title: CHI3242 第8週講義
---

<p class="updated">最後更新：2026年10月29日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第8週　文體計量學（Stylometry）</h1>

<h2>1. 回顧</h2>
<p>每位作者都有一些<strong>不自覺的用字習慣</strong>，最明顯的是「的、了、也、便」這類常見的小詞。文體計量學就是數這些詞：</p>
<ol>
<li>找出整個語料中最常見的 100 個詞；</li>
<li>算出每篇文本裡這 100 個詞各出現多少，再換成 <strong>z 分數</strong>（比平均多還是少）；</li>
<li>每篇文本就成了一個 100 維的向量。用 <strong>PCA</strong> 把它壓成 2 維，就能畫在平面上：用字習慣相近的文本，會靠在一起。</li>
</ol>
<p>詳見本週<a href="../../slides/stylometry/">投影片</a>和互動頁面 <a href="https://mcjkurz.github.io/teaching/visualizations/z-scores-for-stylometry.html">Z-scores</a>。</p>

<h2>2. 課堂／課後練習：魯迅與沈從文</h2>
<p><strong>問題：</strong>只看常見詞，電腦能不能把魯迅和沈從文的小說分開？</p>
<ul>
<li>資料：<a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora/authors">qhchina-data/corpora/authors</a> 中魯迅的《呐喊》《彷徨》《故事新编》和《沈从文小说集》。每個 <code>.txt</code> 檔是一篇小說，在圖上就是一個點。</li>
<li>工具：qhchina 的 <a href="https://www.qhchina.org/docs/stylometry/"><code>Stylometry</code></a>、jieba、scikit-learn 的 PCA</li>
</ul>
<p>把下面三個提示<strong>依序</strong>貼給你的智能體（agent）。每一步做完，先看它的報告，再貼下一個。</p>

<div class="prompt">
<p class="prompt-label">提示 1　安裝與下載</p>
<pre>Install qhchina and jieba in this project's Python environment, and check that qhchina, jieba, matplotlib and sklearn all import.

From https://github.com/mcjkurz/qhchina-data (branch main), download ONLY these four folders, keeping the same paths:
- corpora/authors/鲁迅/呐喊
- corpora/authors/鲁迅/彷徨
- corpora/authors/鲁迅/故事新编
- corpora/authors/沈从文/沈从文小说集
Do not clone the whole repository (use a sparse checkout or download the folders directly).

Tell me how many .txt files are in each folder.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 2　分詞、文體計量與 PCA</p>
<pre>Write scripts/stylometry_pca.py.

1. Read every .txt file in the four folders as UTF-8. Each file is one story; do not split it. Replace punctuation, symbols and whitespace with a space, segment the text with jieba, and keep only tokens made of letters or digits. For each story, record: author (鲁迅 or 沈从文), collection (呐喊, 彷徨, 故事新编 or 沈从文), file path, number of tokens.
2. Fit qhchina.analytics.stylometry.Stylometry(n_features=100, distance="cosine") on a dictionary {"鲁迅": [token list of each Lu Xun story], "沈从文": [token list of each Shen Congwen story]}. Keep qhchina's default z-scores.
3. Run sklearn PCA(n_components=2) on the fitted story vectors. Check that there is exactly one point per story.
4. Save outputs/story_coordinates.csv with columns: story_id, author, collection, file, tokens, PC1, PC2.
5. Save outputs/features.csv with one row per collection and feature word (4 x 100 = 400 rows), with columns: collection, word, count, per_10000_tokens, mean_z (the average z-score of the word over that collection's stories).

Run the script. Tell me the number of stories per collection, list any file that could not be read or has no tokens, and show me the 10 words with the highest mean_z in each collection.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 3　畫圖</p>
<pre>Write scripts/plot_pca.py that uses outputs/story_coordinates.csv. Before plotting, run "from qhchina import load_fonts" and "load_fonts()" so Chinese characters display correctly.

Make two plots, with one color per collection (呐喊, 彷徨, 故事新编, 沈从文) and a legend:
- outputs/pca.png: one dot per story
- outputs/pca.html: the same plot, interactive; hovering over a dot shows the file name and collection; I can zoom and pan, and click the legend to hide or show a collection

Run the script and check that both files open and that the number of dots equals the number of stories.</pre>
</div>

<h3>觀察與詮釋</h3>
<p>打開 <code>outputs/pca.html</code>：</p>
<ul>
<li>兩位作者的小說分得開嗎？有沒有「站錯邊」的點？把滑鼠移上去，看看是哪一篇。</li>
<li>魯迅的三部小說集靠在一起嗎？《故事新编》和另外兩部一樣嗎？</li>
<li>打開 <code>outputs/features.csv</code>：每部小說集最有特色的詞（<code>mean_z</code> 最高）是什麼？是「的、了」這類小詞，還是內容詞？</li>
</ul>

<h2>延伸閱讀</h2>
<ul>
<li>Xianfeng Hu, Yang Wang, and Qiang Wu, <a href="https://doi.org/10.1142/S1793536914500125">“Multiple Authors Detection: A Quantitative Analysis of <em>Dream of the Red Chamber</em>”</a>, <em>Advances in Adaptive Data Analysis</em> 6, no. 4 (2014)</li>
<li>qhchina 文件：<a href="https://www.qhchina.org/docs/stylometry/">Stylometry</a></li>
</ul>
