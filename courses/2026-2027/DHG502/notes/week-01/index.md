---
layout: default
title: DHG 502 Week 1 Notes
---

<p class="updated">Last updated: Sep 7, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 1 — Introduction</h1>

<h2>1. Set up your computer</h2>
<p>Complete the <a href="../../#preliminary-setup">preliminary setup</a> from the syllabus <strong>before</strong> the first seminar. MA students must use their own computers.</p>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account, then create a new public repository named <code>dhg502</code> (initialize it with a <code>README.md</code>).</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>dhg502</code>). Do not put the key in a repository or share it with others.</li>
<li>Install <a href="https://www.python.org/downloads/">Python</a>, <a href="https://code.visualstudio.com/">Visual Studio Code (VS Code)</a>, and then <a href="https://opencode.ai/">OpenCode</a>.</li>
<li>Install <a href="https://www.google.com/chrome/">Google Chrome</a> or <a href="https://www.microsoft.com/edge">Microsoft Edge</a>.</li>
<li>Clone your <code>dhg502</code> repository to your computer and open the folder in VS Code (<strong>File → Open Folder</strong>).</li>
</ol>

<h2>2. Connect OpenCode</h2>
<p>Use the API key you collected at registration. Never write the key into your repository or share it.</p>
<ol>
<li>In the VS Code terminal (<strong>Terminal → New Terminal</strong>), type <code>opencode</code> and press Enter.</li>
<li>Type <code>/connect</code> and press Enter.</li>
<li>Search for and select <strong>OpenRouter</strong>.</li>
<li>Paste your API key when prompted.</li>
<li>Type <code>/models</code> and press Enter.</li>
<li>Select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2>3. In-class exercise</h2>
<p>Download <a href="明史.txt">明史.txt</a> and place it in the root folder of your <code>dhg502</code> repository. This is the standard <em>History of Ming</em> (明史) in classical Chinese, traditional characters, UTF-8.</p>
<p>When the file is in place, copy the following prompt in full and paste it into OpenCode:</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Task: Build a character-level LDA topic model on the Ming Dynasty history (明史.txt) using qhchina.

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

Output:
- Produce a .txt file (e.g. 明史_topics.txt) listing all 20 topics, each with its top 20 words (word + probability), plus a short header (corpus, number of segments, topics, iterations).</pre>
</div>

<p>When it finishes, check the result: open <code>明史_topics.txt</code> in VS Code and inspect the 20 topics and their top characters.</p>
<p>Then copy the following prompt and paste it into OpenCode:</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>make it into HTML, show 3 top documents per topic (lda.get_document_topics(doc_id=0, sort_by_prob=True))</pre>
</div>
<p>When the HTML file is generated, open it in Chrome or Edge (in VS Code, right-click the file and select <strong>Reveal in File Explorer</strong> / <strong>Open in Finder</strong>, then double-click it). You should see a page listing each of the 20 topics with its top characters and the three segments of the <em>明史</em> where that topic is strongest.</p>

<h2>4. Save to GitHub</h2>
<p>Commit and push your work to your repository. Three options, choose one:</p>
<ol>
<li><strong>VS Code buttons:</strong> click the Source Control icon on the left (the branch icon). Write a short message (e.g. <code>first commit</code>), then click <strong>Commit</strong>. Then click <strong>Sync Changes</strong> to push.</li>
<li><strong>Terminal:</strong> if you are still in OpenCode, type <code>/exit</code> to leave it, then run in the VS Code terminal:
<pre>git add -A
git commit -m "first commit"
git push</pre>
</li>
<li><strong>Ask the coding assistant:</strong> in OpenCode, ask it to commit and push for you. Copy the following prompt in full and paste it into OpenCode:
<div class="prompt">
<p class="prompt-label">Prompt 3</p>
<pre>Commit all changes with the message "first commit", then push to GitHub.</pre>
</div>
</li>
</ol>
