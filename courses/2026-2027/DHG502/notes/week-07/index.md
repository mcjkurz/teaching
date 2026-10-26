---
layout: default
title: DHG 502 Week 7 Notes
---

<p class="updated">Last updated: Oct 26, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 7 — Topic Modeling</h1>

<h2>1. Recap</h2>
<p>A <strong>topic model</strong> finds groups of words that tend to occur together across a collection of documents. LDA assumes that each topic is a distribution over words and each document is a mixture of topics. The model does not know what the topics are: we choose K, then name and interpret the topics ourselves. For historians the useful outputs are the <strong>topics</strong> and the <strong>topic proportions per document</strong> (for example, per year), which tell us where to read closely.</p>

<h2>2. Exercise: topics in Mao Zedong’s Selected Works</h2>
<ul>
<li>Data: <a href="https://github.com/mcjkurz/qhchina-data/blob/main/corpora/%E9%80%89%E9%9B%86/%E6%AF%9B%E6%B3%BD%E4%B8%9C%E9%80%89%E9%9B%86.txt">毛泽东选集.txt</a> (simplified Chinese; many texts from the 1920s to the 1970s)</li>
<li>Tool: <a href="https://www.qhchina.org/docs/topic_modeling/ldagibbssampler/"><code>LDAGibbsSampler</code></a> from qhchina</li>
</ul>
<p>Each text in the file starts with a title, then a date line like <code>（一九二五年十二月一日）</code>. Footnote markers such as <code>〔12〕</code> and the numbered editorial notes were added by the editors, so we remove them. Open your repo in your AI coding assistant and paste Prompt 1.</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Download the raw text of https://github.com/mcjkurz/qhchina-data/blob/main/corpora/选集/毛泽东选集.txt and run pip install qhchina jieba.

Split it into one document per text. Each text starts with a title, followed by a date line such as （一九二五年十二月一日）; record the title and the year (the zero may be written 〇 or ○). Remove footnotes: lines starting with 〔12〕-style markers, and such markers inside the text. Tell me how many documents you found.

Tokenize with jieba, keep words of 2+ characters, remove stopwords with qhchina's load_stopwords("zh_sim"), and drop documents with fewer than 100 tokens.

Train qhchina.analytics.topicmodels.LDAGibbsSampler (10 topics, iterations=200, random_state=42, min_word_count=5). For each topic, print the top 10 words and the 2 most typical documents (title and year).</pre>
</div>
<p>Read the topics: which can you name? Open the typical documents of one topic and check your name against the text. Then paste Prompt 2:</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>For each decade, compute the average topic proportion over its documents, and plot it as a stacked bar chart (one color per topic; the legend shows each topic's number and top 3 words). Make sure Chinese displays correctly (see qhchina.helpers for fonts). Save it as topics_by_decade.png.</pre>
</div>

<h2>3. Discuss</h2>
<ul>
<li>Which topics rise and fall across the decades? Do the shifts match what you know about the period? Which might reflect <em>which texts the editors chose to include</em>?</li>
<li>Some topics may be generic party language (同志, 工作, 问题) rather than a theme. What would you do about them?</li>
<li>Try 5 or 20 topics, or a different <code>random_state</code>: which topics are stable?</li>
</ul>
<p>Remember: a topic is a pattern of co-occurring words, not an argument. The results depend on our choices (document unit, stopwords, K), and this is an edited, officially curated collection. Use the topics to pick texts for close reading.</p>

<h2>Readings</h2>
<ul>
<li>Ted Underwood, <a href="https://tedunderwood.com/2012/04/07/topic-modeling-made-just-simple-enough/">“Topic Modeling Made Just Simple Enough”</a> (2012)</li>
<li>(optional) David M. Blei, “Probabilistic Topic Models” (2012)</li>
</ul>
