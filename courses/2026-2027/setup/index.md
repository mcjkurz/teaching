---
layout: default
title: Set Up an AI Coding Agent
---

<style>
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
main h3 { font-weight: 600; }
main .pick-card h3 { margin: 0 0 0.4rem; font-size: 1.05rem; font-weight: 600; }
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

<p>Pick the setup that fits your computer. Each one ends the same way: an AI coding agent (OpenCode or GitHub Copilot) connected to your OpenRouter key.</p>

<p class="callout-warn"><strong>Most important, whichever setup you choose:</strong> commit and push your work to your GitHub repository at the end of every session. That is what preserves it — anything left only in a Codespace or on a school computer will eventually be lost. You can ask your agent to commit and push for you.</p>

<div class="pick-grid">
<div class="pick-card">
<h3>School or lab computer</h3>
<p>These machines will not let you install software that asks for an administrator password, and nothing is set up for you in advance.</p>
<p><a href="#codespaces">Codespaces</a> — in the browser, nothing to install.</p>
<p><a href="#copilot-school">VS Code + Copilot</a> — in an editor, needs a user install.</p>
</div>
<div class="pick-card">
<h3>Your own computer (Mac or Windows)</h3>
<p>You can install whatever you need.</p>
<p><a href="#opencode">OpenCode Desktop App</a> — one download, no terminal, same on Mac and Windows.</p>
<p><a href="#copilot-own">VS Code + Copilot</a> — in an editor, standard install.</p>
<p><a href="#codespaces">Codespaces</a> — works here too, if you would rather not install anything.</p>
</div>
</div>

<h2>Before you start</h2>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account — needed in every case: it is where your work is stored.</li>
<li>Get your <strong>OpenRouter API key</strong> at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> using the class code from your syllabus. Keep it private.</li>
</ol>

<h2 id="codespaces">Browser: GitHub Codespaces</h2>
<p>Runs in the browser, so it works on any computer — a school machine or your own. Nothing is installed.</p>
<ol>
<li>A Codespace runs on a GitHub repository, so make one first: go to the template <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a>, click the green <strong>Use this template</strong> button, and create your own repository.</li>
<li>Open your new repository → green <strong>Code</strong> button → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. The first start takes a few minutes.</li>
</ol>

<h3>Using OpenCode</h3>
<ol>
<li>In the terminal at the bottom of the window, type <code>opencode</code> and press Enter.</li>
<li>Type <code>/connect</code>, select <strong>OpenRouter</strong>, and paste your API key.</li>
<li>Type <code>/models</code> and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h3>Using Copilot</h3>
<ol>
<li>Click the chat icon near the top of the window to open the Chat panel — it's already signed in with your GitHub account, no extra sign-in needed.</li>
<li>Click the model picker at the bottom of the chat box → <strong>Other Models</strong></li>
<li>Settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key</li>
<li>Pick <strong>GLM-5.3-Flash</strong> in the Chat model picker.</li>
</ol>

<p class="callout-warn"><strong>When you're done:</strong> commit and push your work (you can ask the agent to do this for you), then delete the Codespace (<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>). Anything you didn't push is lost when the Codespace is deleted, and an idle Codespace keeps using your free monthly hours until you delete it.</p>

<p><strong>Worth doing:</strong> apply for <a href="https://education.github.com">GitHub Education</a> with your university email. Verified students get up to 180 Codespaces core-hours per month, far more than the standard free allowance.</p>

<h2 id="copilot-school">VS Code + Copilot (school computer)</h2>
<p>For a lab computer where you can't install anything system-wide. No terminal needed.</p>
<ol>
<li><strong>Install VS Code</strong> (no admin needed) from <a href="https://code.visualstudio.com/Download">https://code.visualstudio.com/Download</a>:
<ul>
<li><strong>Windows:</strong> download the <strong>User Installer</strong> — not the System Installer.</li>
<li><strong>macOS:</strong> download the <code>.dmg</code>, open it, and drag <strong>Visual Studio Code.app</strong> into <strong>Applications</strong>. If you can't write to <strong>Applications</strong>, you can run it directly from the opened <code>.dmg</code> window instead.</li>
</ul>
</li>
<li><strong>Activate Copilot (first time):</strong> click the chat icon near the top of the window to open the Chat panel. If you don't see it, open the Extensions view (the square-icon button in the left sidebar), search for <strong>GitHub Copilot Chat</strong>, click <strong>Install</strong>, then look for the chat icon again. In the Chat panel, click <strong>Sign in to GitHub</strong> and follow the prompts in your browser. No paid subscription needed — your OpenRouter key pays for the model.</li>
<li><strong>Add your key:</strong> click the model picker at the bottom of the chat box → <strong>Other Models</strong> → settings (gear) icon → <strong>Add Models</strong> → <strong>OpenRouter</strong> → paste key.</li>
<li>Pick <strong>GLM-5.3-Flash</strong> in the Chat model picker.</li>
</ol>

<h2 id="opencode">OpenCode Desktop App</h2>
<p>A standalone app for your own computer — no terminal, no Git Bash, no Node.js. Works the same way on Mac and Windows.</p>
<ol>
<li>Go to <a href="https://opencode.ai/download">https://opencode.ai/download</a> and download the version for your computer (on a Mac, the Apple menu → <strong>About This Mac</strong> tells you whether you have an Apple Silicon or an Intel chip).</li>
<li>Install it: on macOS, open the <code>.dmg</code> and drag <strong>OpenCode</strong> into <strong>Applications</strong>. On Windows, run the downloaded installer.</li>
<li>Open OpenCode and open the folder you want to work in — your course folder, or any new folder you make for your work.</li>
<li>Open <strong>Settings</strong> (look for a gear icon) → <strong>Connect provider</strong> → find <strong>OpenRouter</strong> in the list → click <strong>Connect</strong> → paste your API key.</li>
<li>If OpenRouter doesn't show up in the model list right away, quit and reopen OpenCode. Then pick <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2 id="copilot-own">VS Code + Copilot (your own computer)</h2>
<p>For your own Mac or Windows computer. No terminal needed.</p>
<ol>
<li><strong>Install VS Code</strong> from <a href="https://code.visualstudio.com/Download">https://code.visualstudio.com/Download</a>:
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

<p>請依你的電腦情況選擇適合的方案。每一種最後的結果都一樣：人工智能編程助手（OpenCode 或 GitHub Copilot）連上你的 OpenRouter 金鑰。</p>

<p class="callout-warn"><strong>不論選哪一種方案，最重要的是：</strong>每次做完都要把成果 commit 並 push 到你的 GitHub 倉庫。只有這樣才能保存下來——只留在 Codespace 或學校電腦上的檔案，最後都會消失。可以直接請助手幫你 commit 和 push。</p>

<div class="pick-grid">
<div class="pick-card">
<h3>學校電腦室</h3>
<p>這類電腦不讓你安裝需要管理員密碼的軟件，也不會預先裝好任何工具。</p>
<p><a href="#codespaces-zh">Codespaces</a>：在瀏覽器裡，不需要安裝任何東西。</p>
<p><a href="#copilot-school-zh">VS Code + Copilot</a>：在編輯器裡操作，需要使用者安裝。</p>
</div>
<div class="pick-card">
<h3>自己的電腦（Mac 或 Windows）</h3>
<p>你可以自由安裝需要的軟件。</p>
<p><a href="#opencode-zh">OpenCode 桌面版</a>：單一下載檔，不需終端機，Mac 和 Windows 做法相同。</p>
<p><a href="#copilot-own-zh">VS Code + Copilot</a>：在編輯器裡操作，用標準安裝即可。</p>
<p><a href="#codespaces-zh">Codespaces</a>：同樣適用，若不想在電腦上安裝任何東西。</p>
</div>
</div>

<h2>開始前</h2>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號——每一種方案都需要，你的成果都存放在這裡。</li>
<li>到 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領取你的 <strong>OpenRouter API 金鑰</strong>，課程代碼見課程大綱。請妥善保管。</li>
</ol>

<h2 id="codespaces-zh">瀏覽器：GitHub Codespaces</h2>
<p>在瀏覽器裡運行，所以任何電腦都適用——學校的機器或自己的電腦皆可，不必安裝任何東西。</p>
<ol>
<li>Codespace 必須建立在 GitHub 倉庫上，所以請先建立倉庫：前往模板 <a href="https://github.com/mcjkurz/qh-starter">qh-starter</a>，按綠色的 <strong>Use this template</strong> 按鈕，建立自己的倉庫。</li>
<li>打開你新建的倉庫 → 綠色 <strong>Code</strong> 按鈕 → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>。首次啟動需數分鐘。</li>
</ol>

<h3>使用 OpenCode</h3>
<ol>
<li>在視窗下方的終端機輸入 <code>opencode</code>，按 Enter。</li>
<li>輸入 <code>/connect</code>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰。</li>
<li>輸入 <code>/models</code>，選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h3>使用 Copilot</h3>
<ol>
<li>按視窗上方的聊天圖示，打開 Chat 面板——已用你的 GitHub 帳號登入，不需要再另外登入。</li>
<li>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong></li>
<li>設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰</li>
<li>在模型選擇器中選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<p class="callout-warn"><strong>做完後：</strong>先 commit、push（可以直接請助手幫你做），再刪除 Codespace（<a href="https://github.com/codespaces">github.com/codespaces</a> → <strong>...</strong> → <strong>Delete</strong>）。尚未推送的內容，Codespace 一刪就找不回來；閒置的 Codespace 也會持續消耗每月免費時數，直到被刪除。</p>

<p><strong>建議一做：</strong>用你的大學電郵申請 <a href="https://education.github.com">GitHub Education</a>。通過驗證的學生每月最多可用 180 個 Codespaces core hours，遠多於一般免費額度。</p>

<h2 id="copilot-school-zh">VS Code + Copilot（學校電腦）</h2>
<p>適用於無法安裝系統層級軟件的電腦室機器。不需要終端機。</p>
<ol>
<li><strong>安裝 VS Code</strong>（不需管理員權限），在 <a href="https://code.visualstudio.com/Download">https://code.visualstudio.com/Download</a> 下載：
<ul>
<li><strong>Windows：</strong>下載 <strong>User Installer</strong>——不要 System Installer。</li>
<li><strong>macOS：</strong>下載 <code>.dmg</code>，打開後把 <strong>Visual Studio Code.app</strong> 拖進 <strong>Applications</strong>。若無法寫入 <strong>Applications</strong>，可直接在打開的 <code>.dmg</code> 視窗裡執行。</li>
</ul>
</li>
<li><strong>啟用 Copilot（僅首次）：</strong>按 VS Code 視窗上方的聊天圖示，打開 Chat 面板。若看不到，先打開左側邊欄的擴充功能檢視（方形圖示的按鈕），搜尋 <strong>GitHub Copilot Chat</strong>，按 <strong>Install</strong> 安裝，再回頭找聊天圖示。在 Chat 面板按 <strong>Sign in to GitHub</strong>，依瀏覽器提示完成登入。不需要付費訂閱——模型費用由你的 OpenRouter 金鑰支付。</li>
<li><strong>加入金鑰：</strong>按聊天輸入框下方的模型選擇器 → <strong>Other Models</strong> → 設定（齒輪）圖示 → <strong>Add Models</strong> → <strong>OpenRouter</strong> → 貼上金鑰。</li>
<li>在模型選擇器中選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2 id="opencode-zh">OpenCode 桌面版</h2>
<p>一個裝在自己電腦上的獨立應用程式——不需終端機、不需 Git Bash、不需 Node.js。Mac 與 Windows 做法完全相同。</p>
<ol>
<li>前往 <a href="https://opencode.ai/download">https://opencode.ai/download</a>，下載適合你電腦的版本（Mac 可在蘋果選單 → <strong>關於這台 Mac</strong> 查看是 Apple Silicon 還是 Intel 晶片）。</li>
<li>安裝：macOS 打開 <code>.dmg</code>，把 <strong>OpenCode</strong> 拖進 <strong>Applications</strong>；Windows 執行下載好的安裝程式。</li>
<li>打開 OpenCode，開啟你要使用的資料夾——課程資料夾，或你為作業新建的任何資料夾皆可。</li>
<li>打開 <strong>Settings</strong>（通常是齒輪圖示）→ <strong>Connect provider</strong> → 在列表中找到 <strong>OpenRouter</strong> → 按 <strong>Connect</strong> → 貼上你的 API 金鑰。</li>
<li>若模型列表沒有立即出現 OpenRouter，重新啟動 OpenCode 即可。然後選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2 id="copilot-own-zh">VS Code + Copilot（自己的電腦）</h2>
<p>適用於自己的 Mac 或 Windows 電腦。不需要終端機。</p>
<ol>
<li><strong>安裝 VS Code</strong>，在 <a href="https://code.visualstudio.com/Download">https://code.visualstudio.com/Download</a> 下載：
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
