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
<p>You will save the new paragraph as <code>paragraph.txt</code> (see step 4 below).</p>
<div class="prompt">
<p class="prompt-label">New paragraph (paragraph.txt)</p>
<pre>Qiu Jin 秋瑾 was born in 1875 into a family from Shaoxing, Zhejiang. In 1904 she left her husband and children and sailed to Japan to study, and in 1905 she joined the Tongmenghui there. Back in China, she founded the Chinese Women's Journal (中國女報) in Shanghai in 1907. In the same year she was arrested and executed in Shaoxing.</pre>
</div>
<p>The one-shot example that is sent to the model before the new paragraph:</p>
<div class="prompt">
<p class="prompt-label">Example paragraph</p>
<pre>Liang Qichao 梁啟超 was born in 1873 in Xinhui, Guangdong. After the Hundred Days' Reform failed in 1898, he fled to Japan, where he founded the journal 新民叢報 in 1902. He died in Beijing in 1929.</pre>
</div>
<div class="prompt">
<p class="prompt-label">Example record</p>
<pre>{"name": "Liang Qichao", "name_zh": "梁啟超", "birth_year": 1873, "death_year": 1929,
 "events": [
   {"year": 1873, "place": "Xinhui", "event": "born"},
   {"year": 1898, "place": "Japan", "event": "fled to Japan after the failed reform"},
   {"year": 1902, "place": "Japan", "event": "founded the journal Xinmin congbao"},
   {"year": 1929, "place": "Beijing", "event": "died"}]}</pre>
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
<p>Open the <code>week11</code> folder in your AI coding assistant and paste:</p>
<div class="prompt">
<p class="prompt-label">Prompt 1</p>
<pre>Write a Python script extract.py that turns a paragraph about a historical person into a JSON record, using the OpenRouter API.
- Endpoint: https://openrouter.ai/api/v1/chat/completions, model qwen/qwen3.5-9b, with reasoning disabled (extra_body={"reasoning": {"enabled": False}}).
- Use the openai Python library (pip install openai) with base_url https://openrouter.ai/api/v1. Read the API key from the environment variable OPENAI_API_KEY and set a timeout.
- Fields: name, name_zh, birth_year, death_year, and events (a list of objects with year, place, event). Allow null for everything except name and event. Send this as a strict JSON schema in response_format, and also save it as schema.json.
- Instructions for the model: extract information about the person, use only facts stated in the paragraph, and write null when the paragraph does not say.
- One-shot: before the real paragraph, send the Liang Qichao paragraph below as a user message and its JSON as an assistant message.
- Read the paragraph from paragraph.txt, print the JSON nicely indented (keep Chinese characters readable), and save it as record.json.

Example paragraph: Liang Qichao 梁啟超 was born in 1873 in Xinhui, Guangdong. After the Hundred Days' Reform failed in 1898, he fled to Japan, where he founded the journal 新民叢報 in 1902. He died in Beijing in 1929.
Example JSON: {"name": "Liang Qichao", "name_zh": "梁啟超", "birth_year": 1873, "death_year": 1929, "events": [{"year": 1873, "place": "Xinhui", "event": "born"}, {"year": 1898, "place": "Japan", "event": "fled to Japan after the failed reform"}, {"year": 1902, "place": "Japan", "event": "founded the journal Xinmin congbao"}, {"year": 1929, "place": "Beijing", "event": "died"}]}</pre>
</div>
<p>Then run:</p>
<pre>pip install openai
python extract.py</pre>
<p>If your assistant gets stuck, you can download a finished version: <a href="extract.py" download>extract.py</a>.</p>

<h2>4. Check the record, then change one thing</h2>
<ol>
<li><strong>Check</strong> every value against the paragraph and note in <code>errors.csv</code> (columns: field, value, verdict, comment) whether it is correct, wrong, or invented. Look closely at the place of birth: the paragraph names the family’s native place (籍貫), which is a different thing.</li>
<li><strong>Repeat</strong> the same paragraph three times. Does the JSON stay the same from run to run?</li>
<li><strong>Remove the example</strong> (zero-shot) and compare the events with the one-shot result.</li>
<li><strong>Use your own text</strong>: a paragraph from your Assignment 2 files about your historical figure, in English or in Chinese.</li>
</ol>

<h2>5. The database example from the slides</h2>
<p>If you want to try the SQL queries yourself, ask your coding assistant:</p>
<div class="prompt">
<p class="prompt-label">Prompt 2 (optional)</p>
<pre>Using Python's built-in sqlite3, create history.db with two tables: people (id, name, name_zh, born, died, native_place) and works (id, person_id, title, year), where person_id references people(id). Insert Yan Fu 嚴復 (1854–1921, Fuzhou, Fujian; 天演論 1898), Sun Yat-sen 孫中山 (1866–1925, Xiangshan, Guangdong; 三民主義 1924), Liang Qichao 梁啟超 (1873–1929, Xinhui, Guangdong; 少年中國說 1900, 新民說 1902), Qiu Jin 秋瑾 (1875–1907, Shaoxing, Zhejiang; 中國女報 1907) and Lu Xun 魯迅 (1881–1936, Shaoxing, Zhejiang; 狂人日記 1918, 阿Q正傳 1921). Then run and print three queries: everyone born before 1875 ordered by birth year; all works with the author's name (JOIN), ordered by year; and the number of people per native place (GROUP BY).</pre>
</div>
