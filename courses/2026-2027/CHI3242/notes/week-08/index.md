---
layout: default
title: CHI3242 第8週講義
---

<p class="updated">最後更新：2026年10月29日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第8週　文體計量學（Stylometry）</h1>

<h2>1. 回顧</h2>
<p><strong>文體計量學</strong>用可以計數的語言特徵來描述一位作者的「文體指紋」。最有用的往往不是內容詞，而是作者不自覺、反覆使用的<strong>高頻詞</strong>（如「了」「的」「便」「呢」）。做法是：選出全語料最常見的 N 個詞，計算每篇文本中這些詞的相對頻率，再轉成 <strong>z 分數</strong>，讓常見詞和較少見的詞處在同一個尺度上；最後比較文本之間的<strong>距離</strong>，或用 PCA 把它們畫在平面上。詳見本週<a href="../../slides/stylometry/">投影片</a>和互動頁面 <a href="https://mcjkurz.github.io/teaching/visualizations/z-scores-for-stylometry.html">Z-scores</a>。</p>

<h2>2. 課堂／課後練習：魯迅與沈從文的小說</h2>
<p>我們比較魯迅的三部小說集和沈從文的一部小說集。每一個 <code>.txt</code> 檔是一篇小說，在 PCA 圖上就是一個點。</p>
<ul>
<li>資料：<a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora/authors">qhchina-data/corpora/authors</a> 中的 <code>鲁迅/呐喊</code>、<code>鲁迅/彷徨</code>、<code>鲁迅/故事新编</code>、<code>沈从文/沈从文小说集</code></li>
<li>工具：qhchina 的 <a href="https://www.qhchina.org/docs/stylometry/"><code>Stylometry</code></a>（<code>qhchina.analytics.stylometry</code>）、jieba、scikit-learn 的 PCA</li>
</ul>
<p>打開你的智能體（agent）環境，把下列提示依序貼給它。每一步完成後，先看看它的報告，再貼下一個提示。</p>

<div class="prompt">
<p class="prompt-label">提示 1　安裝套件並下載四部小說集</p>
<pre>In this workspace, install qhchina and jieba into the Python environment used by this project. Verify that qhchina, jieba, matplotlib, and sklearn import successfully. Then download only these folders from https://github.com/mcjkurz/qhchina-data, branch main, into the matching paths under corpora/authors/:

- 鲁迅/呐喊
- 鲁迅/彷徨
- 鲁迅/故事新编
- 沈从文/沈从文小说集

Use a shallow sparse clone or another folder-only download method; do not clone unrelated corpus content. Confirm the downloaded .txt files and report the file count in each collection.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 2　為每篇小說分詞</p>
<pre>Read every .txt file in the four downloaded folders as UTF-8. Treat each file as one story/document; do not split stories into fragments. Replace punctuation, whitespace, and symbols with spaces before segmenting so words on either side of punctuation do not get joined. Use jieba to tokenize, retaining only tokens made of Unicode letters or numbers. Keep the token list and metadata for each story: collection, author, relative file path, character count, and token count. The three Lu Xun collections share the author label 鲁迅, but retain separate collection labels; the Shen Congwen collection uses author and collection label 沈从文. Report any file that cannot be read or produces no tokens instead of silently skipping it.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 3　用 qhchina 做 100 個特徵的文體計量，並匯出特徵統計</p>
<pre>Using the story token lists, fit qhchina.analytics.stylometry.Stylometry(n_features=100, distance="cosine") on a corpus dictionary mapping 鲁迅 and 沈从文 to their tokenized story documents. Keep qhchina's default z-score transformation. Use the fitted document vectors as the input to a two-component scikit-learn PCA; verify that the number of PCA points matches the number of story files.

Export a story-coordinate CSV with document ID, author, collection, source file, token count, PC1, and PC2. Export the 100 selected feature names. Also create a long-format top-features CSV with the top 100 selected words for each of the four collections, ranked by collection token count. Include count, total collection tokens, frequency per 10,000 tokens, and the mean qhchina z-score for that feature across the collection's story vectors. Clearly label that z-score as a collection mean based on corpus-wide qhchina standardization.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 4　畫出並檢查 PCA 圖</p>
<pre>Create a labeled PCA PNG and a standalone interactive HTML plot from the 100-feature analysis. Before plotting, load qhchina's Chinese font with "from qhchina import load_fonts" followed by "load_fonts()", so Chinese labels render in Matplotlib. Use a distinct color for each collection: 呐喊, 彷徨, 故事新编, and 沈从文. The HTML should show story and collection details on hover and allow users to zoom, pan, toggle collections, and reset the view. Save all outputs under outputs/. Finally, verify the PNG opens, the HTML has no unfilled data placeholders, the coordinate CSV has one row per story, and the feature CSV has 100 rows per collection.</pre>
</div>

<h3>觀察與詮釋</h3>
<p>打開 <code>outputs/</code> 中的互動 HTML 圖：</p>
<ul>
<li>魯迅和沈從文的小說能分開嗎？有沒有「站錯邊」的小說？點開看看是哪一篇。</li>
<li>魯迅的三部小說集彼此靠近嗎？《故事新编》和《呐喊》《彷徨》有沒有不同？為什麼可能如此？</li>
<li>打開特徵 CSV：哪些詞在某一部小說集的平均 z 分數特別高或特別低？它們是虛詞還是內容詞？</li>
<li>把 <code>n_features</code> 改成 30 或 300 再跑一次：圖有什麼變化？</li>
</ul>

<h2>延伸閱讀</h2>
<ul>
<li>Xianfeng Hu, Yang Wang, and Qiang Wu, <a href="https://doi.org/10.1142/S1793536914500125">“Multiple Authors Detection: A Quantitative Analysis of <em>Dream of the Red Chamber</em>”</a>, <em>Advances in Adaptive Data Analysis</em> 6, no. 4 (2014)</li>
<li>qhchina 文件：<a href="https://www.qhchina.org/docs/stylometry/">Stylometry</a></li>
</ul>
