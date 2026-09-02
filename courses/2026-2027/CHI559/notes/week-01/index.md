---
layout: default
title: CHI559 第1週講義
---

<p class="updated">最後更新：2026年9月2日</p>
<h1>第1週　導論</h1>

<p>本週在 GitHub Codespaces 中搭建研究環境，並用 OpenCode 完成一次可重跑的《紅樓夢》文體計量練習。模板已透過 <code>requirements.txt</code> 與 <code>setup.sh</code> 裝好 jieba、qhchina、numpy、matplotlib、scikit-learn 等套件，無須再建虛擬環境或重裝。</p>

<h2>1. 建立倉庫並啟動 Codespace</h2>
<ol>
<li>註冊 <a href="https://github.com/">GitHub</a> 帳號。</li>
<li>前往模板倉庫 <a href="https://github.com/mcjkurz/qh-starter">https://github.com/mcjkurz/qh-starter</a>，按 <strong>Use this template</strong>，建立你自己的倉庫（不要直接在模板上改）。</li>
<li>進入你剛建立的倉庫，按 <strong>Code → Codespaces → Create codespace</strong>。首次啟動需數分鐘，以完成套件安裝。</li>
</ol>

<h2>2. 連接 OpenCode</h2>
<p>教師會發給你一把 OpenRouter API 金鑰。不要把金鑰寫進倉庫，也不要與他人分享。</p>
<ol>
<li>在 Codespace 終端機輸入 <code>opencode</code> 並按 Enter。</li>
<li>輸入 <code>/connect</code> 並按 Enter。</li>
<li>搜尋並選擇 <strong>OpenRouter</strong>。</li>
<li>按提示貼上 API 金鑰。</li>
<li>輸入 <code>/models</code> 並按 Enter。</li>
<li>選擇 <strong>GLM-5.3-Flash</strong>。</li>
</ol>

<h2>3. 課堂練習</h2>
<p>將下列提示完整複製，貼進 OpenCode：</p>
<div class="prompt">
<p class="prompt-label">提示 1</p>
<pre>There is a .txt file of the 红楼梦 novel in this folder.
jieba, qhchina, numpy, matplotlib, and scikit-learn are already installed; do not create a virtual environment or reinstall packages.

Load that file and separate it into 120 chapters.
Each chapter starts with 第 and the chapter number in Chinese numerals, for example:

第一回  甄士隐梦幻识通灵　贾雨村风尘怀闺秀
第八十五回  贾存周报升郎中任　薛文起复惹放流刑
第一一八回  记微嫌舅兄欺弱女　惊谜语妻妾谏痴人

Write the chapters as separate .txt files (you may create a folder for them).
Tokenize each chapter with jieba and find the 300 most common words in the entire novel.
Then use a stylometric approach: calculate a z-score for each of those word frequencies in each chapter, and project the chapter vectors into 3D space with PCA.
Color chapters 1–80 red and chapters 81–120 blue.
For Chinese fonts, import qhchina and call load_fonts() from it.
Save a .png at the end.
The script must be restartable, so write a .py file as well.</pre>
</div>

<p>完成後，檢查結果：在左側檔案列表中點開 <code>.png</code> 檔。</p>
<p>確認無誤後，再把下列提示貼進 OpenCode：</p>
<div class="prompt">
<p class="prompt-label">提示 2</p>
<pre>Create an HTML page that lets me rotate and move that 3D PCA projection.
The page should also show the top 20 positive features and the top 20 negative features
for the first 80 chapters and for the last 40 chapters.</pre>
</div>

<p>完成後，在左側點開產生的 HTML 檔。若一切順利，你應看到類似下面的結果：可旋轉的三維投影，以及前八十回與後四十回的正負特徵詞。</p>
<figure class="example">
<img src="expected-result.png" alt="《紅樓夢》三維 PCA 與正負特徵詞的預期結果">
<figcaption>預期結果示例</figcaption>
</figure>
