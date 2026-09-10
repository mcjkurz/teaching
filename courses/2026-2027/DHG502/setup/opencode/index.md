---
layout: default
title: Install OpenCode
---

<p class="updated">Last updated: Sep 10, 2026</p>
<p><a href="../../">DHG 502 syllabus</a></p>
<h1>Install OpenCode</h1>

<p>OpenCode is the AI coding assistant we use in class. On a new computer (or a new user account), install it once in the terminal, then tell the terminal where to find it.</p>

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
