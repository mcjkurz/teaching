---
layout: default
title: DHG 502 Week 11 Notes
---

<p class="updated">Last updated: Nov 23, 2026</p>
<p><a href="../../">DHG 502 syllabus</a> · <a href="../../slides/structured-data/">Slides</a></p>
<h1>Week 11 — Structured Data</h1>

<h2>1. Recap</h2>
<p>A <strong>CSV</strong> or <strong>TSV</strong> file stores a flat table as plain text, one record per line. <strong>JSON</strong> stores objects and lists, so one record can contain many works or events. A <strong>database</strong> keeps each fact once, links its tables through ids, and answers questions written in <strong>SQL</strong>. Today we ask a language model to read a paragraph and return a JSON record that follows a schema we give it, and then we check every value it returns.</p>

<h2>2. The paragraphs</h2>
<p>The data is in Chinese, as in the sources we work with. You will save the new paragraph as <code>paragraph.txt</code> (see step 4 below).</p>
<div class="prompt">
<p class="prompt-label">New data (paragraph.txt)</p>
<pre>秋瑾，1875年生，祖籍浙江紹興。1904年，她離開丈夫和子女，東渡日本留學，次年在日本加入同盟會。回國後，她於1907年在上海創辦《中國女報》。同年，她在紹興被捕，隨即就義。</pre>
</div>
<p>The one-shot example that is sent to the model before the new paragraph:</p>
<div class="prompt">
<p class="prompt-label">Example paragraph</p>
<pre>梁啟超，1873年生於廣東新會。1898年戊戌變法失敗後，他流亡日本，1902年在日本創辦《新民叢報》。1929年在北京逝世。</pre>
</div>
<div class="prompt">
<p class="prompt-label">Example record</p>
<pre>{"name": "梁啟超", "birth_year": 1873, "death_year": 1929,
 "events": [
   {"year": 1873, "place": "廣東新會", "event": "出生"},
   {"year": 1898, "place": "日本", "event": "戊戌變法失敗後流亡日本"},
   {"year": 1902, "place": "日本", "event": "創辦《新民叢報》"},
   {"year": 1929, "place": "北京", "event": "逝世"}]}</pre>
</div>

<h2>3. In-class exercise</h2>
<ol>
<li>Make a new folder called <code>week11</code> and open it in VS Code (<strong>File → Open Folder…</strong>).</li>
<li>Open a terminal (<strong>Terminal → New Terminal</strong>).</li>
<li>Give the terminal your API key from <a href="https://keyreg.qhchina.org">keyreg.qhchina.org</a>:
<pre>export OPENAI_API_KEY="your-key"</pre>
On Windows PowerShell: <code>$env:OPENAI_API_KEY="your-key"</code>. The key stays in this terminal only: in a new terminal, type the line again. Never paste the key into your code.</li>
<li>Save the Qiu Jin paragraph above as <code>paragraph.txt</code> in the <code>week11</code> folder.</li>
</ol>
<p>Open the <code>week11</code> folder in your AI coding assistant (for example OpenCode) and paste Prompt 1. It describes the script in plain words, and the assistant writes the code.</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Write a Python script called extract.py. It reads a short Chinese paragraph about a historical person from paragraph.txt, asks a language model to turn it into a JSON record, prints the record, and saves it as record.json.

How to call the model:
- Use the openai Python library (install it with pip install openai if needed).
- Connect to OpenRouter: base_url "https://openrouter.ai/api/v1", with the API key from the environment variable OPENAI_API_KEY. Never write the key into the code.
- Model: qwen/qwen3.5-9b. Turn reasoning off with extra_body={"reasoning": {"enabled": False}}.

What the record should contain:
- name, birth_year, death_year, and events (a list in which each event has year, place and event).
- null when the paragraph does not say something. The values stay in Chinese.
- Send this structure to the model as a JSON schema (response_format with type "json_schema"), and also save the schema as schema.json.

What to tell the model:
- Instructions: "Extract information about the person. Use only facts stated in the paragraph. Write null when the paragraph does not say."
- Before the real paragraph, show it one solved example (one-shot): the example paragraph below as a user message, and the example JSON below as an assistant message.

Print the JSON nicely indented, with the Chinese characters readable (not as \u codes).

Example paragraph: 梁啟超，1873年生於廣東新會。1898年戊戌變法失敗後，他流亡日本，1902年在日本創辦《新民叢報》。1929年在北京逝世。
Example JSON: {"name": "梁啟超", "birth_year": 1873, "death_year": 1929, "events": [{"year": 1873, "place": "廣東新會", "event": "出生"}, {"year": 1898, "place": "日本", "event": "戊戌變法失敗後流亡日本"}, {"year": 1902, "place": "日本", "event": "創辦《新民叢報》"}, {"year": 1929, "place": "北京", "event": "逝世"}]}</pre>
</div>
<p>Then run it in the terminal where you set the key:</p>
<pre>pip install openai
python extract.py</pre>
<p>If your assistant gets stuck, you can download a finished version: <a href="extract.py" download>extract.py</a>.</p>

<h2>4. Check the record, then change one thing</h2>
<ol>
<li><strong>Check</strong> every value against the paragraph and note in <code>errors.csv</code> (columns: field, value, verdict, comment) whether it is correct, wrong, or invented. Look closely at three values: the place of birth (the paragraph gives only the ancestral home, 祖籍, which is a different thing), and the years hidden in 次年 and 同年.</li>
<li><strong>Repeat</strong> the same paragraph three times. Does the JSON stay the same from run to run?</li>
<li><strong>Remove the example</strong> (zero-shot) and compare the events with the one-shot result. You can ask your assistant:
<div class="prompt">
<p class="prompt-label">Prompt 2</p>
<pre>Make a copy of extract.py called extract_zero.py that sends no example: only the instructions and the paragraph. It should save its result as record_zero.json. Run both scripts and show me the two records side by side.</pre>
</div></li>
<li><strong>Use your own text</strong>: copy a paragraph from your Assignment 2 files about your historical figure into <code>paragraph.txt</code> and run <code>python extract.py</code> again.</li>
</ol>

<h2>5. The database example from the slides</h2>
<p>If you want to try the SQL queries yourself, ask your coding assistant:</p>
<div class="prompt">
<p class="prompt-label">Prompt 3 (optional)</p>
<pre>Using Python's built-in sqlite3 library, create a small database file called history.db with two tables:
- people: id, name, pinyin, born, died, native_place
- works: id, person_id, title, year (person_id is the id of the author in people)
Store names, places and titles in Chinese. Insert:
嚴復 Yan Fu, 1854–1921, 福建侯官; works: 天演論 1898
孫中山 Sun Yat-sen, 1866–1925, 廣東香山; works: 三民主義 1924
梁啟超 Liang Qichao, 1873–1929, 廣東新會; works: 少年中國說 1900, 新民說 1902
秋瑾 Qiu Jin, 1875–1907, 浙江紹興; works: 中國女報 1907
魯迅 Lu Xun, 1881–1936, 浙江紹興; works: 狂人日記 1918, 阿Q正傳 1921
Then run these three SQL queries and print each query with its result:
1. everyone born before 1875, from oldest to youngest
2. all works with the author's name (a JOIN), ordered by year
3. the number of people per native place (GROUP BY)</pre>
</div>
