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
  grid-template-columns: repeat(3, 1fr);
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
main .opt-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.9rem;
  height: 1.9rem;
  border-radius: 50%;
  background: #0066cc;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin-right: 0.4rem;
  vertical-align: -0.35rem;
}
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
<a href="#option-a">Option A · Codespaces</a>
<a href="#option-b">Option B · Local OpenCode</a>
<a href="#option-c">Option C · Copilot (BYOK)</a>
</nav>

<div class="pick-grid">
<div class="pick-card">
<h3>School or lab computer</h3>
<p>No admin rights, nothing pre-installed.</p>
<p>Use <a href="#option-a">Option A</a>.</p>
</div>
<div class="pick-card">
<h3>Your own Mac</h3>
<p>Fast local install.</p>
<p>Use <a href="#option-b">Option B</a>.</p>
</div>
<div class="pick-card">
<h3>Your own Windows laptop</h3>
<p>Local OpenCode install can be slow.</p>
<p>Use <a href="#option-a">Option A</a> or <a href="#option-c">Option C</a>.</p>
</div>
</div>

<p>A lab computer will not already have VS Code, OpenCode, or Git on it — don't assume otherwise.</p>

<h2>Before you start</h2>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account — needed for all three options.</li>
<li>Get your key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> (class code: <code>chi3242</code> or <code>dhg502</code>). Keep it private.</li>
</ol>

<h2 id="option-a"><span class="opt-badge">A</span>GitHub Codespaces</h2>
<p>Runs in the browser. Nothing installed on your computer.</p>
<ol>
<li>Use the template <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a> → <strong>Use this template</strong> → create your own repo (name it e.g. <code>chi3242</code> or <code>dhg502</code>).</li>
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
<li>Open the Chat panel — already signed in with your GitHub account.</li>
<li>Click the model picker at the bottom of the chat box → <strong>Other Models</strong></li>
<li>Settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key</li>
<li>Pick your model in the Chat model picker.</li>
</ol>

<p class="callout-warn"><strong>When you're done:</strong> commit, push, then delete the Codespace (<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>). Idle Codespaces burn your free monthly hours until removed.</p>

<h2 id="install-vscode">Installing VS Code</h2>
<p>Needed for Options B and C only.</p>
<ul>
<li><strong>Windows:</strong> from <a href="https://code.visualstudio.com/">code.visualstudio.com</a>, download the <strong>User Installer</strong> (not System Installer) — no admin password needed, and the only one that works on a lab computer.</li>
<li><strong>macOS:</strong> download the <code>.zip</code>, drag <strong>Visual Studio Code.app</strong> into <strong>Applications</strong> (or run it straight from Downloads on a lab Mac).</li>
</ul>

<h2 id="option-b"><span class="opt-badge">B</span>Local VS Code + OpenCode</h2>
<p>Your own computer only — not for lab computers.</p>

<h3>macOS</h3>
<ol>
<li>Open a terminal (<strong>Applications → Utilities → Terminal</strong>, or VS Code's <strong>Terminal → New Terminal</strong>).</li>
<li>Run:
<pre>curl -fsSL https://opencode.ai/install | bash</pre></li>
<li>Open a new terminal, or run <code>source ~/.zshrc</code>.</li>
<li>Type <code>opencode</code> to check it works, then connect as in <a href="#option-a">Option A</a>.</li>
</ol>

<h3>Windows</h3>
<p class="callout-warn">Often slow on Windows — prefer <a href="#option-a">Option A</a> or <a href="#option-c">Option C</a> if you can.</p>
<ol>
<li>Open <a href="https://git-scm.com/">Git Bash</a>.</li>
<li>Run:
<pre>curl -fsSL https://opencode.ai/install | bash</pre></li>
<li>Open a new Git Bash window, or run <code>source ~/.bashrc</code>.</li>
<li>Type <code>opencode</code> to check it works, then connect as in <a href="#option-a">Option A</a>.</li>
</ol>

<h2 id="option-c"><span class="opt-badge">C</span>VS Code + Copilot (bring your own key)</h2>
<p>Works on your own computer, or a lab computer with VS Code user-installed above. No terminal needed.</p>
<ol>
<li><a href="#install-vscode">Install VS Code</a> if you haven't already.</li>
<li><strong>Activate Copilot (first time):</strong> open the Chat panel (install the <strong>GitHub Copilot Chat</strong> extension first if you don't see it) → <strong>Sign in to GitHub</strong>. No paid subscription needed — your OpenRouter key pays for the model.</li>
<li><strong>Add your key:</strong> click the model picker at the bottom of the chat box → <strong>Other Models</strong> → settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key.</li>
<li>Pick your model in the Chat model picker.</li>
</ol>

<p>Syllabus: <a href="../CHI3242/">CHI 3242</a> · <a href="../DHG502/">DHG 502</a></p>

</div>
<div class="lang-zh" lang="zh-Hant">

<p>三種把人工智能編程助手（OpenCode 或 GitHub Copilot）連上你的 OpenRouter 金鑰的方法，依你的電腦情況任選一種。</p>

<nav class="option-nav">
<a href="#option-a-zh">方案 A · Codespaces</a>
<a href="#option-b-zh">方案 B · 本機 OpenCode</a>
<a href="#option-c-zh">方案 C · Copilot（自帶金鑰）</a>
</nav>

<div class="pick-grid">
<div class="pick-card">
<h3>學校電腦室</h3>
<p>無管理員權限，也沒有預裝軟件。</p>
<p>請用<a href="#option-a-zh">方案 A</a>。</p>
</div>
<div class="pick-card">
<h3>自己的 Mac</h3>
<p>本機安裝快速。</p>
<p>請用<a href="#option-b-zh">方案 B</a>。</p>
</div>
<div class="pick-card">
<h3>自己的 Windows 手提電腦</h3>
<p>本機安裝 OpenCode 可能較慢。</p>
<p>請用<a href="#option-a-zh">方案 A</a>或<a href="#option-c-zh">方案 C</a>。</p>
</div>
</div>

<p>電腦室機器不會預裝 VS Code、OpenCode 或 Git——不要假設已經有。</p>

<h2>開始前</h2>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號——三種方案都需要。</li>
<li>到 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領取金鑰（課程代碼：<code>chi3242</code> 或 <code>dhg502</code>）。請妥善保管。</li>
</ol>

<h2 id="option-a-zh"><span class="opt-badge">A</span>GitHub Codespaces</h2>
<p>在瀏覽器裡運行，電腦上不必安裝任何東西。</p>
<ol>
<li>用模板 <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a> → <strong>Use this template</strong> → 建立自己的倉庫（例如命名為 <code>chi3242</code> 或 <code>dhg502</code>）。</li>
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
<li>打開 Chat 面板——已用你的 GitHub 帳號登入。</li>
<li>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong></li>
<li>設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰</li>
<li>在模型選擇器中選定模型。</li>
</ol>

<p class="callout-warn"><strong>做完後：</strong>先 commit、push，再刪除 Codespace（<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>）。閒置的 Codespace 會持續消耗每月免費時數，直到被刪除。</p>

<h2 id="install-vscode-zh">安裝 VS Code</h2>
<p>只有方案 B 和方案 C 需要。</p>
<ul>
<li><strong>Windows：</strong>在 <a href="https://code.visualstudio.com/">code.visualstudio.com</a> 下載 <strong>User Installer</strong>（不要 System Installer）——不需要管理員密碼，也是電腦室機器上唯一可行的選項。</li>
<li><strong>macOS：</strong>下載 <code>.zip</code>，把 <strong>Visual Studio Code.app</strong> 拖進 <strong>Applications</strong>（電腦室的 Mac 也可直接從下載資料夾執行）。</li>
</ul>

<h2 id="option-b-zh"><span class="opt-badge">B</span>本機 VS Code + OpenCode</h2>
<p>僅適用於自己的電腦——電腦室機器不適用。</p>

<h3>macOS</h3>
<ol>
<li>打開終端機（<strong>應用程式 → 工具程式 → 終端機</strong>，或 VS Code 的 <strong>Terminal → New Terminal</strong>）。</li>
<li>執行：
<pre>curl -fsSL https://opencode.ai/install | bash</pre></li>
<li>開一個新終端機，或執行 <code>source ~/.zshrc</code>。</li>
<li>輸入 <code>opencode</code> 確認可用，再依<a href="#option-a-zh">方案 A</a>的步驟連接。</li>
</ol>

<h3>Windows</h3>
<p class="callout-warn">在 Windows 上常常較慢——建議改用<a href="#option-a-zh">方案 A</a>或<a href="#option-c-zh">方案 C</a>。</p>
<ol>
<li>打開 <a href="https://git-scm.com/">Git Bash</a>。</li>
<li>執行：
<pre>curl -fsSL https://opencode.ai/install | bash</pre></li>
<li>開一個新 Git Bash 視窗，或執行 <code>source ~/.bashrc</code>。</li>
<li>輸入 <code>opencode</code> 確認可用，再依<a href="#option-a-zh">方案 A</a>的步驟連接。</li>
</ol>

<h2 id="option-c-zh"><span class="opt-badge">C</span>VS Code + Copilot（自帶金鑰）</h2>
<p>適用於自己的電腦，或已裝好 VS Code 的電腦室機器。不需要終端機。</p>
<ol>
<li>如尚未安裝，<a href="#install-vscode-zh">先安裝 VS Code</a>。</li>
<li><strong>啟用 Copilot（僅首次）：</strong>打開 Chat 面板（若看不到，先安裝 <strong>GitHub Copilot Chat</strong> 擴充功能）→ <strong>Sign in to GitHub</strong>。不需要付費訂閱——模型費用由你的 OpenRouter 金鑰支付。</li>
<li><strong>加入金鑰：</strong>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong> → 設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰。</li>
<li>在模型選擇器中選定模型。</li>
</ol>

<p>課程大綱：<a href="../CHI3242/">CHI 3242</a> · <a href="../DHG502/">DHG 502</a></p>

</div>
</div>
