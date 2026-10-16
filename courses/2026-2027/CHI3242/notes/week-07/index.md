---
layout: default
title: CHI3242 第7週講義
---

<p class="updated">最後更新：2026年10月15日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第7週　主題模型（Topic Modeling）</h1>

<h2>1. 回顧</h2>
<p><strong>主題模型</strong>在一大批文件中自動找出「經常一起出現的一組詞」，也就是<strong>主題</strong>。LDA 假設：每個主題是詞的機率分布，每篇文件是幾個主題的混合。模型事先不知道有哪些主題，主題的名字要由我們根據高頻詞來取。主題數 K 也由我們決定，沒有唯一正確的答案。詳見本週<a href="../../slides/topic-modeling/">投影片</a>。</p>

<h2>2. 課堂／課後練習：《全唐詩》的主題</h2>
<p>打開你的智能體（agent）環境，把下面的提示詞貼給它。</p>
<ul>
<li>資料：<a href="https://github.com/mcjkurz/qhchina-data/blob/main/corpora/misc/%E5%85%A8%E5%94%90%E8%AF%97.json">qhchina-data/corpora/misc/全唐诗.json</a></li>
<li>工具：qhchina 的 <a href="https://www.qhchina.org/docs/topic_modeling/ldagibbssampler/"><code>LDAGibbsSampler</code></a>（<code>qhchina.analytics.topicmodels</code>）</li>
</ul>
<div class="prompt">
<p class="prompt-label">提示詞（Prompt）</p>
<pre>請從 GitHub 下載《全唐詩》：
https://github.com/mcjkurz/qhchina-data/blob/main/corpora/misc/全唐诗.json

然後安裝 qhchina：
pip install qhchina

再用 qhchina.analytics.topicmodels.LDAGibbsSampler 訓練主題模型。
每一首詩算一篇文件，以「字」為單位（不分詞），並去掉標點符號。
用 qhchina 的 load_stopwords("zh_cl_sim") 去掉文言（簡體）停用詞。

先分別試 10 個和 20 個主題。
每個主題列出前 10 個字，並為每個主題舉 2 首最典型的詩。</pre>
</div>
<p>看看結果：</p>
<ul>
<li>哪些主題一看就懂？試著為它們取個名字。哪些主題看不懂？</li>
<li>10 個主題和 20 個主題有什麼不同？哪些主題在 20 個時被拆開了？</li>
<li>回到典型的詩，細讀幾首：主題的名字合適嗎？</li>
</ul>
<p>接著可以讓智能體改變其他參數（例如 <code>alpha</code>、<code>beta</code>、<code>iterations</code>、<code>stopwords</code>），或換一個主題數，再比較結果。</p>

<h2>延伸閱讀</h2>
<ul>
<li>蘇祺：〈主題模型〉，第十章，李飛躍、桑海（主編）《數字人文引論》。北京：中華書局，2026年</li>
<li>Ted Underwood, <a href="https://tedunderwood.com/2012/04/07/topic-modeling-made-just-simple-enough/">“Topic Modeling Made Just Simple Enough”</a> (2012)</li>
<li>David M. Blei, “Probabilistic Topic Models” (2012)</li>
</ul>
