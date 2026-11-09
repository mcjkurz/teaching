---
layout: default
title: DHG502 Assignments
---

<p class="updated">Last updated: Nov 9, 2026</p>
<h1>DHG 502 Assignments</h1>

<h2>Submission Rules</h2>
<ul>
<li>Assignments 0 and 1 are individual work; Assignment 2 is group work. The in-class presentation is done in a group of up to three students, as are the project proposal and final project (which may also be completed individually). You may discuss methods and help classmates troubleshoot, but acknowledge any substantial help.</li>
<li>Submit the requested files and repository URL through Moodle. The Moodle timestamp determines whether work is on time.</li>
<li>A repository may be public or private. For a private repository, grant the instructor access before the deadline. Do not put your student ID in a public repository.</li>
<li>Only redistribute sources and data that are public domain, openly licensed, or shared with permission. If material is restricted, provide metadata, stable links, and acquisition instructions instead of uploading the files.</li>
<li>Every graded submission must include <code>AI-USE.md</code>. Identify each AI tool and model used; describe the tasks for which it was used; include representative prompts or session excerpts; explain important changes you made; and state how you checked the output. If no AI was used, state this explicitly.</li>
<li>Analytical prose must be written by the student. AI may help with code and troubleshooting, but students must understand and be able to explain everything they submit.</li>
<li>If illness or another serious circumstance may prevent timely submission, request an extension as early as possible and provide documentation when required. Approved extensions carry no penalty. Unapproved late work is handled under the programme’s current late-submission rules.</li>
</ul>

<h2><a href="assignment-0/">Assignment 0 (not graded)</a></h2>
<p><strong>Due:</strong> 23 Sep, 9:00 am</p>
<p>Analyze a historical source with an AI coding assistant and publish the result as a simple page on GitHub Pages. This exercise checks that the basic workflow functions before graded work begins. Full instructions are on the <a href="assignment-0/">Assignment 0 page</a>.</p>

<h2><a href="assignment-1/">Assignment 1: The Company Words Keep in Official Histories (15%)</a></h2>
<p><strong>Due:</strong> 13 Oct, 9:00 am</p>
<p>Use collocation analysis to examine how an official history represents one person, group, institution, or concept. Choose the settings that fit your source, compare a significance measure with a strength measure, read the passages behind the numbers, and submit a reproducible repository with a 1,000–1,500-word report. Do not put your name or student ID in the repository. Full instructions are on the <a href="assignment-1/">Assignment 1 page</a>.</p>

<h2 id="assignment-2">Assignment 2: Chatting with a Historical Figure’s Texts (15%)</h2>
<p><strong>Part 1 due:</strong> 15 Nov, 6:00 pm (texts)<br>
<strong>In class:</strong> 16 Nov (RAG exercise)<br>
<strong>Part 2 due:</strong> 24 Nov, 9:00 am (reflection essay)</p>
<p>This assignment is done in groups. Each group chooses a historical figure and collects digitized texts in <code>.txt</code> format (UTF-8): the figure’s own works (novels, articles, letters, and so on) or historical documents about the figure. Choose texts you know well enough to judge whether an answer about them is right. If your sources are PDFs, convert them to <code>.txt</code> first: extract the text layer, or run OCR on scanned pages as in Week 6, and check the result for errors.</p>
<ul>
<li><strong>Part 1 (15 Nov, 6:00 pm):</strong> submit the <code>.txt</code> files through Moodle, one set per group, totalling at least 1 million characters (about 250,000 words), together with a short list of where each file comes from. The instructor will use the texts to build the database for a RAG (retrieval-augmented generation) chat application.</li>
<li><strong>In class (16 Nov):</strong> each group questions the chat application about its figure and checks the answers against the sources.</li>
<li><strong>Part 2 (24 Nov, 9:00 am):</strong> submit a group reflection essay on the exercise through Moodle, with <code>AI-USE.md</code>. Instructions for the essay will be given in class on 16 Nov.</li>
</ul>

<h2>In-class Presentation (15%)</h2>
<p>Work in a group of up to three students and give one presentation of approximately 20 minutes during your chosen presentation week. Your group selects a single academic paper that uses that week’s method; obtain the instructor’s approval and do not choose a reading already on the syllabus. The paper may be in English or Chinese, but the presentation and discussion must be in English. Explain the research question, historical context, sources/data, method, main findings, and limitations. End with two questions for class discussion. Every group member must speak, and the group receives a shared mark. Submit your slides or speaking notes and <code>AI-USE.md</code> on Moodle before class.</p>

<h3>Marking criteria</h3>
<ul>
<li><strong>Research question and historical context (20%)</strong></li>
<li><strong>Explanation of sources, data, and method (25%)</strong></li>
<li><strong>Critical evaluation of evidence, assumptions, and limitations (30%)</strong></li>
<li><strong>Organization, timing, and accessible delivery (15%)</strong></li>
<li><strong>Discussion questions and facilitation (10%)</strong></li>
</ul>

<h2 id="final-project-proposal">Final Project Proposal</h2>
<p><strong>Weight:</strong> 10%<br>
<strong>Due:</strong> 20 Nov, 9:00 am</p>
<p>The proposal may be completed individually or in a group of up to three students; groups submit one shared proposal. Submit it through Moodle as <strong>one full page</strong> in <strong>.docx</strong> format, <strong>Times New Roman 12</strong>, <strong>single-spaced</strong>, in English. The proposal contains:</p>
<ul>
<li><strong>Author(s):</strong> your name, or the names of all group members (maximum three)</li>
<li><strong>Tentative title</strong></li>
<li><strong>Research questions:</strong> three questions or hypotheses you are interested in exploring</li>
<li><strong>Data:</strong> which sources, where they come from, and how much; how much work is needed to digitize them, if needed; and whether this is enough data for the chosen method</li>
<li><strong>Methods:</strong> the methods you plan to use; any method from the course so far, or a combination (collocations, topic modeling, network analysis, bias analysis, OCR, word2vec, agentic AI)</li>
</ul>

<h2>Final Project (30%)</h2>
<p><strong>Due:</strong> 7 Dec, 9:00 am</p>
<p>The final project may be completed individually or in a group of up to three students. Groups submit one shared project and identify every member. Use one or more course methods to answer a focused historical question. Submit the repository URL and a 2,000–3,000-word report in English through Moodle. The report word count excludes the abstract, bibliography, captions, and appendices.</p>

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
