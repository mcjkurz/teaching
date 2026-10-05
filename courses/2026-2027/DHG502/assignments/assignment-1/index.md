---
layout: default
title: DHG502 Assignment 1
---

<p class="updated">Last updated: Oct 6, 2026</p>
<p><a href="../">Assignments</a> · <a href="../../">DHG 502 syllabus</a></p>
<h1>Assignment 1: The Company Words Keep in Official Histories (15%)</h1>

<p><strong>Due:</strong> 13 Oct, 9:00 am</p>
<p>Use the collocation methods from class to examine how an official history (正史) represents one person, group, institution, or concept. The history may be premodern or modern, whole or in part. You may also compare two histories. Official histories are not neutral records: their compilers chose who to include and in what words. Ask what the words around your target suggest about that framing.</p>

<p>On Moodle, submit the URL of your GitHub repository and a PDF of your report. Do not put your name or student ID anywhere in the repository. The repository must include:</p>
<ul>
<li><code>README.md</code> with your research question, the source(s) (citation, where you got them, rights, and URL), and exact instructions for running the analysis</li>
<li><code>data/</code> with the source(s) as plain-text UTF-8; if you use only part of a text, say which part and how you selected it</li>
<li>Python script(s) that prepare the text and run the analysis</li>
<li>the collocation results, one file per run, and a simple HTML page for comparing them</li>
<li>concordance lines for the collocates you discuss</li>
<li><code>report.md</code>, the same report as the PDF, <strong>1,000–1,500 words in English</strong></li>
<li><code>AI-USE.md</code> following the <a href="../">course-wide requirements</a></li>
<li><code>requirements.txt</code></li>
</ul>

<h2>Method</h2>
<p>Use <code>find_collocates</code> from qhchina. Choose the settings that fit your source and your question, and explain those choices. In particular:</p>
<ul>
<li>Prepare the text so that segmentation is trustworthy (character conversion, a user dictionary, stopwords, and so on, as needed). Check a sample by eye and say what problems remained.</li>
<li>Decide which collocates to keep. Filters such as word length, frequency, and significance depend on the language and the size of the text. In classical Chinese, a minimum length of two characters will drop many real words.</li>
<li>Report one <strong>significance</strong> measure and one <strong>strength</strong> measure, and compare the two rankings.</li>
<li>Run the analysis more than once, changing how “near” is defined (for example the window size, or a window versus the sentence). Save each run. Your interpretation should come from comparing them, not from a single run.</li>
<li>Read the passages behind the collocates you discuss, and cite them so a reader can find them in the source.</li>
</ul>

<h2>Report</h2>
<p>Write 1,000–1,500 words in English, as a short essay:</p>
<ul>
<li><strong>Question and source.</strong> Your question, which text or part you used, its origin, rights, and size, and why the way it was compiled matters.</li>
<li><strong>Processing and method.</strong> How you prepared the text, and why you chose your window, filters, and measures. Explain, in terms a historian can follow, how the contingency table is built, what a p-value tells you, and how significance differs from strength.</li>
<li><strong>Results and interpretation.</strong> What you found, how the results changed across runs, and where the two rankings disagreed. Use close reading to support or qualify the numbers, and cite at least one scholarly work.</li>
<li><strong>Limitations.</strong> What a different window, target, segmentation, or source might have changed, and what collocations alone cannot show.</li>
</ul>
<p>You may use AI for code and troubleshooting. The analytical prose must be your own (see the <a href="../">submission rules</a>). A fully AI-generated report receives <strong>0 points</strong>. The instructor may ask you to explain your analysis.</p>

<h2>Marking criteria</h2>
<ul>
<li><strong>Source and documentation (20%):</strong> citation, provenance, rights, and a clear account of how you prepared the text</li>
<li><strong>Method and code (25%):</strong> a readable workflow whose settings fit the source and the question</li>
<li><strong>Statistical reasoning (15%):</strong> contingency table, significance, and the difference between significance and strength</li>
<li><strong>Historical interpretation (30%):</strong> an argument that connects the collocates to passages and to scholarship</li>
<li><strong>Reproducibility and AI disclosure (10%):</strong> instructions that work, an organized repository with no personal identifiers, and a complete <code>AI-USE.md</code></li>
</ul>

<p>The workflow from class is in the <a href="../../notes/week-04/">Week 4 notes</a>.</p>
