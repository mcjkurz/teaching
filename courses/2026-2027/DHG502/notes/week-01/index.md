---
layout: default
title: DHG 502 Week 1 Notes
---

<p class="updated">Last updated: Sep 7, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 1 — Introduction</h1>

<p>Complete the <a href="../../#preliminary-setup">preliminary setup</a> from the syllabus before the first seminar. Two paths are offered below:</p>
<ul>
<li><strong>(a) Local computer</strong> — install the tools on your laptop.</li>
<li><strong>(b) Browser (GitHub Codespaces)</strong> — no installation; <strong>recommended if you have little experience</strong>.</li>
</ul>

<h2>1. Set up</h2>
<p>Both paths start the same way:</p>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account.</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>dhg502</code>). Keep it private.</li>
<li>Go to <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>, click <strong>Use this template</strong>, and create your own repository named <code>dhg502</code>. It already contains <code>明史.txt</code> and the packages you need.</li>
</ol>
<p>Then continue with your chosen path:</p>
<ul>
<li><strong>(a) Local:</strong> install <a href="https://www.python.org/downloads/">Python</a>, <a href="https://code.visualstudio.com/">VS Code</a>, <a href="https://opencode.ai/">OpenCode</a>, and <a href="https://www.google.com/chrome/">Chrome</a> or <a href="https://www.microsoft.com/edge">Edge</a>. Clone the <code>dhg502</code> repo and open it in VS Code (<strong>File → Open Folder</strong>).</li>
<li><strong>(b) Browser:</strong> in your new repo, click <strong>Code → Codespaces → Create codespace</strong>. First startup takes a few minutes; everything runs in the browser.</li>
</ul>

<h2>2. Connect OpenCode</h2>
<ol>
<li>Open a terminal:
<ul>
<li><strong>(a) Local:</strong> in VS Code, <strong>Terminal → New Terminal</strong>.</li>
<li><strong>(b) Browser:</strong> use the terminal in the Codespace window.</li>
</ul>
</li>
<li>Type <code>opencode</code>, then <code>/connect</code>, select <strong>OpenRouter</strong>, and paste your API key.</li>
<li>Type <code>/models</code> and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2>3. In-class exercise</h2>
<p><code>明史.txt</code> (the <em>History of Ming</em>, classical Chinese, traditional characters, UTF-8) is already in your repo from the template. Paste the following into OpenCode:</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Task: Build a character-level LDA topic model on the Ming Dynasty history (明史.txt) using qhchina, and find the top 20 words for each topic.

Corpus &amp; preprocessing:
- Input file: 明史.txt (UTF-8, classical Chinese in traditional characters).
- Split the text into segments of 1000 characters each; each segment = one document.
- Assume one character = one word (no tokenization/segmentation; treat every single character as a token).
- Remove stopwords BEFORE running the model, using qhchina's load_stopwords("zh_cl_tr") (classical Chinese, traditional characters). Also drop whitespace.

Model:
- Use LDAGibbsSampler from qhchina (e.g. from qhchina import LDAGibbsSampler, load_stopwords).
- Number of topics = 20.
- Usage pattern:
    from qhchina.analytics import LDAGibbsSampler
    documents = [segmented doc 1, segmented doc 2, ...]   # each doc is a list of single characters
    lda = LDAGibbsSampler(n_topics=20, iterations=100, random_state=42, min_word_count=2, stopwords=stopwords)
    lda.fit(documents)
    topics = lda.get_topics(n_words=20)
    # to get the top words for a single topic, you can also use:
    # lda.get_topic_words(topic_id, n_words=20)

Output:
- Produce a .txt file (e.g. 明史_topics.txt) listing all 20 topics, each with its top 20 words (word + probability), plus a short header (corpus, number of segments, topics, iterations).
- For each topic, also list the 3 top documents (segments) for that topic, i.e. the segments where the topic is strongest (lda.get_document_topics(doc_id=0, sort_by_prob=True)).</pre>
</div>
<p>Open <code>明史_topics.txt</code> and check the 20 topics, their top characters, and the strongest segments. Then paste:</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>Build on the 明史_topics.txt results file from the previous step. Do not re-run the topic model; read that file and work from it.

For each of the 20 topics, look at its top 20 words and:
- write a short label (2-4 words) naming what the topic seems to be about;
- write a one-to-two sentence explanation of what these characters have in common and what the topic likely represents in the 明史.

Then create a single, well-styled HTML page (明史_topics.html) that shows, for each topic:
- the topic number and your label and explanation;
- the top 20 words with their probabilities;
- the 3 top documents (segments) for that topic.

Take all of this from 明史_topics.txt.</pre>
</div>
<p>Open <code>明史_topics.html</code> in Chrome or Edge:</p>
<ul>
<li><strong>(a) Local:</strong> double-click the file on your computer.</li>
<li><strong>(b) Browser:</strong> if it won't open in the Codespace, right-click → <strong>Download</strong>, then open on your computer.</li>
</ul>
<p>You should see each of the 20 topics with a label, explanation, top characters, and strongest segments.</p>

<h2>4. Save to GitHub</h2>
<p>Commit and push so your work is preserved — anything not pushed lives only in your Codespace (or on your laptop) and is lost if that environment is deleted. Three options:</p>
<ol>
<li><strong>Buttons:</strong> Source Control icon (left) → message (e.g. <code>first commit</code>) → <strong>Commit</strong> → <strong>Sync Changes</strong> / <strong>Push</strong>.</li>
<li><strong>Terminal:</strong> <code>/exit</code> OpenCode, then:
<pre>git add -A
git commit -m "first commit"
git push</pre>
</li>
<li><strong>Ask the assistant:</strong> paste into OpenCode:
<div class="prompt">
<p class="prompt-label">Prompt 3</p>
<pre>Commit all changes with the message "first commit", then push to GitHub.</pre>
</div>
</li>
</ol>
