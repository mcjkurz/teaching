---
layout: default
title: Set Up an AI Coding Agent
---

<style>
main .option-nav { display: flex; gap: 0.6rem; flex-wrap: wrap; margin: 0 0 1.5rem; }
main .option-nav a {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: #eef3f8;
  border: 1px solid #c5d4e4;
  color: #0066cc;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
}
main .option-nav a:hover { background: #e3ecf5; }
main .pick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 0 0 1.25rem;
}
@media (max-width: 768px) { main .pick-grid { grid-template-columns: 1fr; } }
main .pick-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem 1.15rem;
  background: #fafbfc;
}
main .pick-card h3 { margin: 0 0 0.4rem; font-size: 1.05rem; }
main .pick-card p { margin: 0 0 0.5rem; font-size: 0.95rem; color: #444; }
main .pick-card p:last-child { margin-bottom: 0; font-size: 0.95rem; }
main .callout-warn {
  border-left: 4px solid #cc8800;
  background: #fff8ec;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  margin: 0 0 1rem;
  font-size: 0.95rem;
}
</style>

<p class="updated i18n-block"><span class="lang-en">Last updated: Sep 22, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年9月22日</span></p>

<div class="i18n-block">
<h1><span class="lang-en">Set Up an AI Coding Agent</span><span class="lang-zh" lang="zh-Hant">安裝人工智能編程助手</span></h1>
</div>

<div class="i18n-block">
<div class="lang-en">

<p>Three ways to connect an AI coding agent (OpenCode or GitHub Copilot) to your OpenRouter key. Pick the one that fits your computer.</p>

<nav class="option-nav">
<a href="#codespaces">Browser (Codespaces)</a>
<a href="#opencode">OpenCode Desktop App</a>
<a href="#copilot-school">Copilot (school computer)</a>
<a href="#copilot-own">Copilot (own computer)</a>
</nav>

<div class="pick-grid">
<div class="pick-card">
<h3>School or lab computer</h3>
<p>No admin rights, nothing pre-installed.</p>
<p><strong>a)</strong> In the browser (nothing to install): use <a href="#codespaces">Codespaces</a>.</p>
<p><strong>b)</strong> In an editor (needs a user install): use <a href="#copilot-school">VS Code + Copilot</a>.</p>
</div>
<div class="pick-card">
<h3>Your own computer (Mac or Windows)</h3>
<p>Full control to install software.</p>
<p><strong>a)</strong> Install the <a href="#opencode">OpenCode Desktop App</a> — one download, no terminal, works the same on Mac and Windows.</p>
<p><strong>b)</strong> <a href="#copilot-own">VS Code + Copilot</a> (needs installing software).</p>
</div>
</div>

<h2>Before you start</h2>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account — needed for all three options.</li>
<li>Get your key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> using the class code from your syllabus. Keep it private.</li>
</ol>

<h2 id="codespaces">Browser: GitHub Codespaces</h2>
<p>Runs in the browser. Nothing installed on your computer.</p>
<ol>
<li>Use the template <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a> → <strong>Use this template</strong> → create your own repository.</li>
<li>Open it → green <strong>Code</strong> button → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. First start takes a few minutes.</li>
</ol>

<h3>Using OpenCode</h3>
<ol>
<li>In the terminal: <code>opencode</code></li>
<li><code>/connect</code> → <strong>OpenRouter</strong> → paste key</li>
<li><code>/models</code> → <strong>GLM-5.3-Flash</strong></li>
</ol>

<h3>Using Copilot</h3>
<ol>
<li>Click the chat icon near the top of the window to open the Chat panel — it's already signed in with your GitHub account, no extra sign-in needed.</li>
<li>Click the model picker at the bottom of the chat box → <strong>Other Models</strong></li>
<li>Settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key</li>
<li>Pick <strong>GLM-5.3-Flash</strong> in the Chat model picker.</li>
</ol>

<p class="callout-warn"><strong>When you're done:</strong> commit, push, then delete the Codespace (<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>). An idle Codespace keeps using your free monthly hours until you delete it.</p>

<h2 id="opencode">OpenCode Desktop App</h2>
<p>A standalone app for your own computer — no terminal, no Git Bash, no Node.js. Works the same way on Mac and Windows.</p>
<ol>
<li>Go to <a href="https://opencode.ai/download">opencode.ai/download</a> and download the version for your computer (macOS — Apple Silicon or Intel; or Windows).</li>
<li>Install it: on macOS, open the <code>.dmg</code> and drag <strong>OpenCode</strong> into <strong>Applications</strong>. On Windows, run the downloaded installer.</li>
<li>Open OpenCode, then open your course folder (clone it with Git, or download it as a ZIP from GitHub and unzip it).</li>
<li>Open <strong>Settings</strong> (look for a gear icon) → <strong>Connect provider</strong> → find <strong>OpenRouter</strong> in the list → click <strong>Connect</strong> → paste your API key.</li>
<li>If OpenRouter doesn't show up in the model list right away, quit and reopen OpenCode. Then pick <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2 id="copilot-school">VS Code + Copilot (school computer)</h2>
<p>For a lab computer where you can't install anything system-wide. No terminal needed.</p>
<ol>
<li><strong>Install VS Code</strong> (no admin needed) from <a href="https://code.visualstudio.com/">code.visualstudio.com</a>:
<ul>
<li><strong>Windows:</strong> download the <strong>User Installer</strong> — not the System Installer.</li>
<li><strong>macOS:</strong> download the <code>.dmg</code>, open it, and drag <strong>Visual Studio Code.app</strong> into <strong>Applications</strong>. If you can't write to <strong>Applications</strong>, you can run it directly from the opened <code>.dmg</code> window instead.</li>
</ul>
</li>
<li><strong>Activate Copilot (first time):</strong> click the chat icon near the top of the window to open the Chat panel. If you don't see it, open the Extensions view (the square-icon button in the left sidebar), search for <strong>GitHub Copilot Chat</strong>, click <strong>Install</strong>, then look for the chat icon again. In the Chat panel, click <strong>Sign in to GitHub</strong> and follow the prompts in your browser. No paid subscription needed — your OpenRouter key pays for the model.</li>
<li><strong>Add your key:</strong> click the model picker at the bottom of the chat box → <strong>Other Models</strong> → settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key.</li>
<li>Pick <strong>GLM-5.3-Flash</strong> in the Chat model picker.</li>
</ol>

<h2 id="copilot-own">VS Code + Copilot (your own computer)</h2>
<p>For your own Mac or Windows computer. No terminal needed.</p>
<ol>
<li><strong>Install VS Code</strong> from <a href="https://code.visualstudio.com/">code.visualstudio.com</a>:
<ul>
<li><strong>Windows:</strong> download the standard <strong>System Installer</strong> — fine here since it's your own computer.</li>
<li><strong>macOS:</strong> download the <code>.dmg</code>, open it, and drag <strong>Visual Studio Code.app</strong> into <strong>Applications</strong>.</li>
</ul>
</li>
<li><strong>Activate Copilot (first time):</strong> click the chat icon near the top of the window to open the Chat panel. If you don't see it, open the Extensions view (the square-icon button in the left sidebar), search for <strong>GitHub Copilot Chat</strong>, click <strong>Install</strong>, then look for the chat icon again. In the Chat panel, click <strong>Sign in to GitHub</strong> and follow the prompts in your browser. No paid subscription needed — your OpenRouter key pays for the model.</li>
<li><strong>Add your key:</strong> click the model picker at the bottom of the chat box → <strong>Other Models</strong> → settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key.</li>
<li>Pick <strong>GLM-5.3-Flash</strong> in the Chat model picker.</li>
</ol>

</div>
<div class="lang-zh" lang="zh-Hant">

<p>三種把人工智能編程助手（OpenCode 或 GitHub Copilot）連上你的 OpenRouter 金鑰的方法，依你的電腦情況任選一種。</p>

<nav class="option-nav">
<a href="#codespaces-zh">瀏覽器（Codespaces）</a>
<a href="#opencode-zh">OpenCode 桌面版</a>
<a href="#copilot-school-zh">Copilot（學校電腦）</a>
<a href="#copilot-own-zh">Copilot（自己的電腦）</a>
</nav>

<div class="pick-grid">
<div class="pick-card">
<h3>學校電腦室</h3>
<p>無管理員權限，也沒有預裝軟件。</p>
<p><strong>a)</strong> 在瀏覽器裡（不需要安裝任何東西）：用 <a href="#codespaces-zh">Codespaces</a>。</p>
<p><strong>b)</strong> 在編輯器裡操作（需要使用者安裝）：用 <a href="#copilot-school-zh">VS Code + Copilot</a>。</p>
</div>
<div class="pick-card">
<h3>自己的電腦（Mac 或 Windows）</h3>
<p>可自由安裝軟件。</p>
<p><strong>a)</strong> 安裝 <a href="#opencode-zh">OpenCode 桌面版</a>——單一下載檔，不需終端機，Mac 和 Windows 做法相同。</p>
<p><strong>b)</strong> <a href="#copilot-own-zh">VS Code + Copilot</a>（需要安裝軟件）。</p>
</div>
</div>

<h2>開始前</h2>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號——三種方案都需要。</li>
<li>到 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領取金鑰，課程代碼見課程大綱。請妥善保管。</li>
</ol>

<h2 id="codespaces-zh">瀏覽器：GitHub Codespaces</h2>
<p>在瀏覽器裡運行，電腦上不必安裝任何東西。</p>
<ol>
<li>用模板 <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a> → <strong>Use this template</strong> → 建立自己的倉庫。</li>
<li>打開倉庫 → 綠色 <strong>Code</strong> 按鈕 → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>。首次啟動需數分鐘。</li>
</ol>

<h3>使用 OpenCode</h3>
<ol>
<li>終端機輸入：<code>opencode</code></li>
<li><code>/connect</code> → <strong>OpenRouter</strong> → 貼上金鑰</li>
<li><code>/models</code> → <strong>GLM-5.3-Flash</strong></li>
</ol>

<h3>使用 Copilot</h3>
<ol>
<li>按視窗上方的聊天圖示，打開 Chat 面板——已用你的 GitHub 帳號登入，不需要再另外登入。</li>
<li>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong></li>
<li>設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰</li>
<li>在模型選擇器中選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<p class="callout-warn"><strong>做完後：</strong>先 commit、push，再刪除 Codespace（<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>）。閒置的 Codespace 會持續消耗每月免費時數，直到被刪除。</p>

<h2 id="opencode-zh">OpenCode 桌面版</h2>
<p>一個裝在自己電腦上的獨立應用程式——不需終端機、不需 Git Bash、不需 Node.js。Mac 與 Windows 做法完全相同。</p>
<ol>
<li>前往 <a href="https://opencode.ai/download">opencode.ai/download</a>，下載適合你電腦的版本（macOS——Apple Silicon 或 Intel；或 Windows）。</li>
<li>安裝：macOS 打開 <code>.dmg</code>，把 <strong>OpenCode</strong> 拖進 <strong>Applications</strong>；Windows 執行下載好的安裝程式。</li>
<li>打開 OpenCode，開啟你的課程資料夾（用 Git clone，或從 GitHub 下載 ZIP 並解壓）。</li>
<li>打開 <strong>Settings</strong>（通常是齒輪圖示）→ <strong>Connect provider</strong> → 在列表中找到 <strong>OpenRouter</strong> → 按 <strong>Connect</strong> → 貼上你的 API 金鑰。</li>
<li>若模型列表沒有立即出現 OpenRouter，重新啟動 OpenCode 即可。然後選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2 id="copilot-school-zh">VS Code + Copilot（學校電腦）</h2>
<p>適用於無法安裝系統層級軟件的電腦室機器。不需要終端機。</p>
<ol>
<li><strong>安裝 VS Code</strong>（不需管理員權限），在 <a href="https://code.visualstudio.com/">code.visualstudio.com</a> 下載：
<ul>
<li><strong>Windows：</strong>下載 <strong>User Installer</strong>——不要 System Installer。</li>
<li><strong>macOS：</strong>下載 <code>.dmg</code>，打開後把 <strong>Visual Studio Code.app</strong> 拖進 <strong>Applications</strong>。若無法寫入 <strong>Applications</strong>，可直接在打開的 <code>.dmg</code> 視窗裡執行。</li>
</ul>
</li>
<li><strong>啟用 Copilot（僅首次）：</strong>按 VS Code 視窗上方的聊天圖示，打開 Chat 面板。若看不到，先打開左側邊欄的擴充功能檢視（方形圖示的按鈕），搜尋 <strong>GitHub Copilot Chat</strong>，按 <strong>Install</strong> 安裝，再回頭找聊天圖示。在 Chat 面板按 <strong>Sign in to GitHub</strong>，依瀏覽器提示完成登入。不需要付費訂閱——模型費用由你的 OpenRouter 金鑰支付。</li>
<li><strong>加入金鑰：</strong>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong> → 設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰。</li>
<li>在模型選擇器中選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2 id="copilot-own-zh">VS Code + Copilot（自己的電腦）</h2>
<p>適用於自己的 Mac 或 Windows 電腦。不需要終端機。</p>
<ol>
<li><strong>安裝 VS Code</strong>，在 <a href="https://code.visualstudio.com/">code.visualstudio.com</a> 下載：
<ul>
<li><strong>Windows：</strong>直接下載標準的 <strong>System Installer</strong> 即可——是自己的電腦，不必擔心管理員權限。</li>
<li><strong>macOS：</strong>下載 <code>.dmg</code>，打開後把 <strong>Visual Studio Code.app</strong> 拖進 <strong>Applications</strong>。</li>
</ul>
</li>
<li><strong>啟用 Copilot（僅首次）：</strong>按 VS Code 視窗上方的聊天圖示，打開 Chat 面板。若看不到，先打開左側邊欄的擴充功能檢視（方形圖示的按鈕），搜尋 <strong>GitHub Copilot Chat</strong>，按 <strong>Install</strong> 安裝，再回頭找聊天圖示。在 Chat 面板按 <strong>Sign in to GitHub</strong>，依瀏覽器提示完成登入。不需要付費訂閱——模型費用由你的 OpenRouter 金鑰支付。</li>
<li><strong>加入金鑰：</strong>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong> → 設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰。</li>
<li>在模型選擇器中選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

</div>
</div>
