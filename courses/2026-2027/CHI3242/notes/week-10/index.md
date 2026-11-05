---
layout: default
title: CHI3242 第10週講義
---

<p class="updated">最後更新：2026年11月5日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第10週　編碼器（一）：詞向量</h1>

<h2>1. 回顧</h2>
<p>「觀其伴，知其義」：一個詞的意義，可以從它<strong>和哪些詞一起出現</strong>看出來。<strong>word2vec</strong> 就是根據這一點，從大量文本中自動學出每個詞的<strong>向量</strong>：</p>
<ul>
<li>一個窗口滑過文本，模型學著用<strong>中心詞</strong>預測它周圍的<strong>語境詞</strong>；</li>
<li>一起出現的詞，向量被<strong>拉近</strong>一點；隨機抽到的詞，被<strong>推遠</strong>一點；</li>
<li>兩個詞有多相似，用<strong>餘弦相似度</strong>來量：方向越接近，cos θ 越接近 1。</li>
</ul>
<p>向量之間還可以做<strong>加減法</strong>。把意思相同、只在某一方面相反的詞相減（例如「女 − 男」），共有的部分互相抵消，留下的就是一個<strong>方向</strong>。用很多對詞取<strong>平均</strong>，雜訊會抵消，方向更清楚。最後把任何一個詞<strong>投影</strong>到這個方向上（和它算餘弦相似度），就得到這個詞在這個方向上的「分數」。</p>
<p>詳見本週<a href="../../slides/word-meaning/">投影片</a>，特別是最後的「加分」部分。</p>

<h2>2. 課堂／課後練習：哪些詞最「粵」？</h2>
<p><strong>問題：</strong>我們把粵語句子和國語句子<strong>混在一起</strong>，訓練<strong>一個</strong> word2vec 模型。模型從來不知道世界上有「粵語」和「國語」。如果用 20 對意思相同的粵語／國語詞找出一個「粵語方向」，再把所有詞投影上去，排在最前面的 100 個詞，是不是都是粵語詞？</p>
<ul>
<li>粵語：<a href="https://huggingface.co/datasets/raptorkwok/ccpc-dataset-v2.1">raptorkwok/ccpc-dataset-v2.1</a> 的 <code>yue</code> 欄（約 85 萬句書面粵語）</li>
<li>國語：<a href="https://huggingface.co/datasets/yuhuanstudio/PTT-pretrain-zhtw">yuhuanstudio/PTT-pretrain-zhtw</a>（台灣 PTT 論壇的貼文）。兩邊都是<strong>繁體字</strong>、都以口語化的文字為主，所以模型很難靠字形分辨它們，差別主要在「粵語 vs. 國語」。</li>
<li>分詞：jieba 加上繁體詞典 <code>dict.txt.big</code>，以及一份粵語詞表 <a href="cantonese_words.txt"><code>cantonese_words.txt</code></a>（jieba 本身不認得「我哋」「鍾意」這類粵語詞）</li>
<li>工具：<a href="https://radimrehurek.com/gensim/models/word2vec.html">gensim 的 <code>Word2Vec</code></a>、jieba、numpy</li>
</ul>
<p>把下面四個提示<strong>依序</strong>貼給你的智能體（agent）。每一步做完，先看它的報告，再貼下一個。國語資料檔有 849 MB，第一步的下載要幾分鐘；之後每一步都在一兩分鐘內完成。</p>

<div class="prompt">
<p class="prompt-label">提示 1　安裝與下載</p>
<pre>Install gensim, jieba, pyarrow, numpy and requests in this project's Python environment, and check that they import.

Download these files into corpora/. Stream large files to disk instead of loading them into memory, and skip any file that is already there:
- Cantonese: the three files https://huggingface.co/datasets/raptorkwok/ccpc-dataset-v2.1/resolve/main/data/SPLIT-00000-of-00001.parquet, where SPLIT is train, validation and test. Save them as corpora/ccpc_train.parquet, corpora/ccpc_validation.parquet and corpora/ccpc_test.parquet.
- Mandarin: https://huggingface.co/datasets/yuhuanstudio/PTT-pretrain-zhtw/resolve/main/ppt_pretrain.json (849 MB), saved as corpora/ptt.json. Show a progress bar.
- jieba's dictionary for traditional characters: https://raw.githubusercontent.com/fxsjy/jieba/master/extra_dict/dict.txt.big
- a list of Cantonese words: https://raw.githubusercontent.com/mcjkurz/teaching/main/courses/2026-2027/CHI3242/notes/week-10/cantonese_words.txt

Tell me the size of each file.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 2　分句、分詞、混合</p>
<pre>Write scripts/prepare_corpus.py that builds one mixed corpus with the same number of Cantonese and Mandarin sentences.

1. Cantonese: read only the "yue" column of the three ccpc parquet files (do NOT use the "zh" column) and keep the non-empty sentences.
2. Mandarin: corpora/ptt.json is a large JSON list of posts {"text": ...}, and each "text" value is on a single line, so read the file line by line instead of loading it whole. In each post, keep only the part after "內文: ", remove URLs, and split it into sentences at 。！？!?；;…，, and at line breaks or 2+ spaces. Keep a sentence only if it has at least 4 Chinese characters, Chinese characters make up at least half of it, it is at most 200 characters long, it does not start with ※ > ： or :, and it does not contain 引述.
3. Randomly pick 300,000 sentences from each side (random seed 42). For Mandarin, sample from the whole file (e.g. reservoir sampling), not just the first posts.
4. Segment every sentence with jieba: first jieba.set_dictionary("corpora/dict.txt.big"), then jieba.add_word() for every line of corpora/cantonese_words.txt. Drop empty tokens.
5. Shuffle the Cantonese and Mandarin sentences together and save them to corpora/mixed_segmented.txt, one sentence per line, tokens separated by a single space.

Run the script. Report the number of sentences and tokens for each side, and show me 5 random lines of the output.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 3　訓練 word2vec</p>
<pre>Write scripts/train_word2vec.py that trains gensim's Word2Vec on corpora/mixed_segmented.txt (use gensim's LineSentence) with these parameters:
vector_size=100, window=5, min_count=5, sg=1, negative=5, epochs=3, workers=4, seed=42.
Save the model to models/canto_mando.model.

Run the script. Report how long training took and the vocabulary size. Then show me the 10 most similar words to each of 唔, 不, 食, 吃 and 香港, and the cosine similarity of the pairs (唔, 不) and (嘅, 的).</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 4　「粵語方向」與投影</p>
<pre>Write scripts/cantonese_axis.py that loads models/canto_mando.model and uses these 20 (Cantonese, Mandarin) word pairs with the same meaning:
唔/不, 係/是, 嘅/的, 佢/他, 我哋/我們, 乜嘢/什麼, 邊個/誰, 冇/沒有, 食/吃, 飲/喝, 睇/看, 講/說, 畀/給, 嘢/東西, 屋企/家, 而家/現在, 鍾意/喜歡, 攰/累, 邊度/哪裡, 返工/上班

1. Skip any pair where a word is not in the model's vocabulary, and tell me which ones were skipped.
2. Normalize every word vector to length 1. For each pair, compute (Cantonese vector − Mandarin vector). Average these differences and normalize the result to length 1: this is the "Cantonese direction".
3. Score every word in the vocabulary that appears at least 50 times and contains at least one Chinese character: score = (its normalized vector) · (the Cantonese direction), i.e. its cosine similarity with the direction. Positive = Cantonese, negative = Mandarin.
4. Save outputs/cantonese_axis.csv with columns word, score, count, sorted by score.
5. Save outputs/top100.md with three tables (rank, word, score, count): the 100 words with the highest scores (most Cantonese), the 100 with the lowest scores (most Mandarin), and the scores of the 40 seed words.

Run the script. Show me the top 20 words on each side.</pre>
</div>

<p>提示：訓練時，gensim 可能會先印出幾行 <code>Exception ignored in: 'gensim.models.word2vec_inner.our_dot_float'</code>。這是 gensim 啟動時的自我檢查，不影響結果，可以忽略。</p>

<h3>觀察與詮釋</h3>
<p>打開 <code>outputs/top100.md</code>：</p>
<ul>
<li>最「粵」的 100 個詞，是不是都是粵語詞？最「國」的 100 個呢？有沒有<strong>意外</strong>的詞？</li>
<li>有些詞上榜，不是因為它是粵語或國語，而是因為兩個論壇談的<strong>話題</strong>不同（香港的地名、歌手，台灣的城市、球隊……）。找幾個例子：這個方向量到的，除了「語言」還有什麼？</li>
<li>20 對種子詞自己落在哪裡？哪一對最接近 0？為什麼？</li>
<li>改動詞對再跑一次提示 4：只用其中 10 對，或者換上你自己想到的詞對（例如 啱／對、咁／這麼）。前 100 名變了多少？</li>
<li>（進階）找一段文字，例如西西《我城》的一段，把每個詞的分數取平均：這段文字有多「粵」？</li>
</ul>

<h2>延伸閱讀</h2>
<ul>
<li>Tomas Mikolov, Kai Chen, Greg Corrado, and Jeffrey Dean, <a href="https://arxiv.org/abs/1301.3781">“Efficient Estimation of Word Representations in Vector Space”</a> (2013)</li>
<li>Austin C. Kozlowski, Matt Taddy, and James A. Evans, <a href="https://doi.org/10.1177/0003122419877135">“The Geometry of Culture: Analyzing the Meanings of Class through Word Embeddings”</a>, <em>American Sociological Review</em> 84, no. 5 (2019)</li>
<li>gensim 文件：<a href="https://radimrehurek.com/gensim/models/word2vec.html">Word2Vec</a></li>
</ul>
