---
layout: default
title: 安裝 OpenCode
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Sep 10, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年9月10日</span></p>
<p class="i18n-block"><a href="../../"><span class="lang-en">CHI 3242 syllabus</span><span class="lang-zh" lang="zh-Hant">CHI 3242 課程大綱</span></a></p>

<div class="i18n-block">
<h1><span class="lang-en">Install OpenCode</span><span class="lang-zh" lang="zh-Hant">安裝 OpenCode</span></h1>
</div>

<div class="i18n-block">
<div class="lang-en">
<p>OpenCode is the AI coding assistant we use in class. On a new computer (or a new user account), install it once in the terminal, then tell the terminal where to find it.</p>

<h2>1. Open a terminal</h2>
<p>On a Mac: <strong>Applications → Utilities → Terminal</strong>, or in VS Code choose <strong>Terminal → New Terminal</strong>. On Linux, open your usual terminal. On Windows, the same command works in <a href="https://git-scm.com/">Git Bash</a>.</p>

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
<li>macOS (zsh, the default): <code>source ~/.zshrc</code></li>
<li>Linux (often bash): <code>source ~/.bashrc</code></li>
</ul>
</li>
</ul>
<p>If you skip this step, typing <code>opencode</code> usually says <em>command not found</em>. That does not mean the install failed — the current window simply has not picked up the new path yet.</p>

<h2>4. Check that it works</h2>
<p>In the new (or reloaded) terminal, type:</p>
<pre>opencode</pre>
<p>If OpenCode starts, you are done. Next, connect it with your course API key — see the <a href="../../notes/week-01/">Week 1 notes</a>.</p>
<p>More detail, if you need it: <a href="https://opencode.ai/">opencode.ai</a>.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p>OpenCode 是課堂使用的人工智能編程助手。在一台新電腦（或新的使用者帳號）上，只要在終端機裝一次，再讓終端機知道去哪裡找它。</p>

<h2>1. 打開終端機</h2>
<p>Mac：<strong>應用程式 → 工具程式 → 終端機</strong>；或在 VS Code 選 <strong>Terminal → New Terminal</strong>。Linux：打開常用的終端機即可。Windows：同一個指令可在 <a href="https://git-scm.com/">Git Bash</a> 裡執行。</p>

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
<li>macOS（預設是 zsh）：<code>source ~/.zshrc</code></li>
<li>Linux（常見是 bash）：<code>source ~/.bashrc</code></li>
</ul>
</li>
</ul>
<p>若略過這一步，輸入 <code>opencode</code> 多半會看到 <em>command not found</em>。這不表示安裝失敗——只是目前這個視窗還沒讀到新路徑。</p>

<h2>4. 確認可以用</h2>
<p>在新的（或剛重新載入的）終端機輸入：</p>
<pre>opencode</pre>
<p>若 OpenCode 啟動了，就完成了。下一步用課程的 API 金鑰連接，見<a href="../../notes/week-01/">第1週講義</a>。</p>
<p>需要更多說明可到 <a href="https://opencode.ai/">opencode.ai</a>。</p>
</div>
</div>
