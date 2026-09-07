---
layout: default
title: DHG 502 Week 1 Notes
---

<p class="updated">Last updated: Sep 7, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Week 1 — Introduction</h1>

<p>Complete the <a href="../../#preliminary-setup">preliminary setup</a> from the syllabus <strong>before</strong> the first seminar. MA students must use their own computers. There are two ways to work through the exercises below:</p>
<ul>
<li><strong>(a) Local computer</strong> — install the tools on your own laptop. Choose this if you are comfortable installing software and using a terminal.</li>
<li><strong>(b) Browser (GitHub Codespaces)</strong> — work entirely in the browser, with no local installation. <strong>Recommended if you have little experience</strong>; it is the smoothest way to get started and you can switch to a local setup later.</li>
</ul>
<p>Both paths lead to the same in-class exercise. Pick one and follow its steps in section 1, then continue with sections 2–4, which are the same for both.</p>

<h2>1. Set up your environment</h2>

<h3>1(a). Local computer</h3>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account, then create a new public repository named <code>dhg502</code> (initialize it with a <code>README.md</code>).</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>dhg502</code>). Do not put the key in a repository or share it with others.</li>
<li>Install <a href="https://www.python.org/downloads/">Python</a>, <a href="https://code.visualstudio.com/">Visual Studio Code (VS Code)</a>, and then <a href="https://opencode.ai/">OpenCode</a>.</li>
<li>Install <a href="https://www.google.com/chrome/">Google Chrome</a> or <a href="https://www.microsoft.com/edge">Microsoft Edge</a>.</li>
<li>Clone your <code>dhg502</code> repository to your computer and open the folder in VS Code (<strong>File → Open Folder</strong>).</li>
</ol>

<h3>1(b). Browser (GitHub Codespaces) — recommended for beginners</h3>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account.</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>dhg502</code>). Do not put the key in a repository or share it with others.</li>
<li>Go to the template repository <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>, click <strong>Use this template</strong>, and create your own repository (do not edit the template directly). Name it <code>dhg502</code>.</li>
<li>Open your new repository, click <strong>Code → Codespaces → Create codespace</strong>. The first startup takes a few minutes while packages install. No software is installed on your computer; everything runs in the browser.</li>
</ol>

<h2>2. Connect OpenCode</h2>
<p>Use the API key you collected at registration. Never write the key into your repository or share it.</p>
<ol>
<li>Open a terminal:
<ul>
<li><strong>(a) Local:</strong> in VS Code, open the terminal (<strong>Terminal → New Terminal</strong>).</li>
<li><strong>(b) Browser:</strong> in your Codespace, open the terminal in the Codespace window.</li>
</ul>
</li>
<li>Type <code>opencode</code> and press Enter.</li>
<li>Type <code>/connect</code> and press Enter.</li>
<li>Search for and select <strong>OpenRouter</strong>.</li>
<li>Paste your API key when prompted.</li>
<li>Type <code>/models</code> and press Enter.</li>
<li>Select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2>3. In-class exercise</h2>
<p>Download <a href="明史.txt">明史.txt</a> and place it in the root folder of your working directory. This is the standard <em>History of Ming</em> (明史) in classical Chinese, traditional characters, UTF-8.</p>
<ul>
<li><strong>(a) Local:</strong> save the file into your <code>dhg502</code> repository folder (the one you opened in VS Code).</li>
<li><strong>(b) Browser:</strong> drag the downloaded file into the Codespace file explorer to upload it, or download it directly into the Codespace using the terminal.</li>
</ul>
<p>When the file is in place, copy the following prompt in full and paste it into OpenCode:</p>
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

Output:
- Produce a .txt file (e.g. 明史_topics.txt) listing all 20 topics, each with its top 20 words (word + probability), plus a short header (corpus, number of segments, topics, iterations).</pre>
</div>

<p>When it finishes, check the result: open <code>明史_topics.txt</code> and inspect the 20 topics and their top characters.</p>
<p>Then copy the following prompt and paste it into OpenCode:</p>
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>Now explain the topics and present them in a nice HTML page.

For each of the 20 topics, look at its top 20 words from 明史_topics.txt and:
- write a short label (2-4 words) naming what the topic seems to be about;
- write a one-to-two sentence explanation of what these characters have in common and what the topic likely represents in the 明史.

Then build a single, well-styled HTML page that shows, for each topic:
- the topic number and your label and explanation;
- the top 20 words with their probabilities;
- the 3 top documents (segments) for that topic, i.e. the segments where the topic is strongest (lda.get_document_topics(doc_id=0, sort_by_prob=True)).

Save the page as 明史_topics.html.</pre>
</div>
<p>When the HTML file is generated, open it in Chrome or Edge:</p>
<ul>
<li><strong>(a) Local:</strong> in VS Code, right-click the file and select <strong>Reveal in File Explorer</strong> / <strong>Open in Finder</strong>, then double-click it.</li>
<li><strong>(b) Browser:</strong> HTML often will not open inside the Codespace; right-click the file, select <strong>Download</strong>, then open it on your computer.</li>
</ul>
<p>You should see a page listing each of the 20 topics with a short label and explanation, its top characters, and the three segments of the <em>明史</em> where that topic is strongest.</p>

<h2>4. Save to GitHub</h2>
<p>Commit and push your work so that your changes are preserved in your repository. If you used a Codespace, closing the browser or stopping the Codespace does not delete your files immediately: GitHub removes Codespaces only after they have been idle for a number of days. Until then, uncommitted changes are kept. But once a Codespace is deleted, anything not pushed to your repository is lost, so always commit and push when you finish. The same applies to local work: anything not committed and pushed lives only on your computer.</p>
<p>Three options, choose one:</p>
<ol>
<li><strong>Buttons:</strong> click the Source Control icon on the left (the branch icon). Write a short message (e.g. <code>first commit</code>), then click <strong>Commit</strong>. Then click <strong>Sync Changes</strong> (local) or <strong>Push</strong> (Codespaces) to push.</li>
<li><strong>Terminal:</strong> if you are still in OpenCode, type <code>/exit</code> to leave it, then run:
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
