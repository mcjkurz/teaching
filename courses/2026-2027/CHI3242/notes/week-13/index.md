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

<h2>4. 用 API 讓語言模型找出所有對話</h2>
<p>投影片「實例二」說明了 API 呼叫：我們的程式把<strong>指示</strong>、<strong>一個例子</strong>和<strong>新段落</strong>寫成 JSON，送到 OpenRouter；模型按照我們給的 <strong>schema</strong>（欄位：<code>speaker</code>、<code>mention</code>、<code>text</code>）回答一個 JSON。這一節我們自己做一次，再檢查答案。</p>

<h3>新段落：paragraph.txt</h3>
<p>余華《活著》裡，萬二喜第一次上門看鳳霞的一段。下載 <a href="paragraph.txt" download><code>paragraph.txt</code></a>，或者把下面的文字存成這個檔案：</p>
<div class="prompt">
<p class="prompt-label">paragraph.txt</p>
<pre>萬二喜穿著中山服，乾乾淨淨的，若不是腦袋靠著肩膀，那模樣還真像是城裡來的幹部。他拿著一瓶酒一塊花布，由隊長陪著進來。家珍坐在床上，頭髮梳得很整齊，衣服破了一點，倒很乾淨，我還專門在床下給家珍放了一雙新布鞋。鳳霞穿著水紅衣服低著頭坐在她娘旁邊。家珍笑嘻嘻地看著她未過門的女婿，心裡高興著呢。
萬二喜把酒和花布往桌上一放，就翹著肩膀在屋裡轉一圈，他是在看我們的屋子。我說：
「隊長，二喜，你們坐。」
二喜嗯了一聲在凳子上坐下，隊長擺擺手說：
「我就不坐了，二喜，這是鳳霞，這是她爹和娘。」
鳳霞雙手放在腿上，看到隊長指著她，就向隊長笑，隊長指著家珍，她轉過去向家珍笑。家珍說：
「隊長，你請坐。」
隊長說：「不啦，我還有事，你們談吧。」
隊長轉身要走，留也留不住，我送走了隊長，回到屋中指指桌上的酒，對二喜說：
「讓你破費了，其實我有幾十年沒喝酒了。」
二喜聽後嗯了一聲，也不說話，翹著個肩膀在屋裡看來看去，看得我心裡七上八下。家珍笑著對他說：
「家裡窮了一點。」
二喜又嗯了一聲，翹著肩膀去看家珍，家珍繼續說：
「好在家裡還養著一頭羊幾隻雞，福貴和我商量著等鳳霞出嫁時，把雞羊賣了辦嫁妝。」</pre>
</div>

<h3>步驟</h3>
<ol>
<li>新建一個資料夾，例如 <code>week13-api</code>，在 VS Code 裡打開（<strong>File → Open Folder…</strong>），把 <code>paragraph.txt</code> 放進去。</li>
<li>打開終端機（<strong>Terminal → New Terminal</strong>），輸入你在 <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a> 領的 API 金鑰：
<pre>export OPENROUTER_API_KEY="你的金鑰"</pre>
Windows PowerShell：<code>$env:OPENROUTER_API_KEY="你的金鑰"</code>。金鑰只在這個終端機裡有效；開新的終端機要再輸入一次。<strong>不要把金鑰寫進代碼，也不要放進倉庫。</strong></li>
<li>把下面的提示貼給你的智能體。</li>
</ol>

<div class="prompt">
<p class="prompt-label">提示 4　找出所有對話</p>
<pre>Write a Python script called extract_dialogue.py. It reads a passage from a Chinese novel in paragraph.txt, asks a language model to list every line of dialogue with its speaker, prints the result, and saves it as dialogue.json and dialogue.csv (columns: id, speaker, mention, text).

How to call the model:
- Use the openai Python library (install it with pip install openai if needed).
- Connect to OpenRouter: base_url "https://openrouter.ai/api/v1", with the API key from the environment variable OPENROUTER_API_KEY. Never write the key into the code.
- Model: qwen/qwen3.5-9b. Turn reasoning off with extra_body={"reasoning": {"enabled": False}}.
- Send this structure as a JSON schema (response_format with type "json_schema", strict): an object with one field "utterances", a list of objects, each with three string fields: speaker, mention, text.

What to tell the model (system message):
"List every line of direct speech in the passage (the words inside 「」), in order. For each line give: speaker = the name of the character who says it; when the narrator speaks as 我, give the narrator's name if the passage lets you infer it; mention = the word the passage uses for the speaker just before the line (for example 我, 她, or a name); text = the words inside 「」, without the brackets. Sounds and actions such as 嗯了一聲 are not speech. Use only the passage. Keep everything in Chinese."

Before the real passage, show the model one solved example (one-shot): the example passage below as a user message, and the example JSON below as an assistant message.

Example passage: 她那時滿臉是汗，直起腰來還埋怨我：「你幹你的，過來幹什麼？」她是怕我這麼一過去，別人都注意她了，我說：「你自己留意著身體。」她急了，說：「你快走開。」我搖搖頭，只好走開。……家珍哭了，她說：「福貴，我還能養活自己嗎？」「能。」我說。
Example JSON: {"utterances": [{"speaker": "家珍", "mention": "她", "text": "你幹你的，過來幹什麼？"}, {"speaker": "福貴", "mention": "我", "text": "你自己留意著身體。"}, {"speaker": "家珍", "mention": "她", "text": "你快走開。"}, {"speaker": "家珍", "mention": "她", "text": "福貴，我還能養活自己嗎？"}, {"speaker": "福貴", "mention": "我", "text": "能。"}]}

Print the JSON nicely indented, with the Chinese characters readable (not as \u codes). Then run the script.</pre>
</div>
<p>如果智能體卡住了，可以下載寫好的版本：<a href="extract_dialogue.py" download><code>extract_dialogue.py</code></a>，在設好金鑰的終端機裡執行：</p>
<pre>pip install openai
python extract_dialogue.py</pre>

<h3>檢查答案</h3>
<p>標準答案一共有 <strong>7 句</strong>：</p>
<table>
<thead><tr><th>id</th><th>speaker</th><th>mention</th><th>text</th></tr></thead>
<tbody>
<tr><td>1</td><td>福貴</td><td>我</td><td>隊長，二喜，你們坐。</td></tr>
<tr><td>2</td><td>隊長</td><td>隊長</td><td>我就不坐了，二喜，這是鳳霞，這是她爹和娘。</td></tr>
<tr><td>3</td><td>家珍</td><td>家珍</td><td>隊長，你請坐。</td></tr>
<tr><td>4</td><td>隊長</td><td>隊長</td><td>不啦，我還有事，你們談吧。</td></tr>
<tr><td>5</td><td>福貴</td><td>我</td><td>讓你破費了，其實我有幾十年沒喝酒了。</td></tr>
<tr><td>6</td><td>家珍</td><td>家珍</td><td>家裡窮了一點。</td></tr>
<tr><td>7</td><td>家珍</td><td>家珍</td><td>好在家裡還養著一頭羊幾隻雞，福貴和我商量著等鳳霞出嫁時，把雞羊賣了辦嫁妝。</td></tr>
</tbody>
</table>
<ol>
<li>把模型的 <code>dialogue.csv</code> 和標準答案逐行比較，在 <code>errors.csv</code> 裡記下錯誤（欄位：id、field、model、correct）。特別看三個地方：
<ul>
<li><strong>「我」是誰？</strong>敘述者的名字只出現在第 7 句的「福貴和我」裡。模型寫的是「福貴」、「我」，還是別的名字？</li>
<li><strong>「家珍笑著對他說」</strong>：「他」是聽話的二喜，說話的是家珍。模型有沒有把二喜當成說話的人？</li>
<li><strong>「嗯了一聲」</strong>不是對話。模型有沒有替二喜編出一句話？</li>
</ul></li>
<li><strong>再跑三次。</strong>每次的答案都一樣嗎？</li>
<li><strong>拿掉例子</strong>（zero-shot），只送指示和段落，比較結果：<code>mention</code> 欄位還寫得對嗎？</li>
<li><strong>和正則表達式比較：</strong>用 <code>「.*?」</code> 找出所有對話，再和模型的 <code>text</code> 欄位比較。哪一種方法比較可靠？哪一種能告訴你<strong>誰</strong>在說話？</li>
<li><strong>用你自己的文本：</strong>從你的期末專題語料中選一段有對話的文字，放進 <code>paragraph.txt</code> 再跑一次。得到的 <code>dialogue.csv</code> 可以直接用第 2 節的方法比較兩個人物的用詞。</li>
</ol>

<h2>5. 程式碼參考</h2>
<p>第 2 節（比較莫言與張愛玲）的完整程式碼，和提示 1、2 做的事情一樣：</p>
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
