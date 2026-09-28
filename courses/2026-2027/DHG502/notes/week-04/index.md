---
layout: default
title: DHG 502 Week 4 Notes
---

<script>
window.MathJax = { tex: { inlineMath: [['\\(', '\\)']], displayMath: [['\\[', '\\]']] } };
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
<p class="updated">Last updated: Sep 28, 2026</p>
<p><a href="../../">DHG 502 syllabus</a> · <a href="../../slides/collocations/">Slides</a> · <a href="../../assignments/assignment-1/">Assignment 1</a></p>
<h1>Week 4 — Collocations</h1>

<h2>1. What is a collocation?</h2>
<p>A <strong>collocation</strong> is a pair of words that tend to occur near each other, or <strong>cooccur</strong>, in natural language. 喝–茶 (drink–tea) and 天氣–好 (weather–good) are collocations; 喝–桌子 (drink–table) is not. Firth (1957): <em>You shall know a word by the company it keeps.</em></p>
<p>The question is how to <strong>measure</strong> this attraction and tell it apart from chance. The idea is to compare the real text with a text in which the words have been shuffled at random. If two words cooccur in the real text far more often than they would after shuffling, they form a collocation.</p>
<p>For historians this matters because the company a word keeps is shaped by the people who wrote the source. In an official history such as the <em>Mingshi</em> 明史 (<em>History of the Ming</em>, compiled at the Qing court and completed in 1739), the words that cluster around 宦官 (eunuchs), 倭 (Japanese pirates), or the name of a minister tell us how the compilers framed that group or person: their actions, offices, and moral judgments.</p>

<h2>2. Observed frequency O and expected frequency E</h2>
<p>Fix two words: the <strong>target word</strong> X (in the slides: 王婆) and the <strong>collocate</strong> Y (痛苦).</p>
<ul>
<li><strong>Observed frequency O</strong>: how many times Y actually appears inside a <strong>window</strong> of <em>k</em> words to the left and right of X.</li>
<li><strong>Expected frequency E</strong>: how many times Y would appear there by chance alone. Analogy: 10 balls, 5 of them red; draw 4 and you expect \(4 \times 0.5 = 2\) red balls.</li>
</ul>
<p>E takes three steps:</p>
<ol>
<li>The chance that a random word is Y: \(P(Y) = \dfrac{\text{count}(Y)}{N}\), where \(N\) is the number of words in the corpus.</li>
<li>The number of slots around X: \(\text{count}(X) \times \text{window size} \times 2\) (left and right).</li>
<li>\(E = P(Y) \times \text{number of slots}\).</li>
</ol>
<p>Example (illustrative numbers):</p>
<ul>
<li>Corpus size: \(N = 50{,}000\)</li>
<li>Target: count(王婆) \(= 200\)</li>
<li>Collocate: count(痛苦) \(= 50\)</li>
<li>Window: 3 + 3</li>
</ul>
<p>Calculation:</p>
<ul>
<li>Probability: \(P(\text{痛苦}) = \dfrac{50}{50{,}000} = 0.001\)</li>
<li>Slots: \(200 \times 3 \times 2 = 1{,}200\)</li>
<li>Expected: \(E = 0.001 \times 1{,}200 = 1.2\)</li>
<li>If we observe \(O = 8\), then \(\dfrac{O}{E} = \dfrac{8}{1.2} \approx 6.7\): the pair cooccurs 6.7 times more often than chance predicts.</li>
</ul>

<h2>3. Mutual information (MI) and PPMI</h2>
<p>Taking the base-2 logarithm of \(O/E\) gives (pointwise) <strong>mutual information, MI</strong>:</p>
<p>\[\mathrm{MI} = \log_2 \frac{O}{E}\]</p>
<p>\(\log_2 x\) is the power you raise 2 to in order to get \(x\). So every doubling of the ratio adds 1 to MI, every halving subtracts 1, and \(O = E\) gives MI \(= 0\). In the example: \(\mathrm{MI} = \log_2 6.7 \approx 2.74\).</p>
<div class="table-scroll">
<table>
<thead><tr><th>\(O/E\)</th><th>MI</th><th>Meaning</th></tr></thead>
<tbody>
<tr><td>\(1/4\)</td><td>\(-2\)</td><td>far less than chance</td></tr>
<tr><td>\(1/2\)</td><td>\(-1\)</td><td>less than chance</td></tr>
<tr><td>\(1\)</td><td>\(0\)</td><td>as expected</td></tr>
<tr><td>\(2\)</td><td>\(+1\)</td><td>twice as often</td></tr>
<tr><td>\(4\)</td><td>\(+2\)</td><td>4× as often</td></tr>
<tr><td>\(8\)</td><td>\(+3\)</td><td>8× as often</td></tr>
</tbody>
</table>
</div>
<p><strong>PPMI</strong> (positive pointwise mutual information) sets every negative value to 0:</p>
<p>\[\mathrm{PPMI} = \max\!\left(0,\ \log_2 \frac{O}{E}\right)\]</p>
<p>A negative value means the words repel each other, but such values are unreliable unless the corpus is very large. PPMI is common in word vectors.</p>

<h2>4. A problem with simple measures</h2>
<p>Evert gives an example from a corpus of about one million bigrams. Here Evert <strong>does not use a window</strong> but only looks at <strong>bigrams</strong>: two adjacent words, where the collocate Y is the word directly before the target X. Each target has exactly one such slot, so the number of slots is just count(X), and E becomes:</p>
<p>\[E = P(Y) \times \text{count}(X)\]</p>
<p>Compare two pairs (Y is the first word, X the second; \(N = 1{,}000{,}000\)):</p>
<div class="table-scroll">
<table>
<thead><tr><th>Pair</th><th>count(Y)</th><th>count(X)</th><th>\(P(Y)\)</th><th>\(E\)</th><th>\(O\)</th></tr></thead>
<tbody>
<tr><td>the Iliad</td><td>100,000</td><td>10</td><td>0.1</td><td>1</td><td>10</td></tr>
<tr><td>must also</td><td>1,000</td><td>1,000</td><td>0.001</td><td>1</td><td>10</td></tr>
</tbody>
</table>
</div>
<p>Both have \(O = 10\) and \(E = 1\), so \(O/E = 10\) and \(\mathrm{MI} = \log_2 10 \approx 3.32\): identical scores.</p>
<p>Yet the situations are different. <em>Iliad</em> occurs only 10 times and every one follows <em>the</em>, so \(O = 10\) is the maximum possible. <em>must</em> and <em>also</em> occur 1,000 times each and could have cooccurred far more often. \(O\) and \(E\) ignore everything else in the corpus: we also need to look at the cases where the two words do <strong>not</strong> cooccur.</p>

<h2>5. The contingency table</h2>
<p>For two events \(X\) and \(Y\), every case falls into exactly one of four cells:</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>Y occurs</th><th>Y does not</th></tr></thead>
<tbody>
<tr><th>X occurs</th><td>a (both)</td><td>b (only X)</td></tr>
<tr><th>X does not</th><td>c (only Y)</td><td>d (neither)</td></tr>
</tbody>
</table>
</div>
<p>Contingency tables are everywhere: smoking × lung cancer, handedness × sex, two words × sentences. The question is always the same: are the two properties <strong>independent</strong>? For a word pair, the observed frequency \(O\) is the top-left cell \(a\).</p>

<h2>6. Fisher’s exact test</h2>
<h3>Background: n choose k</h3>
<p>The number of ways to choose \(k\) items out of \(n\), ignoring order, is</p>
<p>\[\binom{n}{k} = \frac{n!}{k!\,(n-k)!}\]</p>
<p>For example, choosing 4 cups out of 8: \(\dbinom{8}{4} = \dfrac{8!}{4!\,4!} = 70\).</p>
<h3>The lady tasting tea</h3>
<p>Fisher (1935): a lady claims she can tell whether the milk or the tea was poured into the cup first. She gets 8 identical-looking cups (4 milk-first, 4 tea-first) and must pick the 4 milk-first ones. The chance of getting all 4 right by guessing is only \(\dfrac{1}{70} \approx 0.014\), which is very unlikely; the chance of getting 3 right is \(\dfrac{17}{70} \approx 0.243\), which could easily be luck. This is the idea behind <strong>Fisher’s exact test</strong>: how unlikely is this table if it were all chance?</p>
<h3>The probability of one table</h3>
<p>With the row and column totals fixed, the probability of one particular table (a, b, c, d) under pure chance is:</p>
<p>\[p = \frac{\dbinom{a+b}{a}\dbinom{c+d}{c}}{\dbinom{N}{a+c}}\qquad (N = a+b+c+d)\]</p>
<p>The test adds up the probability of this table <strong>and of every more extreme table</strong>.</p>
<p>Example (illustrative numbers): 20 students (10 women, 10 men); 10 of them are studying, and 8 of those are women. “More extreme” means even more studying women (9 or 10). The three tables (all row and column totals fixed):</p>
<div class="table-scroll">
<table>
<thead><tr><th>Studying women</th><th>Women (studying / not)</th><th>Men (studying / not)</th><th>Probability of this table</th></tr></thead>
<tbody>
<tr><td>8 (observed)</td><td>8 / 2</td><td>2 / 8</td><td>\(\dfrac{2025}{184756} \approx 0.0110\)</td></tr>
<tr><td>9</td><td>9 / 1</td><td>1 / 9</td><td>\(\dfrac{100}{184756} \approx 0.0005\)</td></tr>
<tr><td>10</td><td>10 / 0</td><td>0 / 10</td><td>\(\dfrac{1}{184756} \approx 0.000005\)</td></tr>
</tbody>
</table>
</div>
<p>Adding the three: \(p = \dfrac{2126}{184756} \approx 0.0115 &lt; 0.05\), so the association between sex and studying is <strong>significant</strong>.</p>
<h3>Back to the Iliad / must also</h3>
<p>The two pairs have the same \(O\) and \(E\); now look at the full contingency tables. Every item is a bigram (1,000,000 in total); rows = the first word, columns = the second word.</p>
<p><strong>the Iliad</strong> (\(a = 10\), count(the) = 100,000, count(Iliad) = 10)</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>Iliad</th><th>not Iliad</th></tr></thead>
<tbody>
<tr><th>the</th><td>10</td><td>99,990</td></tr>
<tr><th>not the</th><td><strong>0</strong></td><td>900,000</td></tr>
</tbody>
</table>
</div>
<p><strong>must also</strong> (\(a = 10\), count(must) = 1,000, count(also) = 1,000)</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>also</th><th>not also</th></tr></thead>
<tbody>
<tr><th>must</th><td>10</td><td>990</td></tr>
<tr><th>not must</th><td><strong>990</strong></td><td>998,010</td></tr>
</tbody>
</table>
</div>
<p>The difference is in \(c\): for the Iliad \(c = 0\) (every <em>Iliad</em> follows <em>the</em>); for must also \(c = 990\) (most instances of <em>also</em> have no <em>must</em> before them). Fisher’s test gives:</p>
<ul>
<li>the Iliad: \(p \approx 1 \times 10^{-10}\)</li>
<li>must also: \(p \approx 1 \times 10^{-7}\)</li>
</ul>
<p>Both are significant, but the Iliad’s \(p\) is 1,000 times smaller. Ranking by p-value puts the Iliad first, which \(O/E\) and MI cannot do. But a p-value answers a particular question, as the next section shows.</p>

<h2>7. Statistical significance vs. strength of association</h2>
<p>Evert calls all these scores <strong>association measures</strong>, but they fall into two families that answer <strong>different questions</strong>:</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>Statistical significance</th><th>Strength of association (effect size)</th></tr></thead>
<tbody>
<tr><th>Question</th><td>Could this be chance? How sure are we that the attraction is real?</td><td>How tightly are the two words tied together?</td></tr>
<tr><th>Depends on</th><td>the strength of the pattern <strong>and</strong> the amount of evidence</td><td>only the proportions, not the size of the corpus</td></tr>
<tr><th>Measures</th><td>Fisher’s <em>p</em>, log-likelihood G², t-score</td><td>O/E, MI, Dice, logDice</td></tr>
</tbody>
</table>
</div>
<h3>Two unfair coins</h3>
<p>Coin A is flipped 10 times and lands heads 9 times: a strong bias (90% heads), but little evidence (\(p \approx 0.011\)). Coin B is flipped 100,000 times and lands heads 51,000 times: a very weak bias (51% heads), but overwhelming evidence (\(p \approx 10^{-10}\)). Coin B is more <em>significant</em>; coin A is more <em>strongly</em> biased. <strong>A p-value measures how sure we are, not how big the effect is.</strong> Frequent word pairs behave like coin B, rare pairs like coin A.</p>
<h3>Same proportions, bigger corpus</h3>
<p>Take (喝, 茶) with a 4 + 4 window, and make the corpus bigger while every proportion stays the same (values from the full contingency table, as computed in qhchina):</p>
<div class="table-scroll">
<table>
<thead><tr><th>N</th><th>O</th><th>O/E</th><th>MI</th><th>logDice</th><th>G²</th><th>Fisher <em>p</em></th></tr></thead>
<tbody>
<tr><td>5,000</td><td>3</td><td>7.46</td><td>2.90</td><td>8.87</td><td>7.7</td><td>0.006</td></tr>
<tr><td>20,000</td><td>12</td><td>7.46</td><td>2.90</td><td>8.87</td><td>30.7</td><td>\(3 \times 10^{-8}\)</td></tr>
<tr><td>2,000,000</td><td>1,200</td><td>7.46</td><td>2.90</td><td>8.87</td><td>3,070</td><td>\(10^{-669}\)</td></tr>
</tbody>
</table>
</div>
<p>The strength measures do not move; the significance measures keep growing. In a corpus the size of the <em>Mingshi</em> (millions of characters), a great many pairs are “significant”, so the p-value alone cannot tell you which collocations matter.</p>
<h3>Log-likelihood (G²): a significance measure</h3>
<p>Log-likelihood compares each of the four observed cells with the cell we would expect if the two words were unrelated:</p>
<p>\[G^2 = 2 \sum_{\text{4 cells}} O \cdot \ln \frac{O}{E}\]</p>
<p>Each cell contributes more when \(O\) is far from \(E\) <em>and</em> when the counts are large. As a rule of thumb, G² above 3.84 corresponds to \(p &lt; 0.05\) and above 10.83 to \(p &lt; 0.001\). It is a fast approximation to Fisher’s test (Dunning 1993) and answers the same question: how sure, not how strong.</p>
<h3>Dice and logDice: strength measures</h3>
<p>Dice asks what share of the two words’ occurrences they spend together:</p>
<p>\[\text{Dice} = \frac{2 \cdot O}{R_1 + C_1} \qquad \text{logDice} = 14 + \log_2 \text{Dice}\]</p>
<p>\(R_1\) is the number of slots around the target (row 1 of the table) and \(C_1\) is the frequency of the collocate (column 1). For (喝, 茶): \(\text{Dice} = \dfrac{2 \times 12}{800 + 40} \approx 0.029\) and \(\text{logDice} \approx 8.87\). The maximum is 14 (the words always occur together), and each point lower means half as strong. Because \(N\) does not appear in the formula, logDice can be compared across corpora of different sizes (Rychlý 2008).</p>
<h3>The measures can disagree</h3>
<div class="table-scroll">
<table>
<thead><tr><th>Pair</th><th>MI</th><th>logDice</th><th>G²</th><th>Fisher <em>p</em></th></tr></thead>
<tbody>
<tr><td>the Iliad</td><td>3.32</td><td>1.71</td><td><strong>46.1</strong></td><td>\(\mathbf{1 \times 10^{-10}}\)</td></tr>
<tr><td>must also</td><td>3.32</td><td><strong>7.36</strong></td><td>28.2</td><td>\(1 \times 10^{-7}\)</td></tr>
</tbody>
</table>
</div>
<p>The significance measures prefer the Iliad: every <em>Iliad</em> follows <em>the</em>, so the evidence is very consistent. logDice prefers must also: <em>the</em> occurs 100,000 times and only 10 of those precede <em>Iliad</em>, so from the point of view of <em>the</em> the tie is weak. There is no single correct measure; decide which question your research needs answered.</p>
<h3>In practice</h3>
<p>A common workflow: <strong>filter by significance, then rank by strength.</strong></p>
<ol>
<li>Keep only pairs that are unlikely to be chance (p-value or G²).</li>
<li>Because you test thousands of candidate collocates at once, some will look significant by luck; correct for this with <code>correction="fdr_bh"</code> and filter on the adjusted p-value.</li>
<li>Rank what remains by a strength measure such as logDice.</li>
<li>Go back to the passages (KWIC concordance). The numbers point; the texts explain.</li>
</ol>
<pre><code>from qhchina.analytics import find_collocates

df = find_collocates(
    sentences,
    target_words="魏忠贤",
    horizon=5,
    measures=["log_likelihood", "logDice"],
    correction="fdr_bh",
    filters={"max_adjusted_p": 0.05, "min_obs_local": 3},
    sort_by="log_dice",
)</code></pre>

<h2>8. Three ways to define “near”</h2>
<p>The contingency table stays the same; only the <strong>item</strong> being counted changes. First decide what an item is, then ask whether each item contains X and whether it contains Y.</p>
<div class="table-scroll">
<table>
<thead><tr><th></th><th>Window</th><th>Sentence</th><th>Grammatical</th></tr></thead>
<tbody>
<tr><th>“Near” means</th><td>within k words</td><td>in the same sentence</td><td>in a syntactic relation (e.g. adjective → noun)</td></tr>
<tr><th>Unit counted</th><td>tokens</td><td>sentences</td><td>word pairs</td></tr>
<tr><th>Needs</th><td>a choice of k</td><td>sentence splitting</td><td>a parser</td></tr>
</tbody>
</table>
</div>
<p>Example: finding (好, 天氣) in a small corpus.</p>
<ul>
<li><strong>Window</strong>: count the words inside the window.</li>
<li><strong>Sentence</strong>: count the sentences that contain both 好 and 天氣 (a sentence with two of them still counts once).</li>
<li><strong>Grammatical</strong>: count only adjective → noun modifiers; a predicative use such as 心情不好 does not count.</li>
</ul>
<p>In each case \(O\) is the cell \(a\) of that table. Evert’s the Iliad example uses the smallest possible window: only the word immediately before.</p>

<h2>9. In-class exercise: collocations in the <em>Mingshi</em></h2>
<p>We use <code>明史.txt</code>, which is already in your <code>dhg502</code> repository from the template (classical Chinese, traditional characters, UTF-8). Choose a <strong>target</strong>: a person (e.g. 魏忠賢, 張居正, 海瑞), a group (宦官, 倭, 流賊), an office (巡撫, 錦衣衛), or a concept (忠, 邊). Keep a short note of why you chose it and what you expect to find.</p>

<h3>Step 1: Classical Chinese needs care</h3>
<p>Tools such as jieba were trained on modern Chinese. On classical text they often split names and titles incorrectly, and many meaningful classical words are a single character. Two simple fixes help:</p>
<ul>
<li>Convert to simplified characters first (jieba works better with them), and write your target word in simplified characters too (張居正 → 张居正), or nothing will be found.</li>
<li>Give jieba a <strong>user dictionary</strong> with the names, offices, and terms your question depends on, so that they stay in one piece. Check a sample of the segmented output by eye.</li>
</ul>

<h3>Step 2: Hand it to the coding assistant</h3>
<p>Paste the prompts below into OpenCode one at a time, adjusting the file names and the target word. See the <a href="https://www.qhchina.org/docs/collocations/find-collocates/">find_collocates() documentation</a> and the <a href="https://www.qhchina.org/docs/helpers/load-stopwords/">load_stopwords() documentation</a> for all parameters.</p>

<div class="prompt">
<p class="prompt-label">Prompt 1 — sentences and segmentation</p>
<pre>明史.txt is the History of the Ming (classical Chinese, traditional characters, UTF-8).
Please install jieba, qhchina, and opencc if they are not installed yet.

Write a Python script (segment.py) that:
- loads 明史.txt
- converts the whole text to simplified Chinese characters with opencc
- loads a user dictionary for jieba from userdict.txt (one word per line); create this file with the target words I care about: TARGET WORDS, plus related names and official titles
- splits the text into sentences using Chinese sentence-ending punctuation (。！？；)
- tokenizes each sentence into words with jieba, removing punctuation marks
- keeps only sentences with at least 5 words
- saves the result as sentences.txt, one sentence per line, with the words separated by a single space
- if the source marks its chapters (卷), also saves sentence_index.csv with the 卷 number and title for each line of sentences.txt
- prints 20 random segmented sentences that contain one of my target words, so I can check the segmentation by eye</pre>
</div>

<div class="prompt">
<p class="prompt-label">Prompt 2 — collocation analysis</p>
<pre>Using sentences.txt, write a Python script (collocates.py) that finds collocates for the target word "TARGET WORD" (in simplified characters) with find_collocates from qhchina.analytics.collocations.
- Remove classical Chinese stopwords with load_stopwords("zh_cl_sim") from qhchina.
- Keep only collocates with at least 2 characters and with min_obs_local of at least 3.
- Add the measures "log_likelihood" and "logDice", use correction="fdr_bh", and keep only collocates with an adjusted p-value below 0.05.

Run it three times: method="window" with horizon=5, method="window" with horizon=10, and method="sentence". Sort each result by log_dice from high to low, save each one to its own CSV in output/ (name the files so I can tell which run is which), and print the top 20 rows of each.</pre>
</div>

<div class="prompt">
<p class="prompt-label">Prompt 3 — one HTML page</p>
<pre>Write a Python script (make_report.py) that reads the CSV files in output/ and builds a single page, output/results.html, with a dropdown to switch between the runs. In each table, let me click a column header to sort by it, so I can compare the ranking by log_likelihood with the ranking by log_dice.</pre>
</div>

<div class="prompt">
<p class="prompt-label">Prompt 4 — back to the passages</p>
<pre>Write a Python script (concordance.py) that uses kwic from qhchina.analytics.collocations to show, for the target word "TARGET WORD" and each of the collocates I list here: COLLOCATE 1, COLLOCATE 2, COLLOCATE 3, up to 10 passages where both occur (horizon=10). If sentence_index.csv exists, add the 卷 number and title to each line. Save the result as output/kwic.html.</pre>
</div>

<h3>Step 3: Observe and interpret</h3>
<p>Open <code>output/results.html</code> and compare the runs:</p>
<ul>
<li>Can the collocates be grouped? (People, offices, places, actions, punishments, moral judgments …)</li>
<li>Sort by <code>log_likelihood</code>, then by <code>log_dice</code>. Which collocates move up, which move down, and why? Which of the two rankings is closer to your historical question?</li>
<li>Compare <code>horizon=5</code> with <code>horizon=10</code>, and the window with the sentence method. Does the definition of “near” change what you find?</li>
<li>Read the KWIC passages. Does a collocate mean what you assumed? Is it a real association, an artefact of segmentation, or a formula of the genre (e.g. the standard phrasing of appointments and deaths in the biographies)?</li>
<li>Whose voice is this? What do the collocates tell you about how the Qing compilers framed your target, and what can they <strong>not</strong> tell you?</li>
</ul>
<p>When you are done, ask the coding assistant to commit and push <code>segment.py</code>, <code>collocates.py</code>, <code>make_report.py</code>, <code>concordance.py</code>, <code>userdict.txt</code>, and the <code>output/</code> folder. The same workflow is the basis of <a href="../../assignments/assignment-1/">Assignment 1</a>.</p>

<h2>10. Recap</h2>
<ol>
<li><strong>Collocation</strong>: two words that occur near each other more often than chance.</li>
<li><strong>Observed \(O\) vs. expected \(E\)</strong>; the log gives MI, dropping negatives gives PPMI.</li>
<li><strong>Contingency table</strong>: also records the cases where the words do not cooccur (a, b, c, d).</li>
<li><strong>Fisher’s exact test</strong>: how unlikely is this table if it were all chance?</li>
<li><strong>Significance is not strength</strong>: p and G² ask how sure we are; MI and logDice ask how strong the tie is.</li>
<li><strong>Three kinds of “near”</strong>: window, sentence, grammatical: the same table with different items.</li>
</ol>

<h2>Readings</h2>
<ul>
<li>Stefan Evert, “Corpora and Collocations” (main reference for this week).</li>
<li>(optional) Paul Baker, <em>Using Corpora in Discourse Analysis</em> (2006), Chapter 5, “Collocations”.</li>
<li>(optional) Ted Dunning, “Accurate Methods for the Statistics of Surprise and Coincidence,” <em>Computational Linguistics</em> 19, no. 1 (1993).</li>
<li>(optional) Pavel Rychlý, “A Lexicographer-Friendly Association Score” (2008).</li>
<li>qhchina documentation: <a href="https://www.qhchina.org/docs/collocations/find-collocates/">find_collocates()</a>, <a href="https://www.qhchina.org/docs/helpers/load-stopwords/">load_stopwords()</a>.</li>
</ul>
