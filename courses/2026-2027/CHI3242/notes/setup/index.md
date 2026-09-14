---
layout: default
title: 安裝 OpenCode
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Sep 14, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年9月14日</span></p>
<p class="i18n-block"><a href="../../"><span class="lang-en">CHI 3242 syllabus</span><span class="lang-zh" lang="zh-Hant">CHI 3242 課程大綱</span></a></p>

<div class="i18n-block">
<h1><span class="lang-en">Install OpenCode</span><span class="lang-zh" lang="zh-Hant">安裝 OpenCode</span></h1>
</div>

<div class="i18n-block">
<div class="lang-en">
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
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>chi3242</code>). Keep it private; do not put it in a repository.</li>
<li>Go to the template <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>, click <strong>Use this template</strong>, and create <strong>your own</strong> repository. Do not edit the template itself.</li>
<li>Open that new repository. Click the green <strong>Code</strong> button → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. The first startup takes a few minutes while packages install. Everything then runs in the browser.</li>
<li>In the Codespace terminal, type <code>opencode</code> and press Enter. Then type <code>/connect</code>, select <strong>OpenRouter</strong>, and paste your API key. Type <code>/models</code> and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>
<p>Commit and push when you finish a session. Closing the browser does not delete files immediately, but GitHub removes idle Codespaces after several days. Anything not pushed to the repository is lost when the Codespace is deleted.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p>OpenCode 是課堂使用的人工智能編程助手。兩條路：裝在自己的電腦上（第 1–4 節），或不裝軟體、改在瀏覽器裡用 GitHub Codespaces（第 5 節）。</p>

<h2>1. 打開終端機</h2>
<p>Mac：<strong>應用程式 → 工具程式 → 終端機</strong>；或在 VS Code 選 <strong>Terminal → New Terminal</strong>。Windows：打開 <a href="https://git-scm.com/">Git Bash</a>，或 VS Code 裡的終端機。</p>

<h2>2. 執行安裝指令</h2>
<p>整行貼上，按 Enter：</p>
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
<p>等到它跑完。程式已經在硬碟上了——但你剛才用的這個視窗，還不知道有這個新指令。</p>

<h2>3. 開一個新終端機，或重新讀取設定</h2>
<p>兩種做法任選其一：</p>
<ul>
<li><strong>最簡單：</strong>關掉終端機，再開一個新的。新視窗會自動讀取設定。</li>
<li><strong>繼續用同一個視窗：</strong>重新載入設定檔。
<ul>
<li>Mac：<code>source ~/.zshrc</code></li>
<li>Windows（Git Bash）：<code>source ~/.bashrc</code></li>
</ul>
</li>
</ul>
<p>若略過這一步，輸入 <code>opencode</code> 多半會看到 <em>command not found</em>。這不表示安裝失敗——只是目前這個視窗還沒讀到新路徑。</p>

<h2>4. 確認可以用</h2>
<p>在新的（或剛重新載入的）終端機輸入：</p>
<pre>opencode</pre>
<p>若 OpenCode 啟動了，就完成了。</p>
<p>需要更多說明可到 <a href="https://opencode.ai/">opencode.ai</a>。</p>

<h2>5. GitHub Codespaces（瀏覽器；不必本機安裝）</h2>
<p>若無法在手提電腦上安裝軟體，或比較想在瀏覽器裡做，走這條路。課程模板已含 Python 與 OpenCode，<strong>不要</strong>再跑上面第 1–4 節的安裝指令。仍須有 GitHub 帳號與 API 金鑰。</p>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號。</li>
<li>請到 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領取你的 API 金鑰（課程代碼：<code>chi3242</code>）。不要把金鑰寫進倉庫，也不要與他人分享。</li>
<li>前往模板倉庫 <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>，按 <strong>Use this template</strong>，建立<strong>你自己的</strong>倉庫。不要直接在模板上改。</li>
<li>進入你剛建立的倉庫。按綠色 <strong>Code</strong> → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>。首次啟動需數分鐘，以完成套件安裝；之後都在瀏覽器裡進行。</li>
<li>在 Codespace 終端機輸入 <code>opencode</code> 並按 Enter。然後輸入 <code>/connect</code>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰。輸入 <code>/models</code>，選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>
<p>做完請 commit 並 push。關掉瀏覽器，檔案不會立刻消失，但 GitHub 會在 Codespace 閒置若干天後刪除它。尚未推送到倉庫的內容，Codespace 一刪就找不回來。</p>
</div>
</div>
