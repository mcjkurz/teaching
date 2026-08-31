---
layout: default
title: DHG502 Assignments
---

<p class="updated">Last updated: Aug 31, 2026</p>
<h1>DHG 502 Assignments</h1>

<h2>Submission Rules</h2>
<ul>
<li>All assessed work is individual unless the instructor explicitly states otherwise. You may discuss methods and help classmates troubleshoot, but the submitted repository, analysis, and prose must be your own. Acknowledge any substantial help.</li>
<li>Submit the requested files and repository URL through Moodle. The Moodle timestamp determines whether work is on time.</li>
<li>A repository may be public or private. For a private repository, grant the instructor access before the deadline. Do not put your student ID in a public repository.</li>
<li>Only redistribute sources and data that are public domain, openly licensed, or shared with permission. If material is restricted, provide metadata, stable links, and acquisition instructions instead of uploading the files.</li>
<li>Never commit API keys, passwords, access tokens, or other secrets. Store keys outside the repository (for example, in a local <code>.env</code> file excluded by <code>.gitignore</code>). If a key is exposed, revoke it immediately.</li>
<li>Every graded submission must include <code>AI-USE.md</code>. Identify each AI tool and model used; describe the tasks for which it was used; include representative prompts or session excerpts; explain important changes you made; and state how you checked the output. If no AI was used, state this explicitly.</li>
<li>Analytical prose must be written by the student. AI may help with code and troubleshooting, but students must understand and be able to explain everything they submit.</li>
<li>If illness or another serious circumstance may prevent timely submission, request an extension as early as possible and provide documentation when required. Approved extensions carry no penalty. Unapproved late work is handled under the programme’s current late-submission rules.</li>
</ul>

<h2>Assignment 0 (not graded)</h2>
<p><strong>Due:</strong> 21 Sep, 9:00 am</p>
<p>Create a GitHub repository and submit its URL on Moodle. This exercise checks that the basic workflow functions before graded work begins. The repository must include:</p>
<ul>
<li><code>README.md</code> with your name, course code, a one-sentence description, and the source citation</li>
<li><code>data/source.txt</code>, a short historical source saved as UTF-8 plain text</li>
<li><code>.gitignore</code> containing at least <code>.env</code></li>
</ul>
<p>Do not include your student ID in the repository. The source should be public domain or openly licensed; otherwise, use a short instructor-provided source.</p>

<h2>Final Project Checkpoint (not graded)</h2>
<p><strong>Due:</strong> 9 Oct, 9:00 am</p>
<p>Submit 250–350 words on Moodle addressing:</p>
<ul>
<li>a preliminary historical research question</li>
<li>a candidate primary-source collection and how you can lawfully access or share it</li>
<li>one possible digital method and why it may help answer the question</li>
<li>one likely problem involving data quality, language, bias, ethics, or feasibility</li>
</ul>
<p>This is an early feasibility check, not a commitment. The topic and method may change before the graded proposal.</p>

<h2>Assignment 1: From Text to Evidence (15%)</h2>
<p><strong>Due:</strong> 12 Oct, 9:00 am</p>
<p>Use a small historical text to create, inspect, and interpret a reproducible word-frequency analysis. Submit the repository URL on Moodle. The repository must include:</p>
<ul>
<li><code>README.md</code> with your name, research question, source metadata and rights, source URL, and exact instructions for running the analysis</li>
<li><code>data/source.txt</code> (plain text, UTF-8)</li>
<li><code>analysis.py</code> or <code>analysis.ipynb</code>, which reads the source, tokenizes it, removes clearly documented stopwords, and creates all required outputs</li>
<li><code>output/stats.txt</code> (encoding, character count, token count, and unique type count)</li>
<li><code>output/top20.csv</code> (top-20 content words as <code>word,count</code>)</li>
<li><code>figures/top20.png</code> (a readable bar chart with title, labels, and source note)</li>
<li><code>report.md</code> (800–1,200 words in English) explaining the question, source selection, preprocessing decisions, findings, close reading of examples, and limitations</li>
<li><code>AI-USE.md</code> following the course-wide requirements above</li>
<li><code>requirements.txt</code> if the analysis needs packages that are not part of the Python standard library</li>
</ul>

<h3>Marking criteria</h3>
<ul>
<li><strong>Source and data documentation (20%):</strong> complete citation, provenance, rights, encoding, and transparent preprocessing decisions</li>
<li><strong>Method and code (25%):</strong> correct, readable workflow that creates the required outputs</li>
<li><strong>Outputs and visualization (15%):</strong> accurate statistics, valid CSV, and an effective, properly labelled chart</li>
<li><strong>Historical interpretation (30%):</strong> a focused argument connecting aggregate patterns to specific passages and acknowledging uncertainty</li>
<li><strong>Reproducibility and AI disclosure (10%):</strong> usable instructions, dependencies, organized repository, and complete <code>AI-USE.md</code></li>
</ul>

<h2>Assignment 2: From Historical Sources to Structured Data (15%)</h2>
<p><strong>Due:</strong> 6 Nov, 9:00 am</p>
<p>Create a small structured dataset from historical page images. Choose one of the following tracks:</p>
<ul>
<li><strong>Track A—OCR/HTR:</strong> transcribe 3–5 printed or handwritten pages, then represent each page as a structured record with stable identifiers, source metadata, transcription text, method, and validation status.</li>
<li><strong>Track B—Image annotation:</strong> use IMMARKUS to create at least 20 meaningful region-level annotations across one or more historical images, using a small schema designed around a historical question.</li>
</ul>
<p>The instructor will provide suitable source sets and starter files. Students may propose their own public-domain or openly licensed material.</p>

<h3>Required repository contents</h3>
<ul>
<li><code>README.md</code> with your name, chosen track, research question, source citation and rights, data model, and instructions</li>
<li><code>sources.md</code> listing every source image, holding institution, stable URL, licence or access condition, and access date</li>
<li><code>schema.json</code> defining each field or annotation class in plain language, including its data type and one example</li>
<li><code>data/raw/</code> containing permitted source files or a text file of acquisition links; Track A also includes raw machine transcriptions, and Track B preserves the original IMMARKUS JSON-LD export</li>
<li><code>output/records.json</code> and <code>output/records.csv</code>, containing equivalent structured data in valid JSON and CSV</li>
<li><code>validation.md</code> documenting a manual check of at least 20% of the output (or one complete page, whichever is larger), an error table, corrections made, and errors that remain</li>
<li><code>report.md</code> (600–900 words in English) explaining how the schema represents the source, what the structured data reveals, two or more close-read examples, and the method’s limitations</li>
<li><code>AI-USE.md</code> and, when code is used, the code plus <code>requirements.txt</code></li>
</ul>

<h3>Marking criteria</h3>
<ul>
<li><strong>Sources and data model (20%):</strong> appropriate source selection, complete provenance/rights, stable identifiers, and a coherent schema</li>
<li><strong>Transcription or annotation (25%):</strong> careful, consistent work tied accurately to the source images</li>
<li><strong>Structured outputs (20%):</strong> valid, equivalent, and well-organized JSON/CSV, with the original evidence preserved</li>
<li><strong>Validation (20%):</strong> meaningful human checking, explicit error categories, corrections, and honest reporting of residual uncertainty</li>
<li><strong>Interpretation, documentation, and AI disclosure (15%):</strong> historically useful interpretation, clear repository guidance, and complete <code>AI-USE.md</code></li>
</ul>

<h2>In-class Presentation (15%)</h2>
<p>Give one presentation of approximately 20 minutes during an assigned presentation week. Select an academic paper that uses that week’s method; obtain the instructor’s approval and do not choose a reading already on the syllabus. Explain the research question, historical context, sources/data, method, main findings, and limitations. End with two questions for class discussion. Submit your slides or speaking notes and <code>AI-USE.md</code> on Moodle before class.</p>

<h3>Marking criteria</h3>
<ul>
<li><strong>Research question and historical context (20%)</strong></li>
<li><strong>Explanation of sources, data, and method (25%)</strong></li>
<li><strong>Critical evaluation of evidence, assumptions, and limitations (30%)</strong></li>
<li><strong>Organization, timing, and accessible delivery (15%)</strong></li>
<li><strong>Discussion questions and facilitation (10%)</strong></li>
</ul>

<h2>Final Project Proposal</h2>
<p><strong>Weight:</strong> 10%<br>
<strong>Due:</strong> 13 Nov, 9:00 am</p>
<p>Submit a 600–800-word proposal and <code>AI-USE.md</code> in English through Moodle. The proposal must include:</p>
<ul>
<li>a focused historical research question and its significance</li>
<li>brief engagement with at least three relevant scholarly works</li>
<li>the primary sources and proposed dataset, including provenance, access, rights, sampling, and a small inspected sample</li>
<li>the planned data structure or schema</li>
<li>the proposed method and why it fits the question</li>
<li>a validation plan explaining what will be checked manually and how errors or uncertainty will be recorded</li>
<li>the expected outputs or visualizations</li>
<li>a realistic work plan from proposal to submission, plus risks and a fallback plan</li>
</ul>

<h3>Marking criteria</h3>
<ul>
<li><strong>Question, significance, and scholarship (25%)</strong></li>
<li><strong>Sources, feasibility, provenance, and rights (20%)</strong></li>
<li><strong>Data model and methodological fit (20%)</strong></li>
<li><strong>Validation and treatment of uncertainty (15%)</strong></li>
<li><strong>Outputs, schedule, risks, and fallback plan (10%)</strong></li>
<li><strong>Clarity, citations, and AI disclosure (10%)</strong></li>
</ul>

<h2>Final Project (30%)</h2>
<p><strong>Due:</strong> 7 Dec, 9:00 am</p>
<p>Use one or more course methods to answer a focused historical question. Submit the repository URL and a 2,000–3,000-word report in English through Moodle. The report word count excludes the abstract, bibliography, captions, and appendices.</p>

<h3>Required repository contents</h3>
<ul>
<li><code>README.md</code> with the question, a short project summary, repository map, and exact instructions for reproducing the analysis</li>
<li><code>data/</code> with shareable data, or metadata and acquisition instructions when sources are restricted</li>
<li><code>data-dictionary.md</code> or <code>schema.json</code> defining fields, units, categories, identifiers, and missing values</li>
<li><code>code/</code> or <code>notebooks/</code> containing the complete analysis workflow</li>
<li><code>output/</code> and <code>figures/</code> containing the results used in the report</li>
<li><code>requirements.txt</code> (or an equivalent environment file) with the software dependencies</li>
<li><code>AI-USE.md</code> following the course-wide requirements</li>
<li>the final report in Markdown, PDF, or both</li>
</ul>

<h3>Report structure</h3>
<ul>
<li><strong>Abstract:</strong> goals, methods, and findings (maximum 150 words)</li>
<li><strong>Question and context:</strong> historical significance and relevant scholarship</li>
<li><strong>Sources and dataset:</strong> provenance, rights, sampling, structure, and transformations</li>
<li><strong>Methods:</strong> explanation and justification understandable to a historian</li>
<li><strong>Validation:</strong> manual checks, error analysis, and consequential analytical decisions</li>
<li><strong>Analysis:</strong> results, visualizations, close reading, and historical interpretation</li>
<li><strong>Limitations and conclusion:</strong> uncertainty, bias, ethics, findings, and possible improvements</li>
</ul>

<h3>Marking criteria</h3>
<ul>
<li><strong>Historical question, scholarship, and argument (25%)</strong></li>
<li><strong>Sources, data, provenance, and ethics (15%)</strong></li>
<li><strong>Methodological implementation and fit (20%)</strong></li>
<li><strong>Validation, error analysis, and limitations (15%)</strong></li>
<li><strong>Interpretation and visualization (15%)</strong></li>
<li><strong>Reproducibility, documentation, citations, and AI disclosure (10%)</strong></li>
</ul>
