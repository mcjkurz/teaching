---
layout: default
title: DHG 502 Week 7 Notes
---

<p class="updated">Last updated: Oct 26, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 7 — Topic Modeling</h1>

<h2>1. Recap</h2>
<p>A <strong>topic model</strong> finds, across a large collection of documents, groups of words that tend to occur together. Each group is a <strong>topic</strong>. LDA assumes that every topic is a probability distribution over words and every document is a mixture of several topics. The model is not told what the topics are: it only returns word lists and proportions, and <strong>we</strong> name and interpret the topics. The number of topics K is also our choice, and there is no single correct value.</p>
<p>For historians the useful output is twofold: the <strong>topics</strong> (what vocabularies run through the corpus?) and the <strong>topic proportions per document</strong> (which documents, periods, or authors lean on which vocabulary?). A topic model is a way to decide where to read closely, not a replacement for reading.</p>

<h2>2. The corpus: Mao Zedong’s Selected Works</h2>
<p>Today we model a text collection of 毛泽东选集 (<em>Selected Works of Mao Zedong</em>), in simplified characters:</p>
<ul>
<li>Data: <a href="https://github.com/mcjkurz/qhchina-data/blob/main/corpora/%E9%80%89%E9%9B%86/%E6%AF%9B%E6%B3%BD%E4%B8%9C%E9%80%89%E9%9B%86.txt">qhchina-data/corpora/选集/毛泽东选集.txt</a></li>
<li>Tool: <a href="https://www.qhchina.org/docs/topic_modeling/ldagibbssampler/"><code>LDAGibbsSampler</code></a> from qhchina (<code>qhchina.analytics.topicmodels</code>)</li>
</ul>
<p>What is in the file:</p>
<ul>
<li>Many texts from the 1920s to the 1970s (speeches, reports, essays, telegrams, directives), one after another. Each text starts with a <strong>title</strong>, followed by a <strong>date line</strong> in parentheses, for example <code>（一九二五年十二月一日）</code>, written in Chinese numerals. The date line gives us each document’s year.</li>
<li><strong>Editorial apparatus</strong>: footnote markers such as <code>〔12〕</code> inside the text, and numbered editorial notes (lines beginning with <code>〔12〕</code>) after many texts. These were written by the editors, not by Mao, so they must be removed before modeling.</li>
</ul>
<p>Keep the source critique from Week 2 in mind: this is an <strong>edited, officially curated</strong> collection. Texts were selected, and many were revised for publication. A topic model of it describes the vocabulary of the published canon, not Mao’s unfiltered words.</p>

<h2>3. In-class exercise: topics in Mao’s Selected Works</h2>
<p>Open your repo in your AI coding assistant and paste Prompt 1.</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Download Mao Zedong's Selected Works (simplified Chinese) from GitHub:
https://github.com/mcjkurz/qhchina-data/blob/main/corpora/选集/毛泽东选集.txt
(use the raw file URL) and save it as mao.txt in this repo.

Install the tools:
pip install qhchina jieba

Step 1 - split into documents. Each text starts with a title line, followed by a date line in parentheses such as （一九二五年十二月一日） (Chinese numerals). Split the file into one document per text and record its title and year (convert the Chinese-numeral year to an integer; the zero may be written 〇 or ○). Look at the result first and tell me how many documents you found and show a few titles with years, so we can check the split.

Step 2 - clean. Remove the footnotes: lines that start with a marker like 〔12〕, and the markers 〔12〕 inside the text. Keep only Chinese characters.

Step 3 - tokenize with jieba. Keep words of two or more characters, and remove stopwords with qhchina's load_stopwords("zh_sim"). Drop documents with fewer than 100 tokens.

Step 4 - train qhchina.analytics.topicmodels.LDAGibbsSampler with 10 topics (iterations=200, random_state=42, min_word_count=5). Each document is one text.
For each topic, print the top 10 words and the 2 most typical documents (title and year).</pre>
</div>
<p>Run it, check the output of each step, and read the topics. Then try Prompt 2 to add the time dimension.</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>Using the trained model, compute for each decade (1920s-1970s) the average topic proportion over the documents of that decade, and plot it as a stacked bar chart (one color per topic, with a legend that shows the topic number and its top 3 words). Make sure Chinese characters display correctly (qhchina provides font helpers in qhchina.helpers). Save the figure as topics_by_decade.png and show me the table of numbers too.</pre>
</div>

<h2>4. Interpret the results</h2>
<p>Results vary a little with the random seed, but with 10 topics you will typically see vocabularies like these (the names are ours, not the model’s):</p>
<ul>
<li>war against Japan, the united front, the Nationalist government (抗日, 统一战线, 国民党, 反共)</li>
<li>the civil war and negotiations with Chiang Kai-shek (蒋介石, 内战, 和平, 军队)</li>
<li>land reform, cooperatives, and agricultural production (土地改革, 合作社, 农业, 生产)</li>
<li>class struggle and the Cultural Revolution (无产阶级, 资产阶级, 文化大革命, 斗争)</li>
<li>international relations: the United States, the Soviet Union, imperialism (美国, 苏联, 帝国主义)</li>
<li>generic party language: 同志, 工作, 问题, 错误, 干部</li>
</ul>
<p>Questions for discussion:</p>
<ul>
<li>Which topics can you name with confidence? Which are vague, and why? (Several topics may be mostly <em>genre</em> vocabulary, such as how speeches and directives address comrades, rather than a theme.)</li>
<li>Open the most typical documents of two topics and read them. Does your name for the topic still fit?</li>
<li>In the chart by decade, which topics rise and fall? Do the shifts match what you know about the history of the period? Which shifts surprise you, and which might be artifacts of <em>which texts the editors chose to include</em> for each decade?</li>
<li>The documents differ enormously in length (a telegram versus a long essay). How might that affect the topics? What would change if we split every text into chunks of 500 words and used the chunks as documents?</li>
</ul>
<p>Then experiment (each change is one sentence to the assistant) and compare the results:</p>
<ul>
<li>change the number of topics to 5 and to 20: which topics merge or split?</li>
<li>add generic words (for example 同志, 问题, 工作) to the stopword list, and see which topics become clearer</li>
<li>change <code>alpha</code> or <code>beta</code> (see the Week 7 slides), or use chunks of about 500 words as documents</li>
<li>rerun with a different <code>random_state</code>: which topics are stable, and which are not?</li>
</ul>

<h2>5. What a topic model can and cannot tell a historian</h2>
<ul>
<li>A topic is a <strong>pattern of co-occurring words</strong>, not an argument, a theme, or an intention. Our label is an interpretation and shapes how we read the result.</li>
<li>The result depends on <strong>choices</strong> we made: the unit of a document, tokenization, stopwords, K, and the random seed. Document all of them (your repo and README are the record).</li>
<li>Always <strong>go back to the texts</strong>: use the topic proportions to select documents for close reading, and judge the topics by what you find there.</li>
</ul>

<h2>Readings</h2>
<ul>
<li>Ted Underwood, <a href="https://tedunderwood.com/2012/04/07/topic-modeling-made-just-simple-enough/">“Topic Modeling Made Just Simple Enough”</a> (2012)</li>
<li>(optional) David M. Blei, “Probabilistic Topic Models” (2012)</li>
</ul>
