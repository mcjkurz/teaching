---
layout: default
title: CHI3242 第9週講義
---

<p class="updated">最後更新：2026年10月29日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第9週　分類（一）：邏輯迴歸與情感分析</h1>

<h2>1. 回顧</h2>
<p><strong>分類</strong>是給每篇文本貼上一個<strong>標籤</strong>（例如「正面」或「負面」）。和主題模型不同，分類是<strong>有監督</strong>的：我們先有一批由人標註好的文本，讓模型從中學習。邏輯迴歸的做法是：</p>
<ul>
<li>用<strong>詞袋</strong>和 <strong>TF-IDF</strong> 把每篇文本變成一個數字向量 x；</li>
<li>給每個詞一個<strong>權重</strong> w，算出加權總分 z = w · x + b；</li>
<li>用 <strong>sigmoid</strong> 函數把 z 壓進 0 到 1 之間，得到「正面」的<strong>機率</strong> p；</li>
<li>用<strong>交叉熵損失</strong>和<strong>梯度下降</strong>，在<strong>訓練集</strong>上學出 w 和 b；</li>
<li>在模型沒看過的<strong>測試集</strong>上評估：準確率、精確率、召回率。</li>
</ul>
<p>詳見本週<a href="../../slides/logistic-regression/">投影片</a>。</p>

<h2>2. 課堂／課後練習：一部小說的「情感曲線」</h2>
<p>我們先用豆瓣評論訓練一個情感分類器，再用它逐段給一部小說打分，畫出整部小說的情感起伏。</p>
<ul>
<li>訓練資料：<a href="https://github.com/mcjkurz/qhchina-data/blob/main/datasets/classification/douban.json">qhchina-data/datasets/classification/douban.json</a>（豆瓣評論，1–5 星）</li>
<li>小說：徐懷中《牽風記》。這部小說不在 qhchina-data 中，請先把它的 <code>.txt</code> 檔存為 <code>corpora/牵风记-徐怀中.txt</code>（UTF-8）。</li>
<li>工具：jieba、scikit-learn 的 <code>TfidfVectorizer</code> 和 <code>LogisticRegression</code>、matplotlib</li>
</ul>
<p>打開你的智能體（agent）環境，把下面的提示詞貼給它。</p>

<div class="prompt">
<p class="prompt-label">提示詞（Prompt）　訓練情感分類器並畫出情感曲線</p>
<pre>Download datasets/classification/douban.json from https://github.com/mcjkurz/qhchina-data (branch main) into corpora/; it is a JSON list of {"text", "label"} records with labels 1-5. Write scripts/sentiment_arc.py that samples 5,000 five-star reviews (positive) and 5,000 one-star reviews (negative) for training plus a separate 1,000 of each for testing, tokenizes them with jieba, builds tf-idf features, and trains a scikit-learn logistic regression. Report accuracy on the 2,000 test reviews.

Read corpora/牵风记-徐怀中.txt as UTF-8, split it into passages of about 500 characters cut at sentence boundaries, and score each passage as P(positive) - P(negative). Plot the scores in order with a moving-average line and a zero baseline, and save the plot as outputs/sentiment_arc.png and per-passage scores and text as outputs/sentiment_arc.csv. Run the script and check the PNG opens.</pre>
</div>

<h3>觀察與詮釋</h3>
<ul>
<li>測試集上的準確率是多少？為什麼一定要用模型<strong>沒看過</strong>的評論來評估？</li>
<li>打開 <code>outputs/sentiment_arc.png</code>：曲線的高點和低點在哪裡？到 CSV 裡找出分數最高和最低的幾段，細讀一下：分類器說得對嗎？</li>
<li>模型是用<strong>電影評論</strong>訓練的，卻拿來讀<strong>小說</strong>。哪些段落可能被誤判？為什麼？</li>
<li>改變段落長度（例如 200 或 1,000 字）或移動平均的窗口大小，曲線的形狀會怎麼變？</li>
<li>把結果和 Kurt Vonnegut 講的「故事的形狀」對照：這部小說的曲線像哪一種？</li>
</ul>

<h2>延伸閱讀</h2>
<ul>
<li>Daniel Jurafsky and James H. Martin, <a href="https://web.stanford.edu/~jurafsky/slp3/4.pdf"><em>Speech and Language Processing</em></a> (3rd ed. draft), Chapter 4, “Naive Bayes and Sentiment Classification” (sections 4.1–4.4)</li>
<li>Kurt Vonnegut, <a href="https://www.youtube.com/watch?v=4ec0lSd7qH4">“On the Shapes of Stories”</a>（影片）</li>
<li>Hoyt Long and Richard Jean So, “Literary Pattern Recognition: Modernism between Close Reading and Machine Learning,” <em>Critical Inquiry</em> 42, no. 2 (2016)</li>
</ul>
