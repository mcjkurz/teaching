---
layout: default
title: Install OpenCode
---

<p class="updated">Last updated: Sep 14, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Install OpenCode</h1>

<p>OpenCode is the AI coding assistant we use in class. Two paths: install it on your laptop (sections 1–4), or skip local installation and work in the browser with GitHub Codespaces (section 5).</p>

<h2>1. Open a terminal</h2>
<p>On a Mac: <strong>Applications → Utilities → Terminal</strong>, or in VS Code choose <strong>Terminal → New Terminal</strong>. On Windows: open <a href="https://git-scm.com/">Git Bash</a>, or the terminal in VS Code.</p>

<h2>2. Run the installer</h2>
<p>Paste this line and press Enter:</p>
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
<p>Wait until it finishes. The program is now on your disk — but the terminal you just used still does not know the new command.</p>

<h2>3. Open a new terminal, or reload your settings</h2>
<p>Pick one:</p>
<ul>
<li><strong>Easiest:</strong> close the terminal and open a new one. A fresh window reads your settings automatically.</li>
<li><strong>Stay in the same window:</strong> reload the config file.
<ul>
<li>Mac: <code>source ~/.zshrc</code></li>
<li>Windows (Git Bash): <code>source ~/.bashrc</code></li>
</ul>
</li>
</ul>
<p>If you skip this step, typing <code>opencode</code> usually says <em>command not found</em>. That does not mean the install failed — the current window simply has not picked up the new path yet.</p>

<h2>4. Check that it works</h2>
<p>In the new (or reloaded) terminal, type:</p>
<pre>opencode</pre>
<p>If OpenCode starts, you are done.</p>
<p>More detail, if you need it: <a href="https://opencode.ai/">opencode.ai</a>.</p>

<h2>5. GitHub Codespaces (browser; no local install)</h2>
<p>Use this path if you cannot install software on your laptop, or if you prefer to work in the browser. The course template already includes Python and OpenCode; <strong>do not</strong> run the installer in sections 1–4. You still need a GitHub account and an API key.</p>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account.</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>dhg502</code>). Keep it private; do not put it in a repository.</li>
<li>Go to the template <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>, click <strong>Use this template</strong>, and create <strong>your own</strong> repository named <code>dhg502</code>. Do not edit the template itself.</li>
<li>Open that new repository. Click the green <strong>Code</strong> button → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. The first startup takes a few minutes while packages install. Everything then runs in the browser.</li>
<li>In the Codespace terminal, type <code>opencode</code> and press Enter. Then type <code>/connect</code>, select <strong>OpenRouter</strong>, and paste your API key. Type <code>/models</code> and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>
<p>Commit and push when you finish a session. Closing the browser does not delete files immediately, but GitHub removes idle Codespaces after several days. Anything not pushed to the repository is lost when the Codespace is deleted.</p>
