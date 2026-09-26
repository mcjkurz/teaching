---
layout: default
title: CHI3242 Assignment 1
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Sep 26, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年9月26日</span></p>
<p class="i18n-block"><a href="../"><span class="lang-en">Assignments</span><span class="lang-zh" lang="zh-Hant">作業</span></a> · <a href="../../"><span class="lang-en">CHI 3242 syllabus</span><span class="lang-zh" lang="zh-Hant">CHI 3242 課程大綱</span></a></p>
<h1 class="i18n-block"><span class="lang-en">Assignment 1: Operationalizing Character-Space with Collocations</span><span class="lang-zh" lang="zh-Hant">作業1：以搭配詞操作化「人物空間」</span></h1>

<div class="i18n-block">
<div class="lang-en">
<p><strong>Due:</strong> 9 Oct, 9:00 am</p>
<p>Build a corpus of your choice (one long novel, or a set of novels or stories) and use the collocation methods learned in class to examine how a particular character is represented in the text.</p>
<p>Woloch describes a <strong>character-space</strong>: the specific, delimited position a character occupies in a narrative, at the intersection of an "implied person" and the amount of narrative attention the discourse actually allocates to that person. This assignment asks you to think with, and against, this concept: <em>Is it possible to operationalize "character-space" with the help of statistical methods? What is a character-space, from the perspective of collocations?</em> A character's collocational profile (the words that co-occur with their name more often than chance would predict) is one way of tracing what a narrative routes through that character: actions, relationships, attributes, and thematic associations.</p>
<p>On Moodle, submit two things: the URL of one public GitHub repository, and a PDF of your report. Everything needed to read and reproduce your work (data, code, output, and the report itself, in both Markdown and PDF) should live inside the repository. The repository must include:</p>
<ul>
<li><code>README.md</code> (a short description of what you are analyzing: corpus title(s), author(s), and source URL(s). This repository is public, so please do not include your name or student ID.)</li>
<li><code>data/</code> (the corpus, as plain-text UTF-8 file(s))</li>
<li><code>analysis.py</code> or <code>analysis.ipynb</code> (segments the text into sentences and words with jieba, then calls <code>find_collocates</code> to compute collocates for your target character's name)</li>
<li><code>output/collocates_*.csv</code> (one CSV per run; see the method requirements below)</li>
<li><code>output/results.html</code> (a single page showing all your collocation tables together, for easy comparison)</li>
<li><code>report.md</code> <strong>and</strong> <code>report.pdf</code> (the same short essay-report in both formats), <strong>2,500–3,000 characters</strong>. Submit the PDF separately on Moodle as well.</li>
</ul>
<p><strong>Method requirements:</strong></p>
<ul>
<li>Use <code>find_collocates</code> from qhchina (<code>qhchina.analytics.collocations.find_collocates</code>), providing the arguments learned in class (target word(s), method/horizon, filters, etc.)</li>
<li>Convert your corpus to simplified Chinese characters with <code>opencc</code> <strong>before</strong> splitting it into sentences and running jieba (jieba works better with simplified characters; converting text that is already simplified is harmless)</li>
<li>Remove stopwords using <code>load_stopwords()</code> from qhchina</li>
<li>Focus on two-character words: set <code>min_word_length</code> to at least 2 in the <code>filters</code> argument</li>
<li>Keep only statistically significant collocates: set <code>max_p</code> to 0.05 in the <code>filters</code> argument, so that every collocate in your final table has a p-value below 0.05</li>
<li>Explore your results <strong>iteratively</strong>: run <code>find_collocates</code> more than once with different settings before settling on your final interpretation. Try at least two window sizes (e.g. <code>horizon=5</code> and <code>horizon=10</code>) with <code>method="window"</code>, and also try <code>method="sentence"</code> (co-occurrence within the same sentence, no horizon needed), and compare what each setting turns up. Save each run to its own CSV, and build a simple HTML page that puts all the tables together so you can browse and compare them easily. Your report should reflect this process of exploration, not just the output of a single run.</li>
</ul>
<p>The <strong>report</strong> (2,500–3,000 characters) should read as a short, well-argued essay rather than a checklist. Introduce your corpus and its scale: which novel(s) you used, where they came from, and roughly how many characters or tokens they contain. Briefly describe how you processed the text (segmentation tool, cleaning steps, and any normalization such as traditional-to-simplified conversion). Explain your method and statistical setup: how the contingency table is built, what a p-value from Fisher's exact test tells you, and why you chose the test direction (alternative) you did. Present your main results, with a small table or visualization if it helps, and then interpret them. Why is this character surrounded by these particular words, and not others? What does that distribution suggest about "character-space"? Close with a brief methodological reflection: what would a different window size, target word, or corpus have changed, and what are the limits of reading a literary character through collocations alone?</p>
<p>Once your analysis is finished, <strong>commit</strong> and <strong>push</strong> the results (scripts, data, CSVs, the HTML page, and the report in both <code>.md</code> and <code>.pdf</code>) to your repository, and upload the same PDF to Moodle.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p><strong>截止：</strong>10月9日 上午9:00</p>
<p>請自選語料建立一個語料庫（可以是一部長篇小說，也可以是多部小說或短篇），然後運用課堂所學的搭配詞方法，考察文本如何再現某一個特定角色。</p>
<p>Woloch所謂的<strong>人物空間（character-space）</strong>，指的是一個角色在敘事中所佔據的具體且有限的位置：它是「被暗示的人」（一個假設具有完整心理與存在的人）與敘事話語實際分配給這個人的注意力、篇幅，二者交會之後的產物。這次作業要你思考（並質疑）這個概念：「人物空間」能否用統計方法操作化？從搭配詞的角度看，什麼是「人物空間」？一個角色的搭配詞側寫（那些比隨機預期更常與該角色名字共現的詞）正是一種追蹤敘事話語如何透過這個角色運作的方式：他/她的行動、關係、屬性與主題聯繫。</p>
<p>請在 Moodle 提交兩項：一個公開 GitHub 倉庫的網址，以及報告的 PDF 檔。所有需要閱讀與重現你的分析的東西（語料、程式碼、輸出結果，以及報告本身，包含 Markdown 與 PDF 兩種格式）都應該放在這個倉庫裡。倉庫須包含：</p>
<ul>
<li><code>README.md</code>（簡述你分析的對象：語料書名、作者、來源網址。這是公開倉庫，請不要寫上姓名或學號。）</li>
<li><code>data/</code>（語料的純文字 UTF-8 檔案）</li>
<li><code>analysis.py</code> 或 <code>analysis.ipynb</code>（用 jieba 將文本分句、分詞，再呼叫 <code>find_collocates</code> 計算目標角色姓名的搭配詞）</li>
<li><code>output/collocates_*.csv</code>（每次執行存一個 CSV，見下方方法要求）</li>
<li><code>output/results.html</code>（一個把所有搭配詞表整合在一起的頁面，方便互相比較）</li>
<li><code>report.md</code> <strong>與</strong> <code>report.pdf</code>（同一篇短文報告的兩種格式），<strong>2,500–3,000字</strong>。PDF 另外也要在 Moodle 提交。</li>
</ul>
<p><strong>方法要求：</strong></p>
<ul>
<li>使用 qhchina 的 <code>find_collocates</code>（<code>qhchina.analytics.collocations.find_collocates</code>），並提供課堂所學的正確參數（目標詞、method／horizon、filters 等）</li>
<li>在分句、分詞<strong>之前</strong>，先用 <code>opencc</code> 把語料轉換成簡體（jieba 對簡體字的效果較好；若語料本來就是簡體，轉換也不會有任何影響）</li>
<li>用 qhchina 的 <code>load_stopwords()</code> 移除停用詞</li>
<li>聚焦於雙字詞：在 <code>filters</code> 參數中把 <code>min_word_length</code> 設為至少2</li>
<li>只保留統計上顯著的搭配詞：在 <code>filters</code> 參數中把 <code>max_p</code> 設為0.05，確保最終結果表中每一個搭配詞的 p 值都小於0.05</li>
<li><strong>反覆、逐步</strong>地探索你的結果：在定案之前不要只跑一次 <code>find_collocates</code>，至少嘗試兩種視窗大小（例如 <code>horizon=5</code> 與 <code>horizon=10</code>，用 <code>method="window"</code>），也試試 <code>method="sentence"</code>（以同一句為單位計算共現，不需要 horizon），比較不同設定會找出哪些不同的搭配詞。把每次結果分別存成 CSV，再整理成一個簡單的 HTML 頁面，方便一次瀏覽、比較。報告應反映這個反覆探索的過程，而非只呈現一次執行的結果。</li>
</ul>
<p><strong>報告</strong>（2,500–3,000字）應該讀起來像一篇論證清楚的短文，而不是條列式的檢查清單。請先簡介你的語料及其規模：用了哪部（或哪些）小說、來源為何，以及大致的字數或詞數。再簡述你的資料處理流程（分詞工具、清理步驟，以及是否做過繁簡轉換之類的正規化處理）。接著說明你的方法與統計設置：列聯表是如何建立的、Fisher精確檢定的p值告訴我們什麼，以及你為什麼選擇這樣的檢定方向（alternative）。呈現你的主要結果，若有幫助也可以附上簡單的表格或可視化，然後對結果進行詮釋。為什麼這個角色身邊圍繞著這些詞，而不是別的詞？這樣的分佈對「人物空間」這個概念有什麼啟示？結尾可以簡短反思方法本身的限制：換一個視窗大小、目標詞或語料，結果會有什麼不同？只憑搭配詞來理解一個文學角色，又有哪些做不到的地方？</p>
<p>完成分析後，請把結果（腳本、語料、CSV、HTML 頁面，以及 <code>.md</code> 與 <code>.pdf</code> 兩種格式的報告）<strong>commit</strong> 並 <strong>push</strong> 到你的倉庫，並把同一份 PDF 上傳到 Moodle。</p>
</div>
</div>

<div class="i18n-block">
<div class="lang-en">
<p>For the segmentation, collocation, and iterative-comparison workflow (including example prompts you can adapt), see the <a href="../../notes/week-04/">Week 4 lecture notes</a>.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p>分詞、搭配詞計算，以及反覆比較的完整流程（包含可以直接調整使用的提示範例），請參見<a href="../../notes/week-04/">第4週講義</a>。</p>
</div>
</div>
