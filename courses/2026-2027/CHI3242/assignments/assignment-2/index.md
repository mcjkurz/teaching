---
layout: default
title: CHI3242 Assignment 2
---

<p class="updated i18n-block"><span class="lang-en">Last updated: Oct 30, 2026</span><span class="lang-zh" lang="zh-Hant">最後更新：2026年10月30日</span></p>
<p class="i18n-block"><a href="../"><span class="lang-en">Assignments</span><span class="lang-zh" lang="zh-Hant">作業</span></a> · <a href="../../"><span class="lang-en">CHI 3242 syllabus</span><span class="lang-zh" lang="zh-Hant">CHI 3242 課程大綱</span></a></p>
<h1 class="i18n-block"><span class="lang-en">Assignment 2: Train Your Own Text Classifier</span><span class="lang-zh" lang="zh-Hant">作業2：訓練自己的文本分類器</span></h1>

<div class="i18n-block">
<div class="lang-en">
<p><strong>Due:</strong> 11 Nov, 9:00 am</p>
<p>Choose a question that can be answered by assigning one of two or more labels to a piece of text. Possible topics include positive versus negative sentiment, embodied versus abstract language, or another distinction that interests you. Define what each label means, prepare and label your own training data, and train a logistic regression classifier using the methods from class.</p>
<p>After evaluating the classifier on data held out from training, use it to analyze a separate text or collection of texts of your choice. Your goal is not only to report a score, but to explain what the model gets right and wrong, and what its predictions reveal (or fail to reveal) about your chosen text.</p>
<p>On Moodle, submit two things: the URL of one public GitHub repository and a PDF of your report. Everything needed to understand and reproduce your analysis (data, code, output, and the report itself in both Markdown and PDF) should live inside the repository. Do not include your name or student ID in the public repository. The repository must include:</p>
<ul>
<li><code>README.md</code> (your research question, label definitions, the source and sampling method for each dataset, and instructions for running your code)</li>
<li><code>data/</code> (your labeled training data in a clear, documented format, such as a CSV with one text item and one label per row; include the separate text you analyze if you are permitted to share it)</li>
<li>Python script(s) (<code>.py</code>) for preparing the data, splitting it, training and evaluating the model, and applying it to your analysis text</li>
<li><code>output/</code> (the test-set predictions and evaluation results, plus the predictions for your analysis text)</li>
<li><code>report.md</code> <strong>and</strong> <code>report.pdf</code> (the same short report in both formats), <strong>2,500–3,000 characters</strong>. Submit the PDF separately on Moodle as well.</li>
</ul>
<p><strong>Method requirements:</strong></p>
<ul>
<li>Use a classification task with <strong>two or more</strong> clearly defined labels (binary is fine; three or more classes are also welcome). Each text item must receive exactly one label. Choose a consistent unit (for example, a sentence, review, post, or paragraph) and explain your labeling rules.</li>
<li>Prepare and label at least <strong>200 text items per class</strong>. Keep the classes reasonably balanced where possible. Explain where the data came from and how you selected or wrote the items. Do not include private or identifying material that you do not have permission to publish.</li>
<li>Split the labeled data into training and test sets before fitting the model. Use an approximately 80/20 split, stratify by label, and set a fixed random seed so your results can be reproduced. Keep the test set separate: fit the text vectorizer and classifier on the training data only, and use the test set only for final evaluation. Do not tune the model by repeatedly checking its test-set score.</li>
<li>Train a <code>LogisticRegression</code> classifier using text features from <code>TfidfVectorizer</code>, as demonstrated in class. For Chinese text, segment it with jieba before vectorization. You may adjust reasonable settings, but report what you used.</li>
<li>Evaluate on the held-out test set. Report accuracy and a confusion matrix, and discuss precision, recall, and F1 as appropriate. For three or more classes, report per-class metrics or macro-averaged precision, recall, and F1. Include the number of items in each class so the scores can be interpreted in light of class balance.</li>
<li>Apply the trained classifier to a <strong>separate text</strong> that was not used to train or test it. Show the predicted labels (and probabilities if useful), summarize the pattern you find, and closely examine examples. Make clear that these are model predictions, not verified ground truth.</li>
</ul>
<p>The <strong>report</strong> (2,500–3,000 characters) should read as a short, well-argued essay rather than a checklist. Introduce your question and explain why the distinction matters for the text you chose. Describe your labels, data sources, sampling, and preparation; explain the train/test split and the text features used by the classifier. Present your test-set results, including accuracy and the confusion matrix, and interpret the errors: which items were misclassified, what patterns or ambiguities do they share, and what might explain the mistakes? Then analyze the predictions on your separate text. What patterns do they suggest? Where should you be cautious about taking the model’s labels at face value? Conclude by reflecting on the limits of your data, labels, and model, and what you would change with more time or data.</p>
<p>You may use AI to help with coding or writing, but the report must present your own individual analysis and interpretation. A report that is fully AI-generated will receive <strong>0 points</strong>. If there is any doubt, the instructor may ask you individually to explain your workflow and results to confirm that you understand your analysis.</p>
<p>Once your analysis is finished, <strong>commit</strong> and <strong>push</strong> the scripts, data, outputs, and report (in both <code>.md</code> and <code>.pdf</code> formats) to your repository, and upload the same PDF to Moodle.</p>
</div>
<div class="lang-zh" lang="zh-Hant">
<p><strong>截止：</strong>11月11日 上午9:00</p>
<p>請選擇一個可以透過替文本指定兩種或更多標籤之一來回答的問題。題目可以是正面／負面情感、具體／抽象語言，或其他你感興趣的區分。請定義每個標籤的意義，準備並標註自己的訓練資料，然後運用課堂所學的方法訓練邏輯迴歸分類器。</p>
<p>在未參與訓練的資料上評估分類器後，請用它分析另一段或一組自選文本。這次作業不只是報告一個分數；你還要說明模型判斷正確與錯誤之處，以及它對你選擇的文本揭示了（或未能揭示）什麼。</p>
<p>請在 Moodle 提交兩項：一個公開 GitHub 倉庫的網址，以及報告的 PDF 檔。所有理解與重現分析所需的資料、程式碼、輸出結果，以及報告的 Markdown 與 PDF 版本，都應放在倉庫裡。公開倉庫中請勿放入姓名或學號。倉庫須包含：</p>
<ul>
<li><code>README.md</code>（研究問題、標籤定義、各組資料的來源與取樣方式，以及執行程式碼的方法）</li>
<li><code>data/</code>（格式清楚且有說明的標註訓練資料，例如每列一筆文本及其標籤的 CSV；若獲准公開，也請放入用來分析的另一組文本）</li>
<li>用於準備資料、切分資料、訓練與評估模型，以及分析自選文本的 Python 腳本（<code>.py</code>）</li>
<li><code>output/</code>（測試集預測與評估結果，以及自選文本的預測）</li>
<li><code>report.md</code> <strong>與</strong> <code>report.pdf</code>（同一篇短報告的兩種格式），<strong>2,500–3,000字</strong>。PDF 另外也要在 Moodle 提交。</li>
</ul>
<p><strong>方法要求：</strong></p>
<ul>
<li>使用<strong>兩個或更多</strong>明確定義標籤的分類任務（二元即可，三個或更多類別也歡迎）。每筆文本只能屬於一個標籤。請選定一致的文本單位（例如句子、評論、貼文或段落），並說明標註規則。</li>
<li>自行準備並標註，<strong>每一類至少200筆文本</strong>。在可行情況下，各類數量應大致平衡。請說明資料來源及選取或撰寫文本的方式。未經許可，請勿納入私人或可識別個人身分的資料。</li>
<li>在擬合模型之前，先將標註資料切分為訓練集與測試集。採用約80／20的比例，按標籤分層抽樣，並設定固定的隨機種子以重現結果。測試集必須保持獨立：只用訓練資料擬合文本向量器與分類器，並只用測試集做最終評估。不要反覆查看測試集分數來調整模型。</li>
<li>依照課堂示範，使用 <code>TfidfVectorizer</code> 將文本轉為特徵，並訓練 <code>LogisticRegression</code> 分類器。中文文本在向量化之前，請先用 jieba 分詞。你可以調整合理的參數，但須報告實際使用的設定。</li>
<li>在保留的測試集上評估模型。報告準確率與混淆矩陣，並適當討論精確率、召回率與 F1。若有三個或更多類別，請報告各類指標或宏平均（macro-average）的精確率、召回率與 F1。請列出各類的筆數，讓讀者能依類別比例解讀分數。</li>
<li>將訓練好的分類器用於一組<strong>未參與訓練或測試的另一組文本</strong>。呈現預測標籤（若有幫助，也可呈現機率）、整理觀察到的模式並仔細檢視例子。請清楚說明這些是模型預測，不是已確認的真實標籤。</li>
</ul>
<p><strong>報告</strong>（2,500–3,000字）應該是一篇論證清楚的短文，而不是條列式的檢查清單。請介紹你的問題，並說明為何這項區分對所選文本很重要。描述標籤、資料來源、取樣與處理方式，並解釋訓練／測試切分及分類器使用的文本特徵。呈現測試集結果，包括準確率與混淆矩陣，並詮釋錯誤：哪些文本被錯誤分類？它們有何共同模式或歧義？可能的原因是什麼？接著分析分類器對另一組文本的預測。這些結果顯示了什麼模式？為什麼不應全盤接受模型的標籤？最後，請反思資料、標籤與模型的限制，以及若有更多時間或資料，你會如何改進。</p>
<p>你可以使用人工智能協助撰寫程式或報告，但報告必須呈現你個人的分析與詮釋。若報告完全由人工智能生成，將獲得<strong>0分</strong>。如有疑慮，教師可能會個別要求你解釋工作流程與結果，以確認你理解自己的分析。</p>
<p>完成分析後，請把腳本、資料、輸出結果，以及 <code>.md</code> 與 <code>.pdf</code> 格式的報告<strong>commit</strong> 並 <strong>push</strong> 到你的倉庫，並把同一份 PDF 上傳到 Moodle。</p>
</div>
</div>
