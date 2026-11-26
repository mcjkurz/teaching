---
layout: default
title: CHI3242 第13週講義
---

<p class="updated">最後更新：2026年11月26日</p>
<p><a href="../../">CHI 3242 課程大綱</a></p>
<h1>第13週　課程回顧：比較兩個語料庫</h1>

<p>本週投影片：<a href="../../slides/encoder-decoder/">解碼與編碼：課程回顧</a></p>

<h2>1. 回顧：列聯表</h2>
<p>第 3 週我們用<strong>列聯表</strong>判斷兩個詞是不是搭配詞。同一張表也可以用來<strong>比較兩個語料庫</strong>：對每一個詞，數它在語料庫 A 和語料庫 B 各出現幾次，再數兩邊「其他詞」各有多少。</p>
<table>
<thead><tr><th></th><th>這個詞</th><th>其他詞</th></tr></thead>
<tbody>
<tr><td>語料庫 A（例如莫言）</td><td>a</td><td>b</td></tr>
<tr><td>語料庫 B（例如張愛玲）</td><td>c</td><td>d</td></tr>
</tbody>
</table>
<p><strong>Fisher 精確檢定</strong>問的是：如果這個詞在兩邊出現的機率其實一樣，我們看到這張表（或更極端的表）的機率有多大？這個機率就是 p 值。p 值很小，表示這個詞在其中一邊<strong>多得不像偶然</strong>。</p>
<p>qhchina 的 <a href="https://www.qhchina.org/docs/stylometry/compare-corpora/"><code>compare_corpora</code></a> 替語料庫裡的<strong>每一個詞</strong>建一張這樣的表，算一次檢定，再把結果整理成一張表格。輸出的欄位：</p>
<ul>
<li><code>word</code>：詞</li>
<li><code>abs_freqA</code>、<code>abs_freqB</code>：在 A、B 中各出現幾次</li>
<li><code>rel_freqA</code>、<code>rel_freqB</code>：相對頻率（次數 ÷ 語料庫的總詞數），兩個語料庫大小不同時，要比的是這個</li>
<li><code>rel_ratio</code>：<code>rel_freqA / rel_freqB</code>。大於 1：A 多用；小於 1：B 多用</li>
<li><code>p_value</code>：Fisher 精確檢定的 p 值（雙尾）</li>
</ul>
<p>幾個要注意的參數：</p>
<ul>
<li><code>"min_count": 5</code> 要求這個詞在<strong>兩個語料庫裡都</strong>至少出現 5 次。所以只有一位作家用的詞（例如莫言的「高粱」）不會出現在結果裡。如果只想限制 A，可以寫成 <code>(5, 0)</code>。</li>
<li><code>"max_p": 0.05</code> 只保留 p 值小於 0.05 的詞。</li>
<li>我們一次檢定了幾千個詞，難免有一些「顯著」只是偶然。更嚴格的做法是加上 <code>correction="fdr_bh"</code>，並用 <code>"max_adjusted_p": 0.05</code> 代替 <code>"max_p"</code>（兩者不能同時用）。</li>
</ul>

<h2>2. 課堂練習：莫言與張愛玲</h2>
<p>我們用 qhchina-data 裡的兩個作家語料庫：莫言的 4 部小說（《豐乳肥臀》《生死疲勞》《紅高粱家族》《酒國》），以及張愛玲的 5 部作品（《傳奇》《傾城之戀》《茉莉香片》《連環套》《金鎖記》）。用 jieba 分詞後，莫言約 86 萬詞，張愛玲約 20 萬詞。</p>
<p>把下面三個提示<strong>依序</strong>貼給你的智能體（agent）。每一步做完，先看它的報告，再貼下一個。</p>

<div class="prompt">
<p class="prompt-label">提示 1　安裝與下載</p>
<pre>Install qhchina and pandas in this project's Python environment, and check that they import.

Then write and run scripts/download.py:
from qhchina import download_corpus
download_corpus("authors/莫言", parent_dir="corpora")
download_corpus("authors/张爱玲", parent_dir="corpora")

The files will be saved in corpora/authors/莫言/ and corpora/authors/张爱玲/. List the files in each folder with their sizes.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 2　分詞與比較</p>
<pre>Write scripts/compare.py that compares the word usage of Mo Yan and Eileen Chang with qhchina:

1. Create a segmenter: from qhchina.preprocessing import create_segmenter; segmenter = create_segmenter(backend="jieba", strategy="sentence"). segmenter.segment(text) returns a list of sentences, each a list of words.
2. Read every .txt file in corpora/authors/莫言 (encoding="utf-8"), segment it, and collect all sentences in one list called moyan. Do the same for corpora/authors/张爱玲 and call the list zal. Print the number of sentences and words for each author.
3. Compare the two corpora:
   from qhchina import load_stopwords
   from qhchina.analytics import compare_corpora
   stopwords = load_stopwords("zh")
   results = compare_corpora(moyan, zal, filters={"min_count": 5, "max_p": 0.05, "min_word_length": 2, "stopwords": stopwords})
4. Save the results to outputs/results.csv (index=False, encoding="utf-8").
5. Print how many significant words there are in total, how many have rel_ratio above 1 (more typical of Mo Yan) and below 1 (more typical of Eileen Chang), and the top 20 words on each side, with their counts and rel_ratio.

Run the script.</pre>
</div>

<div class="prompt">
<p class="prompt-label">提示 3　圖與例句</p>
<pre>Write scripts/report.py that reads outputs/results.csv and:

1. Draws a horizontal bar chart of the 20 words most typical of Mo Yan and the 20 most typical of Eileen Chang, using log2(rel_ratio) as the bar length (positive = Mo Yan, negative = Eileen Chang), in two colours. Before plotting, run "from qhchina import load_fonts" and "load_fonts()" so that Chinese characters display correctly. Save it as outputs/top_words.png.
2. For the 5 most typical words on each side, finds 3 example sentences from each author that contain the word (search the original .txt files, split into sentences at 。！？), and writes them to outputs/examples.md, with the word in bold.

Run the script and show me the chart.</pre>
</div>

<h3>觀察與詮釋</h3>
<p>打開 <code>outputs/results.csv</code>、<code>outputs/top_words.png</code> 和 <code>outputs/examples.md</code>：</p>
<ul>
<li>莫言多用「<strong>老婆</strong>」，張愛玲多用「<strong>太太</strong>」：同一個「妻子」，兩個世界。你還能找到哪些這樣成對的詞？它們告訴我們兩位作家筆下的人物、地方、階層有什麼不同？</li>
<li>差異有多少來自<strong>題材</strong>（農村與上海、戰爭與家庭），有多少來自<strong>文體</strong>（敘述方式、虛詞、說話的動詞）？各舉兩個例子。</li>
<li>有沒有看起來奇怪的詞（例如張愛玲那邊的「地道」）？到 <code>examples.md</code> 裡看例句：這是作家的用詞，還是分詞的錯誤？</li>
<li>張愛玲的語料庫只有莫言的四分之一左右。這會不會影響結果？為什麼我們比較的是<strong>相對頻率</strong>？</li>
<li>把 <code>min_count</code> 改成 <code>(5, 0)</code> 再跑一次：哪些「只有莫言才用」的詞出現了？</li>
<li>把 <code>"max_p": 0.05</code> 換成 <code>correction="fdr_bh"</code> 和 <code>"max_adjusted_p": 0.05</code>：顯著的詞少了多少？</li>
</ul>

<h2>3. 用在你的期末專題</h2>
<p>很多同學的期末專題計劃都要比較兩組文本。同一個做法適用於：</p>
<ul>
<li>兩位作家，或同一位作家的早期與晚期作品；</li>
<li>兩個時代（例如 qhchina-data 裡 <code>epochs_raw</code> 的不同時期）；</li>
<li>同一部小說裡<strong>兩個人物的對話</strong>：先用正則表達式 <code>「.*?」</code>（或 <code>“.*?”</code>）抽出對話，判斷說話的人，再把兩人的話各自當作一個語料庫。</li>
</ul>
<p>只要把提示 2 裡的兩個資料夾換成你自己的文本即可。記得把 <code>outputs/results.csv</code> 放進你的 GitHub 倉庫，讀者才能檢查每一個數字。</p>

<h2>4. 程式碼參考</h2>
<p>下面是完整的程式碼，和提示 1、2 做的事情一樣：</p>
<pre><code class="language-python">import os
from qhchina import download_corpus, load_stopwords
from qhchina.preprocessing import create_segmenter
from qhchina.analytics import compare_corpora

# 下載語料庫
download_corpus("authors/莫言", parent_dir="corpora")
download_corpus("authors/张爱玲", parent_dir="corpora")

# 分詞器：按句子切分，再用 jieba 分詞
segmenter = create_segmenter(backend="jieba", strategy="sentence")

def load(folder):
    sentences = []
    for f in sorted(os.listdir(folder)):
        with open(os.path.join(folder, f), encoding="utf-8") as fp:
            sentences.extend(segmenter.segment(fp.read()))
    return sentences

moyan = load("corpora/authors/莫言")
zal = load("corpora/authors/张爱玲")

# 比較兩個語料庫
stopwords = load_stopwords("zh")
results = compare_corpora(
    moyan, zal,
    filters={"min_count": 5,
             "max_p": 0.05,
             "min_word_length": 2,
             "stopwords": stopwords},
)
results.to_csv("results.csv", index=False)</code></pre>

<h2>延伸閱讀</h2>
<ul>
<li>Adam Kilgarriff, “Comparing Corpora,” <em>International Journal of Corpus Linguistics</em> 6, no. 1 (2001)</li>
<li>Miriam Posner, <a href="https://miriamposner.com/blog/how-did-they-make-that/">“How Did They Make That?”</a></li>
<li>（選讀）Nan Z. Da, “The Computational Case against Computational Literary Studies,” <em>Critical Inquiry</em> 45, no. 3 (2019)</li>
<li>qhchina 文件：<a href="https://www.qhchina.org/docs/stylometry/compare-corpora/">compare_corpora</a>、<a href="https://www.qhchina.org/docs/helpers/download-corpus/">download_corpus</a></li>
</ul>
