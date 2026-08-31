---
layout: default
title: DHG502
---

<p class="updated">Last updated: Aug 31, 2026</p>
<div class="course-header">
<div class="course-header-info">
<h1>DHG 502 Course Syllabus</h1>
<p><strong>Digital Approaches in Historical Research</strong><br>
Term 1, 2026–2027<br>
MA in Digital History in Global Asia · Core · 3 credits</p>
<p><strong>Seminar:</strong> Mon, 6:30–9:29 pm (MPL 1201, Lingnan@West Kowloon Campus; 19 Oct cancelled; makeup on 24 Oct, Saturday; dates in the schedule)</p>
<p><strong>Instructor:</strong> Maciej Kurzynski 馬傑 (maciej.kurzynski[at]ln.edu.hk)<br>
<strong>Office hours:</strong> Tue 3:00–5:00 pm and Fri 10:00 am–12:00 pm, HSH G06, or by appointment<br>
<strong>Language of Instruction:</strong> English</p>
</div>
<div class="course-header-image">
<img src="cover.png" alt="Digital Approaches in Historical Research">
</div>
</div>

<h2>Course Description</h2>
<p>This course introduces digital humanities and their role in historical research through a practical source-to-data workflow. Students learn to turn historical texts and images into documented datasets; work with corpora, networks, structured data, and databases; annotate cultural-heritage images; and evaluate computational results. The course also examines large language models as tools for transcription, structured information extraction, semantic search, and research coding. Prior programming experience is not required. Small historical datasets, prepared examples, and guided exercises allow students to focus on historical reasoning, source criticism, validation, and interpretation rather than code complexity. From the first weeks we introduce agentic coding: AI coding assistants that help write, debug, test, and document research code. Weekly seminars combine conceptual discussion, hands-on practice, and discussion of short assigned readings. Each student presents an academic paper that uses a method covered in class. The final project applies one or more digital methods to a historical topic and presents the results through a reproducible GitHub repository and an accompanying report.</p>

<h2>Aims</h2>
<p>This course aims to train MA students to apply digital tools independently to historical research questions, and to evaluate critically how new technologies are changing the discipline. Students will learn to write, debug, and evaluate research code with AI coding assistants, while remaining attentive to the limits of methods and to ethical challenges, and will design a project that brings digital methods to bear on a historical problem.</p>

<h2>Learning Outcomes</h2>
<p>Upon completion of this course, students should be able to:</p>
<ul>
<li>Identify major digital-humanities tools and methods relevant to historical research</li>
<li>Turn historical texts and images into documented, structured research data</li>
<li>Apply appropriate computational methods to historical research questions</li>
<li>Use AI-assisted coding tools to write, debug, test, and document research code</li>
<li>Evaluate computational and AI-generated results against historical evidence</li>
<li>Design and communicate a reproducible project that combines digital methods with historical inquiry</li>
</ul>

<h2>Language of Instruction</h2>
<p>The course is conducted in English. Assigned readings are in English. Historical sources for assignments and the final project may be in English or in other languages relevant to the student’s research. All assessed work must be completed and submitted in English.</p>

<h2>Preliminary Setup</h2>
<p>Please complete the following <strong>before the first seminar</strong>. MA students <strong>must use their own computers</strong>; no shared classroom machines will be provided.</p>
<ol>
<li>Create a <a href="https://github.com/">GitHub</a> account.</li>
<li>Create an <a href="https://openrouter.ai/">OpenRouter</a> account (we will use free or instructor-designated models later in the course).</li>
<li>On your laptop, install <a href="https://www.python.org/downloads/">Python</a>, <a href="https://code.visualstudio.com/">Visual Studio Code (VS Code)</a>, and then <a href="https://opencode.ai/">OpenCode</a>.</li>
<li>Install or update <a href="https://www.google.com/chrome/">Google Chrome</a> or <a href="https://www.microsoft.com/edge">Microsoft Edge</a> for the image-annotation lab.</li>
</ol>
<p>Week 1 sets up the research environment (GitHub, VS Code, OpenCode, and AI coding assistants). Bring a laptop with the software already installed. If you cannot install an item or do not have administrator access, contact the instructor before the first seminar; a browser-based fallback will be provided. Never place an API key, password, or access token in a GitHub repository.</p>

<h2>Assessment</h2>
<p>Students’ progress towards the learning outcomes will be measured by means of:</p>
<table class="assessment">
<thead><tr><th>Component</th><th>Weight</th></tr></thead>
<tbody>
<tr><td>Class participation</td><td>15%</td></tr>
<tr><td>Assignment 1</td><td>15%</td></tr>
<tr><td>Assignment 2</td><td>15%</td></tr>
<tr><td>In-class presentation</td><td>15%</td></tr>
<tr><td>Project proposal</td><td>10%</td></tr>
<tr><td>Final project</td><td>30%</td></tr>
</tbody>
</table>
<p>Participation assesses preparation and engagement with readings (5%), completion of supervised practical work (5%), and constructive contributions to discussion and peer support (5%). Detailed requirements and marking criteria for all other components are available on the <a href="assignments/">assignments page</a>.</p>
<p><strong>Grading scale:</strong> A 85%–100%; A− 80%–84%; B+ 75%–79%; B 70%–74%; B− 65%–69%; C+ 60%–64%; C 55%–59%; C− 50%–54%; D+ 45%–49%; D 40%–44%; F 0%–39%</p>

<h2>Attendance Policy</h2>
<p>Students are expected to attend all seminars. <strong>One</strong> unexplained absence is permitted, no questions asked. Unexplained absences will not impact the final grade by more than 15% (the maximum you can get for class participation), unless a student misses more than four (4) meetings, in which case there will be insufficient evidence of participation to award a passing grade. Every unexplained absence (beyond the one everyone gets for free) will remove 10% from the participation component (which equals 1.5% of the final grade). For example, if you are absent two times without explanation (in addition to the one no-questions-asked absence granted to everyone), you will receive 100% − 20% = 80% of the total possible contribution from participation, which amounts to 80% × 15% = 12% of the final grade. Remember to come to class on time and prepared.</p>

<h2>AI Policy</h2>
<p>This course teaches agentic coding, and students are expected to use AI coding assistants to write, debug, test, and document research code. Every graded submission must include an <code>AI-USE.md</code> file identifying the tools and models used, the tasks for which they were used, representative prompts or session excerpts, important changes made by the student, and the checks used to verify the results. Students remain responsible for every claim, citation, line of code, and analytical decision they submit, and must be able to explain their workflow. AI-generated analytical prose may not be submitted as the student’s own work, whether verbatim or with only superficial modification. Do not upload confidential, copyrighted, sensitive, or unpublished sources to an external AI service without permission. API keys and other secrets must never be committed to GitHub. More detailed task-level rules appear with each assignment.</p>

<h2>Course Design</h2>
<p><strong>1. Seminars.</strong> Each weekly seminar combines conceptual discussion with supervised hands-on practice. The recurring workflow is source → documented data → method → validation → historical interpretation. Students begin with files, corpus construction, and structured data; then work with collocations, networks, OCR/HTR, topic models, image annotation, word vectors, databases, and large language models. Technical concepts are introduced through a manual example, a prepared interface or notebook, an agent-assisted variation, and a plain-language interpretation. Starter repositories, stable sample data, annotated screenshots, and a short English technical glossary will be provided. Prior programming experience is not required.</p>
<p><strong>2. Assignments and project proposal.</strong> Two graded assignments assess text analysis and the creation of structured data from historical sources. Assignment 0 and a short project checkpoint are not graded. The project proposal is submitted shortly after the database class so that students have more than three weeks to complete the final project. All work must be submitted through the Assignment module on Moodle. Instructions are linked in the schedule table.</p>
<p><strong>3. In-class presentations.</strong> Each student presents once. There are five presentation sessions across the term, every other week from Week 3 (Weeks 3, 5, 7, 9, and 11). Presenters find an academic paper that uses that week’s technique and introduce it orally (about 20 minutes): research question, methods, data, and conclusions, plus a critical evaluation. The rest of the seminar is discussion. Papers are not assigned; do not present a reading already listed on this syllabus. The presenter for that week leads discussion of the paper they have chosen.</p>
<p><strong>4. Final project.</strong> Students may use datasets shared in class or build their own, apply digital methods to a historical topic of their choice, and present their findings through a complete reproducible GitHub repository and an accompanying report in English. Repositories may be private; public repositories may contain only material that can lawfully and ethically be shared. Submit the repository URL and the report through Moodle before the deadline. Full requirements and the rubric are on the <a href="assignments/">assignments page</a>. The report includes:</p>
<ul>
<li><strong>Abstract:</strong> a summary of goals, experiments, and findings (max. 150 words)</li>
<li><strong>Sources and dataset:</strong> source description, provenance, rights, sampling, structure, and transformation steps</li>
<li><strong>Methods:</strong> technique(s) used and the rationale; a brief explanation of how the method works</li>
<li><strong>Validation:</strong> checks against historical evidence, error analysis, and important analytical decisions</li>
<li><strong>Analysis:</strong> results, visualizations, close readings, interpretations, and theoretical discussion</li>
<li><strong>Limitations:</strong> uncertainty, bias, ethical issues, and possible improvements</li>
</ul>

<h2>Class Schedule</h2>

<div class="table-scroll">
<table class="schedule no-event">
  <thead>
    <tr>
      <th>Week</th>
      <th>Date</th>
      <th>Topic</th>
      <th>Readings</th>
    </tr>
  </thead>
  <tbody class="block-a">
    <tr>
      <td class="week">1</td>
      <td class="date">7 Sep</td>
      <td class="topic">Introduction</td>
      <td>
        <ul class="readings">
          <li>Digital history: research questions, source criticism, and the source-to-data workflow</li>
          <li>Hands-on: Git, GitHub, VS Code, OpenCode, and carefully guided agentic coding</li>
          <li>Mats Fridlund, “A Middle Way between Normal and Paradigmatic Digital Historical Research,” in <em>Digital Histories: Emergent Approaches within the New Digital History</em> (2020)</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">2</td>
      <td class="date">14 Sep</td>
      <td class="topic">Sources as Data: Labor, Context, and Risk</td>
      <td>
        <ul class="readings">
          <li>Files as data; binary, Unicode, and UTF-8; CSV and JSON by example</li>
          <li>Metadata, provenance, sampling, archival silences, copyright, privacy, and research data</li>
          <li>Billy Perrigo, “OpenAI Used Kenyan Workers on Less Than $2 Per Hour to Make ChatGPT Less Toxic,” <em>TIME</em>, 18 January 2023</li>
          <li>Johan Jarlbrink, “All the Work that Makes It Work: Digital Methods and Manual Labour,” in <em>Digital Histories: Emergent Approaches within the New Digital History</em> (2020)</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">21 Sep</td>
      <td colspan="2"><a href="assignments/">Assignment 0 (not graded) due, 9:00 am</a></td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week" rowspan="2">3</td>
      <td class="date" rowspan="2">21 Sep</td>
      <td class="topic">Building a Corpus</td>
      <td>
        <ul class="readings">
          <li>Research questions, selection and sampling; regex; tokenization; cleaning; stopwords; transformation logs</li>
          <li>Bag of words, word frequencies, Zipf’s law, and the difference between a source and a dataset</li>
          <li>Jo Guldi, <em>The Dangerous Art of Text Mining: A Methodology for Digital History</em>, Introduction and Chapter 1</li>
          <li>Hands-on preparation: <a href="https://regexone.com/">RegexOne</a>, Lessons 1–8</li>
        </ul>
      </td>
    </tr>
    <tr class="presentation">
      <td class="topic">Presentation</td>
      <td>An academic paper of your choosing on corpus construction, text mining, or computational argument in historical research</td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">4</td>
      <td class="date">28 Sep</td>
      <td class="topic">Collocations</td>
      <td>
        <ul class="readings">
          <li>Collocation as a method; contingency tables; Fisher’s exact test; effect, significance, and historical interpretation</li>
          <li>Stefan Evert, “Corpora and Collocations”</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week" rowspan="2">5</td>
      <td class="date" rowspan="2">5 Oct</td>
      <td class="topic">Historical Network Analysis</td>
      <td>
        <ul class="readings">
          <li>Nodes, edges, and historical relationships; data formats; centrality and community</li>
          <li>Entity identity, tabular edge lists, missing relationships, and uncertainty</li>
          <li>Working with historical datasets (e.g. CBDB); Gephi, Palladio, and Python</li>
          <li>Scott B. Weingart, “Demystifying Networks, Parts I &amp; II”</li>
        </ul>
      </td>
    </tr>
    <tr class="presentation">
      <td class="topic">Presentation</td>
      <td>An academic paper of your choosing on historical network analysis</td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">9 Oct</td>
      <td colspan="2"><a href="assignments/">Final Project Checkpoint (not graded) due, 9:00 am</a></td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">12 Oct</td>
      <td colspan="2"><a href="assignments/">Assignment 1 due, 9:00 am</a></td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">6</td>
      <td class="date">12 Oct</td>
      <td class="topic">OCR, HTR, and Multimodal Transcription</td>
      <td>
        <ul class="readings">
          <li>From printed and handwritten page images to text; layout, transcription, normalization, and correction</li>
          <li>Validation with human ground truth; character and word error rates; why plausible text may still be wrong</li>
          <li>Laura Turner O’Hara, <a href="https://programminghistorian.org/en/lessons/cleaning-ocrd-text-with-regular-expressions">“Cleaning OCR’d Text with Regular Expressions”</a> (selected sections)</li>
          <li>(optional) Maria Levchenko, <a href="https://arxiv.org/abs/2510.06743">“Evaluating LLMs for Historical Document OCR: A Methodological Framework for Digital Humanities”</a> (2025), Introduction and Conclusion</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="makeup">
    <tr>
      <td></td>
      <td class="date">19 Oct</td>
      <td colspan="2">No class (Day following Chung Yeung Festival); makeup on 24 Oct (Saturday)</td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week" rowspan="2">7</td>
      <td class="date" rowspan="2">24 Oct<small class="makeup-note"> (Sat)</small></td>
      <td class="topic">Topic Modeling</td>
      <td>
        <ul class="readings">
          <li>LDA; what is a “topic”?; model choices, close reading, and interpretive limits</li>
          <li>Conceptual comparison with embedding-based document clustering</li>
          <li>(optional) David M. Blei, “Probabilistic Topic Models” (2012)</li>
        </ul>
      </td>
    </tr>
    <tr class="presentation">
      <td class="topic">Presentation</td>
      <td>An academic paper of your choosing on topic modeling</td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">8</td>
      <td class="date">26 Oct</td>
      <td class="topic">Cultural Heritage and Image Annotation</td>
      <td>
        <ul class="readings">
          <li>Interpretation, preservation, reconstruction, authenticity, and the digital representation of cultural heritage</li>
          <li>Hands-on: use <a href="https://immarkus.xmarkus.org/">IMMARKUS</a> to annotate regions in an East Asian historical image; inspect CSV and JSON-LD exports</li>
          <li>Brief demonstration: organizing and tagging personal archival photographs with <a href="https://tropy.org/">Tropy</a></li>
          <li>Freeman Tilden, <em>Interpreting Our Heritage</em>, Introduction and selected chapter on interpretation</li>
          <li>(optional) Hilde De Weerdt et al., <a href="https://dhq.digitalhumanities.org/vol/19/4/000808/000808.html">“Contextual Semantic Text and Image Annotation in the MARKUS Environment”</a>, <em>Digital Humanities Quarterly</em> 19, no. 4 (2025), selected sections</li>
          <li>Lab guide: <a href="https://ldas.jp/en/posts/immarkus-handson/">“Reading Digital Historical Sources with IIIF and Web Annotation—An IMMARKUS Hands-on”</a></li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">6 Nov</td>
      <td colspan="2"><a href="assignments/">Assignment 2 due, 9:00 am</a></td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week" rowspan="2">9</td>
      <td class="date" rowspan="2">2 Nov</td>
      <td class="topic">Conceptual History and Word Vectors</td>
      <td>
        <ul class="readings">
          <li>What is meaning? Word vectors and cosine similarity</li>
          <li>Static and contextual embeddings; conceptual change and historical bias</li>
          <li>(optional) Daniel Jurafsky and James H. Martin, “Vector Semantics and Embeddings”</li>
        </ul>
      </td>
    </tr>
    <tr class="presentation">
      <td class="topic">Presentation</td>
      <td>An academic paper of your choosing on word embeddings or computational conceptual history</td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">10</td>
      <td class="date">9 Nov</td>
      <td class="topic">Databases and Structured Historical Data</td>
      <td>
        <ul class="readings">
          <li>Schemas, records, fields, data types, identifiers, and one-to-many relationships</li>
          <li>CSV versus JSON; SQLite and introductory SQL; why a database is not a spreadsheet</li>
          <li>In-class: build and query a small database of historical people, sources, and events</li>
          <li>Agustín Cosovschi, <a href="https://programminghistorian.org/en/lessons/designing-database-nodegoat">“From Sources to Data: Designing a Database for the Humanities and Social Sciences with nodegoat”</a> (selected sections)</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">13 Nov</td>
      <td colspan="2"><a href="assignments/">Final Project Proposal due, 9:00 am</a></td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week" rowspan="2">11</td>
      <td class="date" rowspan="2">16 Nov</td>
      <td class="topic">LLM Workflows for Historical Sources</td>
      <td>
        <ul class="readings">
          <li>From BERT to GPT; next-token probability, context, tokens, and APIs</li>
          <li>JSON-schema structured outputs; information and entity extraction; source-linked semantic search and retrieval-augmented generation (RAG)</li>
          <li>Hands-on: extract a small batch, check it against human-coded examples, and record errors</li>
          <li>Ted Underwood, Laura K. Nelson, and Matthew Wilkens, “Can Language Models Represent the Past without Anachronism?”</li>
          <li>Thierry Poibeau, “What Do Historical Language Models Model?”</li>
          <li>(optional) Maximilian Hindermann et al., <a href="https://openhumanitiesdata.metajnl.com/articles/10.5334/johd.481">“The RISE Humanities Data Benchmark: A Framework for Evaluating Large Language Models for Humanities Tasks”</a> (2026), Introduction</li>
        </ul>
      </td>
    </tr>
    <tr class="presentation">
      <td class="topic">Presentation</td>
      <td>An academic paper of your choosing on large language models, structured extraction, semantic search, or RAG in historical research</td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">12</td>
      <td class="date">23 Nov</td>
      <td class="topic">Evaluating AI and Critical Reflection</td>
      <td>
        <ul class="readings">
          <li>Error taxonomies; precision and recall; citation checking; temporal bias; abstention; privacy, cost, and inspectable agent workflows</li>
          <li>Historical-persona simulation as an adversarial exercise: identify ventriloquism, unsupported claims, anachronism, and archival silences</li>
          <li>American Historical Association, <a href="https://www.historians.org/resource/guiding-principles-for-artificial-intelligence-in-history-education/">“Guiding Principles for Artificial Intelligence in History Education”</a> (2025), selected principles</li>
          <li>Carl T. Bergstrom and Jevin D. West, <em>Calling Bullshit: The Art of Skepticism in a Data-Driven World</em>, Chapters 4 (“Causality”) and 5 (“Numbers and Nonsense”)</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="block-a">
    <tr>
      <td class="week">13</td>
      <td class="date">30 Nov</td>
      <td class="topic">Data Visualization, Reproducibility, and Project Clinic</td>
      <td>
        <ul class="readings">
          <li>Visualization as argument; moving between aggregate patterns and close reading</li>
          <li>Data dictionaries, dependencies, transformation logs, README files, re-run checks, and responsible sharing</li>
          <li>Toby Burrows, <a href="https://doi.org/10.1007/s42803-023-00068-9">“Reproducibility, Verifiability, and Computational Historical Research”</a> (2023), selected sections</li>
          <li>(optional) Nan Z. Da, “The Computational Case against Computational Literary Studies,” <em>Critical Inquiry</em> 45, no. 3 (2019)</li>
          <li>Final-project clinic and peer troubleshooting</li>
        </ul>
      </td>
    </tr>
  </tbody>
  <tbody class="due">
    <tr>
      <td></td>
      <td class="date">7 Dec</td>
      <td colspan="2">Final project due, 9:00 am</td>
    </tr>
  </tbody>
</table>
</div>

<h2>Important Notes</h2>
<ol>
<li>Students are expected to spend a total of 9 hours (i.e. 3 hours of class contact and 6 hours of personal study) per week to achieve the course learning outcomes.</li>
<li>Students shall be aware of the University regulations about dishonest practice in course work, tests and examinations, and the possible consequences as stipulated in the Regulations Governing University Examinations. In particular, plagiarism, being a kind of dishonest practice, is “the presentation of another person’s work without proper acknowledgement of the source, including exact phrases, or summarised ideas, or even footnotes/citations, whether protected by copyright or not, as the student’s own work.” Students are required to strictly follow university regulations governing academic integrity and honesty.</li>
<li>To enhance students’ understanding of plagiarism, a mini-course “Online Tutorial on Plagiarism Awareness” is available on <a href="https://pla.ln.edu.hk/">https://pla.ln.edu.hk/</a>.</li>
</ol>
