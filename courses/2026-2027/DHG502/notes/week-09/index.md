---
layout: default
title: DHG 502 Week 9 Notes
---

<p class="updated">Last updated: Nov 9, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 9 — Word Vectors and Conceptual History</h1>

<h2>1. Recap</h2>
<p>A <strong>word vector</strong> represents a word by the company it keeps (Firth, Harris). word2vec learns one vector per word from a corpus, and we compare two words with <strong>cosine similarity</strong>. Today we use these vectors in two ways: to measure an <strong>association</strong> inside one corpus (for example, how strongly a word leans towards 女 or 男), and to measure <strong>change</strong> between two periods with temporal referencing.</p>
<p>Both exercises use fiction from the <a href="https://github.com/mcjkurz/qhchina-data/tree/main/corpora/epochs_normalized">qhchina-data</a> collection (simplified characters): <code>late_qing</code> (晚清, 73 novels) and <code>republican</code> (民国, 76 novels). Novels are historical sources too, but they are a particular kind of source: keep in mind who wrote them, for whom, and in which genres.</p>

<h2>2. Get the data</h2>
<p>Open your <code>dhg502</code> repo in your AI coding assistant and paste Prompt 1. Tokenizing takes about a minute.</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Run pip install qhchina jieba.

Download all .txt files from these two folders of the GitHub repo mcjkurz/qhchina-data (use the GitHub API to list the files, then download the raw files):
  corpora/epochs_normalized/late_qing
  corpora/epochs_normalized/republican
Save them to data/late_qing/ and data/republican/.

For each period, read the files in a fixed random order (random.seed(0)) until about 12 million characters, split the text into sentences at 。！？ and line breaks, tokenize each sentence with jieba, and drop punctuation tokens. Save the result as tokens.pkl: a dict {"late_qing": [[tokens], ...], "republican": [[tokens], ...]}. Print the number of sentences and tokens per period.</pre>
</div>

<h2>3. Exercise 1: gender associations in two periods</h2>
<p>We train <strong>one model per period</strong> and build a 女 − 男 direction from word pairs, as on the bonus slides. Each word gets a score: positive leans towards 女, negative towards 男. Because we compare scores <em>within</em> each model, the two models do not need to be aligned.</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>Load tokens.pkl. For each period, train qhchina.analytics.Word2Vec(sentences, vector_size=100, window=5, min_word_count=10, sg=1, negative=5, epochs=3, workers=4), once with seed=1 and once with seed=2 (four models in total). Save them in models/.

Anchor pairs (female, male): 女人/男人, 母亲/父亲, 妻子/丈夫, 女儿/儿子, 姐姐/哥哥, 妹妹/弟弟, 太太/老爷, 小姐/少爷, 妇人/汉子, 女子/男子, 娘/爹. Skip a pair if either word is missing from a model, and print which pairs were skipped.

Target words: 读书 做官 赚钱 生意 打仗 针线 做饭 哭 美丽 聪明 勇敢 温柔 学校 自由 恋爱 革命 工作 社会 国家 眼泪 力气

Use qhchina.analytics.vectors.calculate_bias(anchor_pairs, targets, model) to score the targets in each of the four models. Print a table: one row per word, columns late_qing seed1, late_qing seed2, republican seed1, republican seed2. Mark a word as "unstable" if its two seeds in the same period disagree in sign.

Then plot the scores (average of the two seeds) as a dot plot: one row per word, one dot per period, sorted by the republican score. Make sure Chinese displays correctly (see qhchina.helpers for fonts). Save it as gender_bias.png.</pre>
</div>
<p>Pick two words whose score moves between the periods (for example 恋爱 or 国家) and read how they are used:</p>
<div class="prompt">
<p class="prompt-label">Prompt 3</p>
<pre>Using qhchina.analytics.kwic, show 10 random concordance lines (horizon=15) for 恋爱 and for 国家 in each period.</pre>
</div>

<h3>Discuss</h3>
<ul>
<li>Which words lean towards 女 or 男 in both periods? Which ones move? Does the movement fit what you know about the late Qing and the May Fourth era?</li>
<li>Which words are “unstable” across seeds? We do not interpret those.</li>
<li>We did not use the pair 她 / 他. Why not? (Hint: when was 她 invented, and by whom?)</li>
<li>A score describes how these <em>novels</em> use a word. Whose view of gender do they record?</li>
</ul>

<h2>4. Exercise 2: has the meaning changed? Temporal referencing with a noise check</h2>
<p>Here we train <strong>one model on both periods</strong> with <code>TempRefWord2Vec</code>. Each target word gets one vector per period (经济_late_qing, 经济_republican), and change = 1 − cosine between them. Every number contains some <strong>noise</strong>, so we measure the noise first: we shuffle the sentences of the two periods, split them at random into two fake periods A and B, and train again. In the fake periods no word has really changed, so whatever “change” the model reports there is noise.</p>
<div class="prompt">
<p class="prompt-label">Prompt 4</p>
<pre>Load tokens.pkl.

Targets: 革命 自由 社会 经济 文明 国家 同志 小姐 先生 学生 政治 科学 银行 火车 朋友 母亲 皇帝 百姓, plus four control words that we expect to be stable: 眼睛 吃饭 山 马.

Train qhchina.analytics.TempRefWord2Vec(sentences={"late_qing": ..., "republican": ...}, targets=targets, vector_size=100, window=5, min_word_count=10, sg=1, negative=5, epochs=3, workers=4) three times:
  (a) real periods, seed=1
  (b) real periods, seed=2
  (c) shuffled control: pool all sentences of both periods, shuffle them (random.seed(0)), split them in half into two fake periods "A" and "B", seed=1.
For each run and each target w, compute change = 1 − cosine(model.get_vector(f"{w}_{period1}"), model.get_vector(f"{w}_{period2}")). Skip targets that do not occur in a period.

Print one table sorted by change in run (a): word, change (a), change (b), change (c). Also print the largest change found in run (c) and call it the noise ceiling.

Then, for the five words with the largest change in (a), print model.most_similar for both time-tagged tokens (topn=10) and the first 8 words that the word moved towards and away from according to model.calculate_semantic_change(word).</pre>
</div>

<h3>Discuss</h3>
<ul>
<li>Which words stay above the noise ceiling in <em>both</em> seeds? Only these are candidates for change.</li>
<li>Read the neighbours of 经济, 革命, and 同志 in each period. What kind of change do they suggest? Check your reading with <code>kwic</code> (Prompt 3, with your own words).</li>
<li>Look at the control words 山 and 马. Did they really change their meaning? If not, what else differs between these two collections of novels? (Think of genre.)</li>
<li>What would we need to say something about the <em>language</em> of the period rather than about these two collections of novels?</li>
</ul>
<p>Remember: a number tells you <em>where to look</em>; it does not tell you what happened. Use the vectors to find candidates, then read the passages.</p>

<h2>Readings</h2>
<ul>
<li>Daniel Jurafsky and James H. Martin, “Vector Semantics and Embeddings”</li>
<li>Austin C. Kozlowski, Matt Taddy, and James A. Evans, “The Geometry of Culture: Analyzing the Meanings of Class through Word Embeddings,” <em>American Sociological Review</em> 84, no. 5 (2019)</li>
<li>(optional) Haim Dubossarsky, Simon Hengchen, Nina Tahmasebi, and Dominik Schlechtweg, “Time-Out: Temporal Referencing for Robust Modeling of Lexical Semantic Change” (ACL 2019)</li>
<li>(optional) William L. Hamilton, Jure Leskovec, and Dan Jurafsky, “Diachronic Word Embeddings Reveal Statistical Laws of Semantic Change” (ACL 2016)</li>
</ul>
