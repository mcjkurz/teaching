---
layout: default
title: CHI3242 Assignment 2
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Oct 30, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年10月30日</span></p>
<p class="i18n-block"><a href="../"><span class="lang-en">Assignments</span><span class="lang-zh" lang="zh-Hant">作業</span></a> · <a href="../../"><span class="lang-en">CHI 3242 syllabus</span><span class="lang-zh" lang="zh-Hant">CHI 3242 課程大綱</span></a></p>
<h1 class="i18n-block"><span class="lang-en">Assignment 2: Train Your Own Text Classifier</span><span class="lang-zh" lang="zh-Hant">作業2：訓練自己的文本分類器</span></h1>

<style>
.lr-flex { display: flex; gap: 1.5rem; align-items: flex-start; }
.lr-flex .lr-text { flex: 1; min-width: 0; }
.lr-flex .lr-fig { flex: 0 0 260px; }
.lr-flex .lr-fig img { width: 100%; height: auto; }
@media (max-width: 700px) {
  .lr-flex { flex-direction: column-reverse; align-items: stretch; }
  .lr-flex .lr-fig { flex: none; }
}
</style>

<div class="i18n-block">
<div class="lang-en">
<p><strong>Due:</strong> 11 Nov, 9:00 am</p>
<div class="lr-flex">
<div class="lr-text">
<p>In this course we have learned how to train our own logistic regression classifier to estimate the sentiment of a text (positive versus negative). This way we operationalized <a href="https://www.youtube.com/watch?v=4ec0lSd7qH4">Kurt Vonnegut's argument about the Shapes of Stories</a>. In this assignment, you are asked to choose a <strong>binary</strong> problem of your own: a question that can be answered by assigning one of two labels to a piece of text. It can be positive versus negative sentiment, embodied versus abstract language, Cao Xueqin versus Gao E (authorship), or any other distinction that interests you. Define what each label means, prepare and label your own training data, and train a logistic regression classifier using the methods from class. You may use AI to help label your training data, but do it carefully: check a sample yourself, since AI labels can be wrong or biased.</p>
</div>
<div class="lr-fig">
<img src="sigmoid.png" alt="The logistic (sigmoid) function: an S-shaped curve mapping any score z to a probability between 0 and 1">
</div>
</div>
<p>Having trained the model, use it on another text of your choice. Report how well it works, look at where it goes wrong, and say what its predictions tell you about that text.</p>
<hr>
<p>On Moodle, submit two things: the URL of one public GitHub repository and a PDF of your report. The core deliverables are the <strong>PDF report</strong>, your <strong>data</strong>, and your <strong>code</strong>, all in the repository (no name or student ID). The repository must include:</p>
<ul>
<li><code>README.md</code> (research question, label definitions, data sources, and how to run your code)</li>
<li><code>data/</code> (labeled training data as a CSV, one text item and label per row; plus the analysis text if you may share it)</li>
<li>Python script(s) (<code>.py</code>) for preparing, splitting, training, evaluating, and applying the model</li>
<li><code>output/</code> (test-set predictions and evaluation results, plus predictions for your analysis text)</li>
<li><code>report.md</code> <strong>and</strong> <code>report.pdf</code>, <strong>2,000–2,500 characters</strong>. Submit the PDF separately on Moodle. It should not be a raw Markdown export; format it cleanly, with no Markdown syntax showing.</li>
<li>Optional: an <strong>interactive analysis page</strong> (a GitHub Pages site, as before) to visualize and explore the predictions.</li>
</ul>
<p><strong>Method requirements:</strong></p>
<ul>
<li>Choose a <strong>binary</strong> task with two clearly defined labels.</li>
<li>Pick a consistent unit (sentence, review, post, or paragraph) and explain your labeling rules.</li>
<li>Prepare at least <strong>200 labeled items per class</strong> (more is better), keeping the two classes reasonably balanced.</li>
<li>Split the data into training (80%) and test (20%) sets before fitting, stratified by label with a fixed random seed.</li>
<li>Train a <code>LogisticRegression</code> classifier. Think about your features: frequencies of the most common 200 words? TF-IDF values? z-scores?</li>
<li>Evaluate on the test set: accuracy, confusion matrix, precision, recall, and F1.</li>
<li>Apply the model to a separate text of your choice and show the predicted labels (and probabilities if useful).</li>
<li>Optional: build an interactive GitHub Pages page to explore the results.</li>
</ul>
<p>The <strong>report</strong> (2,000–2,500 characters) should read as a short, well-argued essay, not a checklist. Introduce your question and why the distinction matters. Describe your labels, data, and preparation, plus the train/test split and features used. Present your test-set results (accuracy and confusion matrix) and interpret the errors: which items were misclassified, and what patterns or ambiguities explain them? Then analyze the predictions on your separate text and be cautious about taking the model’s labels at face value. Conclude with the limits of your data, labels, and model, and what you would change.</p>
<p>You may use AI to help with coding or writing, but the report must be your own analysis. A fully AI-generated report will receive <strong>0 points</strong>; if in doubt, the instructor may ask you to explain your workflow and results.</p>
<p>You may work alone or in a group of up to <strong>3 people</strong>. A group works in <strong>one shared GitHub repository</strong> and writes <strong>one report</strong>: every member submits the same repository URL and the same PDF on Moodle. List all members' names only in the Moodle upload; names should not appear in the repository.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p><strong>截止：</strong>11月11日 上午9:00</p>
<div class="lr-flex">
<div class="lr-text">
<p>在課程中，我們已經學過如何訓練自己的邏輯迴歸分類器，來估計一段文本的情感（正面或負面）。這樣一來，我們把 <a href="https://www.youtube.com/watch?v=4ec0lSd7qH4">Kurt Vonnegut 關於「故事形狀」（Shapes of Stories）的論點</a>操作化了。這次作業請你自選一個<strong>二元</strong>問題：一個可以透過替文本指定兩種標籤之一來回答的問題。可以是正面／負面情感、具體／抽象語言、曹雪芹／高鶚（作者歸屬），或任何你感興趣的區分。請定義每個標籤的意義，準備並標註自己的訓練資料，然後運用課堂所學的方法訓練邏輯迴歸分類器。你可以使用 AI 協助標註訓練資料，但請謹慎：自行抽樣檢查，因為 AI 標註可能出錯或有偏誤。</p>
</div>
<div class="lr-fig">
<img src="sigmoid.png" alt="邏輯斯（sigmoid）函數：一條 S 形曲線，把任何分數 z 對應到 0 與 1 之間的機率">
</div>
</div>
<p>訓練好模型之後，請把它用在另一段你自選的文本上。報告它的表現如何、看看它在哪裡出錯，並說明它的預測對這段文本說明了什麼。</p>
<hr>
<p>請在 Moodle 提交兩項：一個公開 GitHub 倉庫的網址，以及報告的 PDF 檔。核心交付物是<strong>PDF 報告</strong>、你的<strong>資料</strong>與<strong>程式碼</strong>，都放在倉庫裡（不放姓名或學號）。倉庫須包含：</p>
<ul>
<li><code>README.md</code>（研究問題、標籤定義、資料來源，以及執行程式碼的方法）</li>
<li><code>data/</code>（標註訓練資料 CSV，每列一筆文本與標籤；若可公開，也放入分析文本）</li>
<li>用於準備、切分、訓練、評估與應用模型的 Python 腳本（<code>.py</code>）</li>
<li><code>output/</code>（測試集預測與評估結果，以及分析文本的預測）</li>
<li><code>report.md</code> <strong>與</strong> <code>report.pdf</code>，<strong>2,000–2,500字</strong>。PDF 另外也要在 Moodle 提交。PDF 不應只是 Markdown 的直接匯出，請排版整齊，不要出現 Markdown 編輯符號。</li>
<li>可選：一個<strong>互動式分析頁面</strong>（GitHub Pages 網站，如同你之前做過的），視覺化並探索預測結果。</li>
</ul>
<p><strong>方法要求：</strong></p>
<ul>
<li>選擇一個<strong>二元</strong>任務，定義兩個清楚的標籤。</li>
<li>選定一致的文本單位（句子、評論、貼文或段落），並說明標註規則。</li>
<li><strong>每一類至少準備200筆</strong>標註文本（越多越好），兩類數量盡量平衡。</li>
<li>先將資料切分為訓練集（80%）與測試集（20%），按標籤分層並設定固定隨機種子。</li>
<li>訓練 <code>LogisticRegression</code> 分類器。請思考你的特徵：是最常見200個詞的詞頻？TF-IDF 值？還是 z-score？</li>
<li>在測試集上評估：準確率、混淆矩陣、精確率、召回率與 F1。</li>
<li>把模型用在另一段自選文本上，呈現預測標籤（若有幫助也可呈現機率）。</li>
<li>可選：建立互動式 GitHub Pages 頁面來探索結果。</li>
</ul>
<p><strong>報告</strong>（2,000–2,500字）應該是一篇論證清楚的短文，而不是條列式的檢查清單。請介紹你的問題及其重要性，描述標籤、資料與處理方式，以及訓練／測試切分和所用的特徵。呈現測試集結果（準確率與混淆矩陣）並詮釋錯誤：哪些文本被錯誤分類？有何共同模式或歧義？接著分析分類器對另一組文本的預測，並小心不要全盤接受模型的標籤。最後反思資料、標籤與模型的限制，以及你會如何改進。</p>
<p>你可以使用人工智能協助撰寫程式或報告，但報告必須是你自己的分析。完全由 AI 生成的報告將獲得<strong>0分</strong>；如有疑慮，教師可能會個別要求你解釋工作流程與結果。</p>
<p>你可以單獨完成，也可以組成最多<strong>3人</strong>的小組合作。若以小組進行，全組共用<strong>一個 GitHub 倉庫</strong>，並合寫<strong>一份報告</strong>：每位成員在 Moodle 提交相同的倉庫網址與相同的 PDF。所有成員姓名只列在 Moodle 上傳中；姓名不應出現在倉庫裡。</p>
</div>
</div>
