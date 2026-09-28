---
layout: default
title: DHG502 Assignment 1
---

<p class="updated">Last updated: Sep 28, 2026</p>
<p><a href="../">Assignments</a> · <a href="../../">DHG 502 syllabus</a></p>
<h1>Assignment 1: The Company Words Keep in the <em>Mingshi</em> (15%)</h1>

<p><strong>Due:</strong> 12 Oct, 9:00 am</p>
<p>Use the collocation methods learned in class to examine how the <em>Mingshi</em> 明史 (<em>History of the Ming</em>) represents one person, group, institution, or concept. You may use the whole text (<code>明史.txt</code> from the course template), a clearly defined part of it (for example the biographies, 列傳), or, with the instructor’s approval, another historical source such as the <em>Shiji</em> 史記.</p>
<p>The <em>Mingshi</em> is not a neutral record. It was compiled at the Qing court over several decades and completed in 1739, and its compilers decided who received a biography, in which category (loyal officials, eunuchs, treacherous officials, rebels …), and in what words. This assignment asks: <em>What can collocations tell us about the way an official history frames the people and groups it describes?</em> The words that cooccur with a name or a term more often than chance would predict are one way of tracing what the compilers attached to it: actions, offices, places, relationships, and moral judgments. Possible targets include 魏忠賢, 張居正, 海瑞, 宦官, 倭, 流賊, 錦衣衛, or 巡撫; you may choose your own.</p>

<p>On Moodle, submit the URL of your GitHub repository and a PDF of your report. Everything needed to read and reproduce your work should live in the repository, which must include:</p>
<ul>
<li><code>README.md</code> with your name, research question, the source and its metadata and rights, the source URL, and exact instructions for running the analysis (do not put your student ID in a public repository)</li>
<li><code>data/</code> with the source as plain-text UTF-8 file(s); if you use only part of the <em>Mingshi</em>, say which part and how you selected it</li>
<li><code>userdict.txt</code>, the jieba user dictionary you used</li>
<li>Python script(s) (<code>.py</code>) that process the text and run the collocation analysis</li>
<li><code>output/collocates_*.csv</code> (one CSV per run; see the method requirements below)</li>
<li><code>output/results.html</code> (a single page showing all your collocation tables together, for easy comparison)</li>
<li><code>output/kwic.html</code> (concordance lines for the collocates you discuss)</li>
<li><code>report.md</code> <strong>and</strong> <code>report.pdf</code> (the same report in both formats), <strong>800–1,200 words in English</strong></li>
<li><code>AI-USE.md</code> following the <a href="../">course-wide requirements</a></li>
<li><code>requirements.txt</code> listing the packages the analysis needs</li>
</ul>

<h2>Method requirements</h2>
<ul>
<li>Use <code>find_collocates</code> from qhchina (<code>qhchina.analytics.collocations.find_collocates</code>) with the arguments learned in class (target word(s), method/horizon, filters, measures, etc.).</li>
<li>Convert the source to simplified Chinese characters with <code>opencc</code> <strong>before</strong> splitting it into sentences and segmenting it with jieba, and write your target word(s) in simplified characters.</li>
<li>Load a jieba <strong>user dictionary</strong> (<code>userdict.txt</code>) with the names, offices, and terms your question depends on, and check a sample of the segmented sentences by eye. Report what you checked and what problems remained.</li>
<li>Remove stopwords with <code>load_stopwords("zh_cl_sim")</code> from qhchina (classical Chinese, simplified characters). You may add your own stopwords; if you do, list them and explain why.</li>
<li>Focus on words of two or more characters: set <code>min_word_length</code> to at least 2 in the <code>filters</code> argument.</li>
<li>Keep only statistically significant collocates: use <code>correction="fdr_bh"</code> and set <code>max_adjusted_p</code> to 0.05 in the <code>filters</code> argument.</li>
<li>Report both a <strong>significance</strong> measure and a <strong>strength</strong> measure: add <code>measures=["log_likelihood", "logDice"]</code>, and compare the ranking by <code>log_likelihood</code> with the ranking by <code>log_dice</code>.</li>
<li>Explore your results <strong>iteratively</strong>: run <code>find_collocates</code> more than once with different settings before settling on your interpretation. Try at least two window sizes (e.g. <code>horizon=5</code> and <code>horizon=10</code>) with <code>method="window"</code>, and also <code>method="sentence"</code>. Save each run to its own CSV and build a simple HTML page that puts all the tables together. Your report should reflect this process of exploration, not just the output of a single run.</li>
<li>Go back to the text: use <code>kwic</code> from qhchina to read the passages behind at least <strong>five</strong> of the collocates you discuss, and cite passages by 卷 (juan) where possible.</li>
</ul>

<h2>Report</h2>
<p>The report (800–1,200 words in English) should read as a short, well-argued essay rather than a checklist.</p>
<ul>
<li><strong>Question and source.</strong> State your question and why it matters. Introduce the source: which text or part of it you used, where it came from, its rights status, and roughly how many characters or tokens it contains. Say briefly what kind of source the <em>Mingshi</em> is and why that matters for your question.</li>
<li><strong>Processing.</strong> Describe how you processed the text: conversion, sentence splitting, segmentation, the user dictionary, stopwords, and the segmentation problems you found.</li>
<li><strong>Method.</strong> Explain your statistical setup in terms a historian can follow: how the contingency table is built, what a p-value from Fisher’s exact test tells you, why you corrected for multiple testing, why you chose the test direction (<code>alternative</code>) you did, and the difference between the significance measure (log-likelihood) and the strength measure (logDice).</li>
<li><strong>Results.</strong> Present your main results, with a small table or visualization if it helps. Say how the collocates changed across window sizes and methods, and where the two rankings disagreed.</li>
<li><strong>Interpretation.</strong> Why is your target surrounded by these words and not others? Use close reading of specific passages to support, qualify, or correct what the numbers suggest. Bring your findings into conversation with at least one scholarly work on your topic or on the compilation of the <em>Mingshi</em>.</li>
<li><strong>Limitations.</strong> What would a different window size, target word, segmentation, or source have changed? What are the limits of reading an official history through collocations alone, and whose perspective do your results capture?</li>
</ul>
<p>You may use AI to help with code and troubleshooting, but the analytical prose must be your own work (see the <a href="../">submission rules</a>). A report that is fully AI-generated will receive <strong>0 points</strong>. If there is any doubt, the instructor may ask you to explain your workflow individually, to confirm that you understand your own analysis.</p>
<p>Once your analysis is finished, <strong>commit</strong> and <strong>push</strong> everything (data, scripts, user dictionary, CSVs, HTML pages, the report in both <code>.md</code> and <code>.pdf</code>, and <code>AI-USE.md</code>) to your repository, and upload the same PDF to Moodle.</p>

<h2>Marking criteria</h2>
<ul>
<li><strong>Source and data documentation (20%):</strong> complete citation, provenance, rights, and transparent processing decisions, including segmentation checks</li>
<li><strong>Method and code (25%):</strong> a correct, readable workflow that creates the required outputs and meets the method requirements</li>
<li><strong>Statistical reasoning (15%):</strong> a clear explanation of the contingency table, Fisher’s test, multiple-testing correction, and the difference between significance and strength</li>
<li><strong>Historical interpretation (30%):</strong> a focused argument connecting collocational patterns to specific passages, engaging with scholarship, and acknowledging uncertainty</li>
<li><strong>Reproducibility and AI disclosure (10%):</strong> usable instructions, dependencies, an organized repository, and a complete <code>AI-USE.md</code></li>
</ul>

<p>For the segmentation, collocation, and concordance workflow (including example prompts you can adapt), see the <a href="../../notes/week-04/">Week 4 notes</a>.</p>
