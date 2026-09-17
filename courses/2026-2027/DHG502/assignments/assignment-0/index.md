---
layout: default
title: DHG502 Assignment 0
---

<p class="updated">Last updated: Sep 17, 2026</p>
<p><a href="../">Assignments</a> · <a href="../../">DHG 502 syllabus</a></p>
<h1>Assignment 0 (not graded)</h1>

<p><strong>Due:</strong> 23 Sep, 9:00 am</p>
<p>This exercise is not graded. Its purpose is to check that the whole workflow — repository, Codespace, AI coding assistant, and published page — functions before the graded work begins. For this assignment, please complete the following steps:</p>
<ol>
<li>Create a new <strong>GitHub repository</strong> and open it in <strong>Codespaces</strong>.</li>
<li>Using the method taught in class, call the <strong>GLM-5.3-Flash</strong> model through <strong>OpenCode</strong> (with your own API key from <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a>, class code <code>dhg502</code>). Never commit your key to the repository.</li>
<li>Find a <strong>historical source</strong> in plain text — for example the <em>Mingshi</em> 明史 (<em>History of the Ming</em>), or another source of your choosing — and ask the model to suggest several ways of analyzing it. For instance:
<ul>
<li>the <strong>most frequent words</strong> in the source</li>
<li>a more targeted question, such as extracting the names of all the <strong>treacherous officials</strong> 奸臣 recorded in the source</li>
<li>how often particular people, places, or official titles are mentioned, and how that distribution changes across the text</li>
</ul>
<p>The analysis can be very simple or somewhat more complex — that is up to you. What matters is that you can explain what the code did and judge whether the result is plausible.</p>
</li>
<li>Once the analysis is finished, you will have a <code>.py</code> script, a <code>.txt</code> file with the results, and an <code>.html</code> file presenting them as a simple page.</li>
<li><strong>Commit</strong> and <strong>push</strong> all the files to your GitHub repository to save your work.</li>
</ol>

<h2>Publishing to GitHub Pages (three simple steps)</h2>
<p>So that your <code>.html</code> results can be viewed directly on the web, publish them as a GitHub Pages site:</p>
<ol>
<li>Make sure your final <code>.html</code> file is in the root of the repository and named <code>index.html</code>. (If it has a different name, remember to specify the correct file in the following steps.)</li>
<li>On your repository page, go to <strong>Settings</strong> → <strong>Pages</strong>.</li>
<li>Under <strong>Build and deployment</strong> → <strong>Source</strong>, choose:
<ul>
<li><strong>Branch:</strong> <code>main</code></li>
<li><strong>Folder:</strong> <code>/ (root)</code></li>
</ul>
<p>Then click <strong>Save</strong>. Wait 1–2 minutes and the site will be generated automatically.</p>
</li>
</ol>
<p>Once it is published, a URL will appear on the same page, in this format:</p>
<p><code>https://your-account.github.io/your-repo-name/</code></p>

<h2>Submission</h2>
<p>Please submit the following two links on Moodle:</p>
<ul>
<li>the URL of your <strong>GitHub repository</strong></li>
<li>the URL of your <strong>GitHub Pages</strong> site (where your analysis can be viewed directly)</li>
</ul>
<p>Include a <code>README.md</code> with your name, the course code, a one-sentence description of what you did, and a citation for the source you used. Do not put your student ID in a public repository. The source should be public domain or openly licensed; otherwise, use a short instructor-provided source.</p>
<p>If you have any questions, please feel free to ask!</p>
