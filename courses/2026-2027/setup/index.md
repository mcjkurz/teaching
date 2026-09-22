---
layout: default
title: Set Up an AI Coding Agent
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Sep 22, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年9月22日</span></p>

<div class="i18n-block">
<h1><span class="lang-en">Set Up an AI Coding Agent</span><span class="lang-zh" lang="zh-Hant">安裝人工智能編程助手</span></h1>
</div>

<div class="i18n-block">
<div class="lang-en">

<p>This page covers three ways to connect an AI coding agent (OpenCode or GitHub Copilot) to the OpenRouter key issued for this class. All three end up in the same place — an agent inside your editor connected with your key — so pick whichever scenario fits your situation.</p>

<h2>Which path fits you?</h2>
<table>
<thead><tr><th>Where are you working?</th><th>Use this</th></tr></thead>
<tbody>
<tr><td>School/lab computer — you can't install anything system-wide, and nothing is pre-installed</td><td>Scenario A (Codespaces) — simplest, nothing to install. Scenario C also works (VS Code has a no-admin user install), but it takes one extra step.</td></tr>
<tr><td>Your own Mac</td><td>Scenario B (local OpenCode) — fast to set up. Scenario C also works.</td></tr>
<tr><td>Your own Windows laptop</td><td>Scenario A or Scenario C. Scenario B works, but the local install is often slow on Windows — only use it if you're comfortable with a terminal and have time to spare.</td></tr>
</tbody>
</table>
<p>A lab computer will not already have VS Code, OpenCode, or Git on it — don't assume otherwise.</p>

<h2>0. Before you start (everyone)</h2>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account. You need this whichever scenario you use: Codespaces runs on it directly, Copilot needs it to activate, and coursework is submitted through GitHub regardless of which AI tool you choose.</li>
<li>Collect your API key at <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a>. Class code: <code>chi3242</code> for CHI 3242, <code>dhg502</code> for DHG 502. Keep the key private — do not put it in a repository or share it with anyone.</li>
</ol>

<h2>A. GitHub Codespaces (browser, nothing installed)</h2>
<p>Everything happens in the browser — nothing is installed on the computer. Use this if you can't install software, or simply prefer not to.</p>
<ol>
<li>Go to the template <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>, click <strong>Use this template</strong>, and create <strong>your own</strong> repository (name it after your course, e.g. <code>chi3242</code> or <code>dhg502</code>). Do not edit the template itself.</li>
<li>Open that new repository. Click the green <strong>Code</strong> button → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. The first startup takes a few minutes while packages install. Everything then runs in the browser.</li>
</ol>
<p>Then choose the tool you want to use:</p>

<h3>Using OpenCode</h3>
<ol>
<li>In the Codespace terminal, type <code>opencode</code> and press Enter.</li>
<li>Type <code>/connect</code>, select <strong>OpenRouter</strong>, and paste your API key.</li>
<li>Type <code>/models</code> and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h3>Using Copilot</h3>
<ol>
<li>Open the Chat panel (the chat icon at the top of the window, or in the sidebar). Inside a Codespace, Copilot Chat is already signed in with your GitHub account — no separate sign-in needed.</li>
<li>Click the gear icon in the Chat panel and choose <strong>Manage Language Models</strong> (or open the Command Palette — <strong>View → Command Palette</strong> — and run <strong>Chat: Manage Language Models</strong>).</li>
<li>Click <strong>Add Models</strong>, choose <strong>OpenRouter</strong>, and paste your API key.</li>
<li>Pick your model from the Chat model picker below the chat box.</li>
</ol>

<p><strong>When you finish a session:</strong> commit and push your changes, then delete the Codespace — go to <a href="https://github.com/codespaces">github.com/codespaces</a>, click <strong>...</strong> next to it, and choose <strong>Delete</strong>. Don't just close the browser tab: GitHub gives every account a limited number of free Codespace hours per month, and an idle Codespace keeps counting against that allowance until it's deleted (GitHub does eventually remove long-idle Codespaces automatically, but that can take days). Anything not pushed to the repository is lost when the Codespace is deleted.</p>

<h2>Installing VS Code (for Scenarios B and C)</h2>
<p>Skip this section if you're only using Codespaces. Otherwise, install VS Code before continuing.</p>
<ul>
<li><strong>Windows:</strong> go to <a href="https://code.visualstudio.com/">code.visualstudio.com</a> and download it. The page offers a <strong>User Installer</strong> and a <strong>System Installer</strong> — always choose the <strong>User Installer</strong>. It installs only for your account, needs no administrator password, and is the only one that works on a lab computer. There is no reason to use the System Installer, even on your own laptop.</li>
<li><strong>macOS:</strong> download the <code>.zip</code> from the same page and drag <strong>Visual Studio Code.app</strong> into <strong>Applications</strong>. If you're on a lab Mac and can't write to <code>Applications</code>, run it directly from the Downloads folder instead. No administrator password is needed either way.</li>
</ul>

<h2>B. Local VS Code + OpenCode</h2>
<p>This scenario is for your own computer. It generally does not work on a lab computer, since installing OpenCode needs a terminal and write access that lab machines don't give you.</p>

<h3>macOS</h3>
<ol>
<li>Open a terminal: <strong>Applications → Utilities → Terminal</strong>, or in VS Code choose <strong>Terminal → New Terminal</strong>.</li>
<li>Paste this line and press Enter:
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
Wait until it finishes. The program is now on your disk — but the terminal you just used still doesn't know the new command.</li>
<li>Open a new terminal, or reload your settings: close the terminal and open a new one (easiest), or run <code>source ~/.zshrc</code> in the same window.</li>
<li>Check that it works: type <code>opencode</code>. If OpenCode starts, you're done. Then type <code>/connect</code>, select <strong>OpenRouter</strong>, paste your API key, type <code>/models</code>, and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h3>Windows</h3>
<p><strong>Before you start:</strong> this path is often slow and can be fiddly on Windows. If you can, use Scenario A (Codespaces) or Scenario C (Copilot) instead. The steps below are here if you still want to install OpenCode locally.</p>
<ol>
<li>Open <a href="https://git-scm.com/">Git Bash</a>, or the terminal in VS Code.</li>
<li>Paste this line and press Enter:
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
Wait until it finishes — this step can take a while on Windows.</li>
<li>Open a new Git Bash window, or run <code>source ~/.bashrc</code> in the same one.</li>
<li>Check that it works: type <code>opencode</code>. Then type <code>/connect</code>, select <strong>OpenRouter</strong>, paste your API key, type <code>/models</code>, and select <strong>GLM-5.3-Flash</strong>.</li>
</ol>

<h2>C. VS Code + GitHub Copilot (bring your own key)</h2>
<p>This works on your own computer, or on a lab computer where you've installed VS Code with the User Installer above. No terminal is needed.</p>
<ol>
<li><strong>Install VS Code</strong> if you haven't already — see the section above.</li>
<li><strong>Activate Copilot (first time only).</strong> Open the Chat panel — the chat icon at the top of the window, or in the sidebar. (Recent versions of VS Code include Chat by default; if you don't see it, install the <strong>GitHub Copilot Chat</strong> extension from the Extensions view first — the puzzle-piece icon in the sidebar.) Click <strong>Sign in to GitHub</strong> and complete the sign-in in your browser using the GitHub account from Step 0, then return to VS Code. This step unlocks the Chat panel — you still won't need a paid Copilot subscription, since the model itself is billed through your OpenRouter key.</li>
<li><strong>Add your OpenRouter key.</strong> In the Chat panel, click the gear icon and choose <strong>Manage Language Models</strong> (or open the Command Palette and run <strong>Chat: Manage Language Models</strong>). Click <strong>Add Models</strong>, choose <strong>OpenRouter</strong>, and paste your API key.</li>
<li><strong>Pick your model</strong> from the Chat model picker below the chat box.</li>
</ol>

<p>Return to your syllabus: <a href="../CHI3242/">CHI 3242</a> · <a href="../DHG502/">DHG 502</a>.</p>

</div>
<div class="lang-zh" lang="zh-Hant">

<p>本頁說明三種將人工智能編程助手（OpenCode 或 GitHub Copilot）連接到課程發放的 OpenRouter 金鑰的方法。三條路最終殊途同歸——編輯器裡的助手連上你的金鑰——請按自己的情況任選一種。</p>

<h2>該選哪一條路？</h2>
<table>
<thead><tr><th>你在哪裡操作？</th><th>建議做法</th></tr></thead>
<tbody>
<tr><td>學校電腦室——無法安裝任何系統層級的軟件，機器上也沒有預先裝好任何東西</td><td>方案 A（Codespaces）——最簡單，無須安裝。方案 C 也可以（VS Code 有免管理員權限的「使用者安裝」），但多一個步驟。</td></tr>
<tr><td>自己的 Mac</td><td>方案 B（本機 OpenCode）——設定快。方案 C 也可以。</td></tr>
<tr><td>自己的 Windows 手提電腦</td><td>方案 A 或方案 C。方案 B 也可行，但在 Windows 上本機安裝常常較慢——只有在熟悉終端機且時間充裕時才建議使用。</td></tr>
</tbody>
</table>
<p>電腦室的機器不會事先裝好 VS Code、OpenCode 或 Git——不要假設已經有。</p>

<h2>0. 開始前（所有人）</h2>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號。無論選哪條路都需要：Codespaces 直接建立在此帳號上，Copilot 需要它來啟用，而且不論用哪種人工智能工具，課業都是透過 GitHub 提交的。</li>
<li>請到 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領取你的 API 金鑰。課程代碼：CHI 3242 為 <code>chi3242</code>，DHG 502 為 <code>dhg502</code>。請妥善保管金鑰——不要把它寫進倉庫，也不要與任何人分享。</li>
</ol>

<h2>方案 A：GitHub Codespaces（瀏覽器，不必安裝任何東西）</h2>
<p>一切都在瀏覽器裡進行——電腦上不必安裝任何東西。若無法安裝軟件，或單純不想安裝，就走這條路。</p>
<ol>
<li>前往模板 <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>，按 <strong>Use this template</strong>，建立<strong>你自己的</strong>倉庫（以課程代碼命名，例如 <code>chi3242</code> 或 <code>dhg502</code>）。不要直接在模板上修改。</li>
<li>進入你剛建立的倉庫。按綠色 <strong>Code</strong> 按鈕 → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>。首次啟動需數分鐘以完成套件安裝，之後一切都在瀏覽器裡進行。</li>
</ol>
<p>接著選擇你要使用的工具：</p>

<h3>使用 OpenCode</h3>
<ol>
<li>在 Codespace 終端機輸入 <code>opencode</code>，按 Enter。</li>
<li>輸入 <code>/connect</code>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰。</li>
<li>輸入 <code>/models</code>，選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h3>使用 Copilot</h3>
<ol>
<li>打開 Chat 面板（視窗上方或側邊欄的聊天圖示）。在 Codespace 裡，Copilot Chat 已經用你的 GitHub 帳號登入了，不必另外登入。</li>
<li>按 Chat 面板裡的齒輪圖示，選擇 <strong>Manage Language Models</strong>（或打開命令選項板——<strong>View → Command Palette</strong>——執行 <strong>Chat: Manage Language Models</strong>）。</li>
<li>按 <strong>Add Models</strong>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰。</li>
<li>在聊天輸入框下方的模型選擇器中選定你的模型。</li>
</ol>

<p><strong>做完一次作業請：</strong>先 commit 並 push，再刪除 Codespace——前往 <a href="https://github.com/codespaces">github.com/codespaces</a>，按它旁邊的 <strong>...</strong>，選擇 <strong>Delete</strong>。不要只是關掉瀏覽器分頁：每個帳號每月有限額的免費 Codespace 使用時數，閒置的 Codespace 在被刪除前會持續計入額度（GitHub 最終會自動移除長期閒置的 Codespace，但可能要數天）。尚未推送到倉庫的內容，Codespace 一刪就找不回來。</p>

<h2>安裝 VS Code（供方案 B 及方案 C 使用）</h2>
<p>如果只用 Codespaces，可跳過此節；否則請先安裝 VS Code，再繼續下面的步驟。</p>
<ul>
<li><strong>Windows：</strong>前往 <a href="https://code.visualstudio.com/">code.visualstudio.com</a> 下載。網頁會提供 <strong>User Installer</strong>（使用者安裝）與 <strong>System Installer</strong>（系統安裝）——一律選 <strong>User Installer</strong>。它只安裝在你的帳號下，不需要管理員密碼，也是電腦室機器上唯一可行的選項。即使是自己的手提電腦，也沒有理由選 System Installer。</li>
<li><strong>macOS：</strong>在同一頁下載 <code>.zip</code>，把 <strong>Visual Studio Code.app</strong> 拖進 <strong>Applications</strong>。若在電腦室的 Mac 上無法寫入 <code>Applications</code>，可直接從下載資料夾執行。兩種情況都不需要管理員密碼。</li>
</ul>

<h2>方案 B：本機 VS Code + OpenCode</h2>
<p>此方案僅適用於自己的電腦，一般不適用於電腦室機器，因為安裝 OpenCode 需要終端機及寫入權限，而電腦室機器通常不給予這些權限。</p>

<h3>macOS</h3>
<ol>
<li>打開終端機：<strong>應用程式 → 工具程式 → 終端機</strong>；或在 VS Code 選 <strong>Terminal → New Terminal</strong>。</li>
<li>整行貼上，按 Enter：
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
等到它跑完。程式已經在硬碟上了——但你剛才用的這個視窗還不知道有這個新指令。</li>
<li>開一個新終端機，或重新讀取設定：關掉終端機再開一個新的（最簡單），或在同一視窗執行 <code>source ~/.zshrc</code>。</li>
<li>確認可以用：輸入 <code>opencode</code>。若 OpenCode 啟動了就完成了。接著輸入 <code>/connect</code>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰，輸入 <code>/models</code>，選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h3>Windows</h3>
<p><strong>開始前請注意：</strong>這條路在 Windows 上常常較慢、也較容易出狀況。若可以的話，請改用方案 A（Codespaces）或方案 C（Copilot）。以下步驟供仍想在本機安裝 OpenCode 的同學參考。</p>
<ol>
<li>打開 <a href="https://git-scm.com/">Git Bash</a>，或 VS Code 裡的終端機。</li>
<li>整行貼上，按 Enter：
<pre>curl -fsSL https://opencode.ai/install | bash</pre>
等到它跑完——在 Windows 上這一步可能要花一些時間。</li>
<li>開一個新的 Git Bash 視窗，或在同一視窗執行 <code>source ~/.bashrc</code>。</li>
<li>確認可以用：輸入 <code>opencode</code>。接著輸入 <code>/connect</code>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰，輸入 <code>/models</code>，選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2>方案 C：VS Code + GitHub Copilot（自帶金鑰）</h2>
<p>此方案適用於自己的電腦，或已用上面的 User Installer 在電腦室機器上裝好 VS Code的情況。不需要終端機。</p>
<ol>
<li><strong>安裝 VS Code</strong>（如果還沒裝）——見上一節。</li>
<li><strong>啟用 Copilot（僅首次需要）。</strong>打開 Chat 面板——視窗上方或側邊欄的聊天圖示。（近期版本的 VS Code 已內建 Chat；若看不到，請先在擴充功能檢視（側邊欄的拼圖圖示）中安裝 <strong>GitHub Copilot Chat</strong> 擴充功能。）按 <strong>Sign in to GitHub</strong>，在瀏覽器中用第 0 節的 GitHub 帳號完成登入，再返回 VS Code。此步驟是為了解鎖 Chat 面板——你仍然不需要付費的 Copilot 訂閱，因為模型本身是透過你的 OpenRouter 金鑰計費。</li>
<li><strong>加入你的 OpenRouter 金鑰。</strong>在 Chat 面板按齒輪圖示，選擇 <strong>Manage Language Models</strong>（或打開命令選項板，執行 <strong>Chat: Manage Language Models</strong>）。按 <strong>Add Models</strong>，選擇 <strong>OpenRouter</strong>，貼上你的 API 金鑰。</li>
<li>在聊天輸入框下方的模型選擇器中<strong>選定你的模型</strong>。</li>
</ol>

<p>返回課程大綱：<a href="../CHI3242/">CHI 3242</a> · <a href="../DHG502/">DHG 502</a>。</p>

</div>
</div>
