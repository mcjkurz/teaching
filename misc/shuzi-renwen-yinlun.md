# Reading notes: 李飞跃 and 桑海, eds., *数字人文引论* (中华书局, 2026)

Source derivative: `sources/processed/shuzi-renwen-yinlun.txt`.
Original: `sources/original/数字人文引论.pdf` (scanned; no extractable text layer).

These notes summarize each chapter from the OCR derivative. Headings give the **printed Chinese title** first, then an English translation. Page markers below are **PDF pages** (`[PAGE N]` in the `.txt`). Running headers also carry print pagination, which does not match the PDF count. The OCR is generally strong on body text, weaker on spaces in English names, footnote markers, and some table-of-contents line breaks. Verify quotations, names, and layout-dependent claims against the original scan before citing. Marked `VERIFY` where the OCR or the summary is uncertain.

The book is an introductory handbook of Chinese digital humanities: an editorial introduction plus seventeen commissioned chapters. Editors: 李飞跃 (Tsinghua) and 桑海 (Macao Polytechnic). CIP: Beijing, Zhonghua, April 2026; ISBN 978-7-101-17674-2.

---

## 绪论　数字时代人文研究的范式跃迁 / Introduction: Paradigm Shift in Humanities Research in the Digital Age

**李飞跃.** Signed September 2025. A version appeared in *中国社会科学评价* 2025.3.

The introduction sets the book's governing contrast and is organized as four movements.

**客观性研究范式的确立.** Print-era humanities took objectivity as the standard of knowledge: facts separable from values, verification, intersubjective agreement. Li traces this to Enlightenment confidence that mind and world can coincide, then to telegraphy and news agencies that needed value-free copy, and finally to May Fourth empiricism in China. Barthes is cited on exteriority as criticism's "first commandment"; Chekhov on the writer as chemist. The cost of this regime is that taste, biography, and affective reading recede, while collation, linguistics, and genre history become the respectable core.

**透明性研究范式的兴起.** Digital media, sensors, and computational photography make a different standard available. Transparency means visible, knowable, and reproducible. It favors fine grain, large scale, and multiple dimensions over a single authorized description. Optical instruments and "computational photography" stand as analogies: one no longer sees only with the eye, but through calculation. Text-measurement tools act as telescope and microscope at once. Objectivity suited paper and linear transmission; transparency suits a culture of open, multi-perspective calibration. Disagreement may mark angle rather than error (the blind men and the elephant). Mathematics becomes a medium of commensuration across incommensurable humanist paradigms.

**知识生产与评价的透明化重塑.** The shift is from result-objectivity to process-objectivity. Version control and collaborative annotation make collation auditable; authorship splits among collectors, annotators, platform builders, and interpreters. Evaluation should credit datasets, code, and tools, not only monographs. Open access, preprints, modular micro-publications, and "publish then filter" peer review are treated as the communication system of this regime. Negative results and failed conjectures deserve their own archives. The risk side is named here already: early-digitized canons gain extra weight; what cannot be quantified is edged out; large publishers monopolize access ports; generative models retrain on their own output and lock in prior corpora.

**透明语境下的人文祛魅与知觉重构.** Visibility is not truth. Quantification can homogenize; platforms steer attention. Yet Li argues that humanist opacity (intuition, metaphor, "言不尽意") was also an artifact of weak instruments. Screen reading is neither classical contemplation nor modernist shock, but an operative immersion. Language loses its monopoly among scholarly media. Kittler marks the end of literature's special status once other arts can capture sense-experience directly. The close is programmatic: future humanists will also be algorithm engineers, aligning values with models. "Alignment" is both a technical procedure and a way of re-enchanting the world through invented meaning [PAGE 7–21].

---

## 第一章　传统文献学的现代转型 / Chapter 1: The Modern Transformation of Traditional Philology

**刘石 and 李飞跃**, Tsinghua School of Humanities.

Digital documents do not sit outside 文献学. They extend its old work of gathering, arranging, and mining texts, now at a different scale. Gregory Crane's "million books" problem is the emblem: the task is no longer to find a book, but to know what to do once a million are available. Philologist and data miner are described as doing related work with different tools.

**文献生产的创革.** Three technical operations remake the document. Segmentation, indexing, and word vectors break texts into reusable units. Controlled vocabularies and encoding (RDF, CDOI, and related identifier schemes) standardize knowledge. Retrieval, algorithms, and models then re-link those units. Named points of reference include Google Books Ngram, Shanghai Library open data, MARKUS, CBDB, and CHGIS.

**文本形态的新变.** The database is a "macro-text," not a pile of files. GIS and visualization (王兆鹏's Tang-Song literary chronology map; 罗凤珠 / CCTS; 徐永明) give texts a spatial interface. Cross-media fusion, with Hayles on rereading, changes what "a text" is.

**知识获取的拓展.** Networked knowledge (Moretti on *Hamlet*; social networks drawn from the *Zuozhuan*), stylometric and emotional quantification, and LDA topic modeling on classical corpora expand what can be asked of a corpus.

**传统文献学的现代转型.** Cataloging, versioning, and collation are upgraded rather than discarded. Holism and empiricism are the new virtues. Distant reading, culturomics (Michel et al., *Science* 2011), and prosopography sit beside 考据 as legitimate paradigms.

**余论.** Data is not truth; distant reading can flatten; classic interpretive frames are hard to overturn. Big data remains a tool and a human extension. Mayer-Schönberger is used for the telescope/microscope analogy. Fu Sinian is quoted: a field advances when it expands both its materials and its tools [PAGE 23–47].

Useful for this project: word vectors, knowledge graphs, and MARKUS/CBDB/CHGIS are treated as continuations of philology, not as a break from it.

---

## 第二章　大模型与人文研究 / Chapter 2: Large Models and Humanities Research

**孔存良 and 孙茂松**, Tsinghua Department of Computer Science and Technology.

A computer-science survey written for humanists. The opening already flags Chinese systems, DeepSeek in particular, as having reached international technical levels while retaining an advantage in Chinese semantic understanding. Large models are said to remake not only daily conversation but professional knowledge production.

**大模型的技术演进.** From rule-driven to data-driven to large-scale pretraining, then to the Transformer. Three stages are marked: architectural exploration (BERT, GPT); scale and in-context learning (GPT-3, few-shot and zero-shot, scaling laws); capability deepening (ChatGPT, RLHF, reasoning models, multimodal GPT-4o / o1). Multimodal large language models (CLIP, Flamingo, Qwen-VL) extend the same logic beyond text.

**大模型赋能的人文研究.** Four roles, each with cases. (1) **Tool**: generalization, generation, interactivity; Meta NLLB for translation, DeepMind Ithaca for epigraphic restoration, Tsinghua's LLM-agent social simulation S3. (2) **Object of study**: stylistic comparison of human writing and ChatGPT (BLCU), GPT-4 persuasion experiments, MULTITP moral alignment. (3) **Knowledge medium**: domain-adapted models such as BloombergGPT, ChatLaw, 荀子, and AI太炎 2.0. (4) **Cultural participant**: 九歌 as a poetry-generating system; museum AI docents.

**伦理风险与应对.** Privacy, bias, and accountability. Responses run through data governance, fairness and diversity, and responsibility frameworks. Humanities scholars are asked to join interdisciplinary ethics teaching and public debate, not only to consume tools.

**未来展望.** Technical empowerment should be paired with humanistic guidance of technical design. The tone is integrationist rather than celebratory: collaboration between CS and the humanities is required, and it should remain cautious [PAGE 48–69].

---

## 第三章　数字史学 / Chapter 3: Digital History

**梁晨**, Nanjing University School of History.

"Digital history" is not used here as a synonym for all historical DH. The chapter centers **quantitative historical databases** built from systematic primary sources: household registers, land records, examination lists, judicial archives.

**发展概况.** Modern Chinese historiography already wanted statistics. Fu Sinian's IHP program (new materials plus new tools; "clever 考证"), Liang Qichao's 1922 call to use statistical laws on historical records, and 卫聚贤's textbook *历史统计学* are the early Chinese lineage. They had little effect before civilian computing. After 1945 the story joins ICPSR, punch-card quantification, and the new economic history (Conrad and Meyer, Fogel). Barraclough is cited for a shift from narrative to structural analysis.

**量化数据库.** Microdata projects: IPUMS, BALSAC, HSN, SEDD, UPDB. Database citations rise while history graduate enrollments fall. Retrieval databases are distinguished from quantitative ones. The Chinese debate over e-考据 versus traditional 考据 (申斌, 成一农) is noted; ARTFL and the Republican periodicals corpus appear as neighboring DH work rather than the chapter's core.

**量化数据库建设与研究框架.** East Asian cases: CMGPD (李中清 / 康文林), CGED-Q. Suitable sources are those with authenticity, extractability, spatiotemporal attributes, and variable richness. Chinese institutional projects include work at Shanxi University, Sun Yat-sen University, Shanghai Jiao Tong, Zhejiang University's Longquan judicial archives, and Nanjing University's Jiangsu judicial archives. Pedagogy: Tsinghua's quantitative-history workshop. Research styles split into 求是-type and 解释-type. A worked example is a Republican-era Tsinghua study-abroad database (Python crawlers, hand checking, double-blind 双盲录 entry). Tools mentioned include STATA, SPSS, and R. 王业键's grain-price database is another named resource.

**结语.** Digital history should move from breadth to depth through linkage and tracking. Databases can test and revise theory (Piketty; 李伯重; 吴承明). Guldi and Armitage are quoted on data's power to transform theory. Fogel, as used here: quantitative methods cannot make history a science, but they can enlarge what history asks. Proposed cycle: collect, input, process, analyze, discover, interpret, publish [PAGE 70–92].

---

## 第四章　数字文献学 / Chapter 4: Digital Philology

**李林芳**, Peking University Department of Chinese Language and Literature.

Digital philology studies **digitally encoded classical texts**. It keeps 孙钦善's branch structure and runs two lineages through each branch: the digitization of paper books, and the deep use of born-digital corpora.

**发展概况.** Decades of 古籍数字化, plus 2022 national policy, have outpaced theory. Coverage across the traditional branches is uneven.

**数字文献学之概念.** The terms 电子文献学, 数字文献学, and 计算文献学 are sorted. A philology-centered approach is distinguished from a data-centered one. Digital philology is defined as a supplement to classical philology that takes a new document type as its object.

**数字文献学框架结构.**
- **目录学.** Full-text versus specialized digital catalogs; MARC and GB standards; structured catalogs (北大 "祕籍琳琅", 学苑汲古); machine learning for 互著 and 别裁 (张力元, 王军); "book cluster" analysis (Li Wenqi et al.).
- **版本学.** Version choice in digitization; AI version identification (韦胤宗 et al.); a new taxonomy of digital formats and producers; proposed criteria for a digital 善本: fidelity to the source, rarity of the underlying witness (especially if the paper copy is lost), and usability (access, reading, retrieval, reprocessing).
- **校勘学.** The four classical 校法 are extended to OCR and encoding error. Automated collation platforms include 籍合网 and Academia Sinica tools. An interactive "living / dead collation" via visualization is imagined.
- **辑佚学与辨伪学.** Database search and similarity matching for lost-text recovery (唐宸, 张萍; 杜以恒). Stylometry updates 胡应麟's eight tests. LLMs also create new forgery risks.

**结语.** STEM methods remain subordinate to philology. Digital texts are independent objects, not mere copies, and may eventually outlast their physical carriers. Whether the field will become independent of classical philology is left open. 拓展阅读 lists ctext, CBETA, 中华经典古籍库, 中国基本古籍库, 识典古籍, and related union catalogs [PAGE 93–114].

---

## 第五章　数字出土文献研究 / Chapter 5: Digital Research on Excavated Documents

**许可**, East China Normal University Department of Chinese Language and Literature.

Excavated-document study is a "cold door" field (冷门绝学) that has, since about 2019, begun to take digital methods seriously across its three traditional directions.

**发展概况.** Recent gains in oracle-bone joining, bronze dating, and bamboo-and-silk collation.

**出土文献的定义和三大研究方向.** Carrier studies (material, archaeological); language and script; content and historical interpretation.

**数字出土文献研究的探索.** Computational jiaguology: AI edge-matching for joins (莫伯峰, 张重生, 张展, 李霜洁 / RejoinX). Deep-learning bronze dating ("吉金识辨"; MGM / KEM models). Join and association databases: 缀玉联珠, 贯联汗青. Oracle OCR datasets; archaic-Chinese phonology (古音小镜); automated lexicon compilation; network graphs and heatmaps of 贞人 groups (李霜洁). Stellarium is used for astronomical passages. 数智增强整理 is illustrated with the Huayuanzhuang East oracle bones.

**数字出土文献研究的困难与展望.** Encoding, interoperability, and peer acceptance remain weak. DH is still mostly a **method import**, not yet a source of new questions. Roger Bagnall is used to warn that establishing facts requires long immersion: there are no shortcuts. The invitation is to welcome trial projects and digital training without abandoning philological competence. 拓展阅读 points to 复旦古文字, 简帛网, 引得市, IDP, and related glyph and phonology sites [PAGE 115–136].

---

## 第六章　数字概念史 / Chapter 6: Digital Conceptual History

**邱伟云**, Nanjing University School of History and Xueheng Institute.

Conceptual history plus computational linguistics, social-network analysis, and GIS. Once words are extracted, normalized, and placed in vectors or graphs, concepts can be watched as frequencies, co-occurrences, and migrations, at a scale close reading cannot hold alone.

**发展概况.** Introduces the four contributing fields and their DH centers (Helsinki, Sheffield, and others).

**数字概念史之概念.** Turning words into quantifiable data is defended as legitimate: extraction, normalization, vector models, and knowledge graphs. Jo Guldi (TF-IPF) and Peter de Bolla (DPF) appear as methodological cousins. Soo Hur on 帝国 is another named case.

**数字概念史框架结构.** Four intertwined layers.
- **词汇史.** Bilingual dictionaries (英华字典资料库), 汉语新词资料库, and tracked terms such as 妇女 and 经济.
- **语义史.** Affix-family computation for 边 / 疆; co-occurrence networks for 世界; eigenvector centrality in Song-Ming Neo-Confucian vocabularies.
- **思想史.** LDA on the *Analects*, *Mencius*, and *Xunzi*; staged newspaper analysis of 平等; GIS of 妇女 in periodicals.
- **社会史.** Chen Yunsong on sociology in Google Books; Anne Chao on 陈独秀 networks; a Cuba war corpus in which topic models link "she / her" with "scimitar" in American reportage.

Co-occurrence, in Qiu's phrasing, moves the field from word-level 考证 toward the interpretation of relations.

**结语.** The hoped-for product is a dynamic archive of conceptual social memory. Future lines include metaphor extraction, CNN-based image conceptual history, and cross-lingual vectors, all still checked by humanist reading. Tools named in 拓展阅读 include Palladio and the Chinese Iconography Thesaurus [PAGE 137–160].

---

## 第七章　古籍数字化与诗学范式革新 / Chapter 7: Digitization of Ancient Books and the Renewal of a Poetic Paradigm

**李飞跃.** First published in *北京大学学报* 2024.6. The chapter most closely aligned with this project's concerns.

Electronic texts are not only reproductions of woodblock and manuscript books. They turn linear books into hypertexts. Databases become a "macro-text" and, by segmentation and indexing, also a field of semantic fragments. Susan Hockey is quoted on bringing scientific procedure to problems humanists had handled accidentally. The promised gain is a research style that is repeatable, verifiable, reusable, and generalizable.

**基于数据库文本的经典秩序重塑.** Retrieval is algorithmic selection, not subjective sampling. Each search is an interaction with an algorithm (Hoyt Long and Richard Jean So). Stephen Owen is cited: if literary history is built around "important" writers, one must ask when, by whom, and by what standard they became important. 王兆鹏's quantitative rankings of Tang poetry and Song ci restate "classic" and "influence" as composite scores: afterlife in later writing (citation, adaptation, translation), critical and scholarly attention, and popular circulation. 陈尚君's objection (that ranking poems is a Western, modern task the ancients would have settled over tea) is answered with the claim that aggregating thousands of historical judgments is more representative than a few famous names. Jockers: the twenty-first-century scholar cannot live on anecdotal evidence from a canonized sliver of print, often less than one percent of what was published.

**诗学概念的量化与结构化重置.** Style, meter, and other fuzzy categories are treated as parameterizable structures (金岳霖), not essences. 罗忼烈's older count of Song ci in major anthologies, and 王兆鹏 and 刘尊明's quantitative ranking of Song ci writers, are reread as already proto-structural.

**从实体到关系与隐变量的涌现.** The object of study shifts from isolated works to graphs, similarity, and latent variables. Adding dimensions can make local certainties less certain. BERT-CCPoem (Sun Maosong's group; 512-dimensional line vectors on some 900,000 poems; cosine similarity) and 程宁 on the topic-networks of 沾衣之泪 and 凄怆之悲 are the technical examples. Owen's claim that a poem realizes a shared stock of materials, rather than a free-standing creation, is aligned with this vector view [PAGE 174].

**数字化技艺与诗学的合法性.** Computation is 技艺, a way of rebuilding the craft-threshold of the discipline. Hoyt Long et al.: this is an **enhanced humanities**, producing kinds of evidence even the closest reader may miss, not a replacement of interpretation by mathematics [PAGE 175]. 姜文涛 and 赵薇 are cited against treating keyword "emotion curves" as the poet's feeling without understanding the built-in model.

**数字诗学的互文性与非定域.** The most speculative section. Print culture draws strong local boundaries (Eric McLuhan). In a database, semantic links need not weaken with distance; they can be nonlocal, like entanglement. Meaning is shared across texts and later commentaries; measurement depends on the chosen combination of parameters. Correlation crowds out causation. Court poetry and Ming-Qing literary inquisition are used to show that "empty" diction may be encrypted speech our decoding habits cannot reach. Large models make this intertextual, nonlocal condition ordinary. 王士禛 and 骆鸿凯 on Tang verse rewriting Six Dynasties lines supply the classical warrant.

**余论.** Character-matching full-text search has not released digital literature's energy. Named-entity identifiers and structured semantic retrieval (刘炜 and 叶鹰 on "rebuilding the humanities") are needed, along with poetic analysis models and knowledge graphs. Data alignment and interpretability still lag; many AI systems remain prediction boxes. Information becomes knowledge only when it re-enters a human circuit. A text is a structure of appeal; the reader completes it. Protagoras: man is the measure. Closing sentence, verified in the OCR: "数字让诗学和人文更新，而人让数字和诗文有意义" [PAGE 181]. 拓展阅读 includes TopWORDS-Poetry (Pan, Li, Deng, EMNLP 2023), 搜韵, and 九歌.

---

## 第八章　自然语言处理 / Chapter 8: Natural Language Processing

**张辰麟** (Kunming University Faculty of Humanities / MOE Institute of Applied Linguistics) and **左家莉** (Jiangxi Normal University, School of Artificial Intelligence).

A historical toolkit chapter. The aim is to keep DH from treating NLP as a set of interchangeable black boxes.

**发展概况.** NLP is mapped from resource-building through application systems, and from Turing (1950) through the AI winters to BERT and ChatGPT.

**自然语言处理视角下的数字人文.** Busa (via Schreibman et al.) supplies the shared definition: automated analysis of the possibilities of human expression. The "natural fit" is methodological, not merely topical.

**方法与应用.** Four historical layers, each with DH examples.
- **Rules.** Segmentation ambiguities (南京市长江大桥; 还欠款一百元); POS; negation scope; sentiment lexicons (张辰麟 on true and false Monkey Kings in *Honglou meng*); NER on classical texts; constituent syntax trees.
- **Statistics.** Zipf, Markov assumptions, bag-of-words, TF-IDF, entropy. 邱伟云 on 深圳 in *人民日报* is a co-occurrence example.
- **Shallow learning.** Word2Vec, KNN, SVM, decision trees, K-means, spectral clustering. Schich et al. (*Science*) on cultural networks.
- **Deep learning.** BERT-era models, treated as the current ceiling rather than the only legitimate method.

**自然语言处理方法与数字人文的未来.** Even after ChatGPT, domain DH still needs interpretable rule and statistical tools. NLP is an "armory": algorithms as blades, models as armor, prior studies as drill. The best method is the one fitted to the question, not the newest [PAGE 182–223].

---

## 第九章　语言模型 / Chapter 9: Language Models

**胡韧奋**, Beijing Normal University, Department of Digital Humanities in the College of International Chinese Education.

Language models move analysis from string matching to distributional semantics. The chapter is written as a use-guide rather than a manifesto.

**发展概况.** Cloze examples define the object. The history runs from statistical n-grams through neural next-word prediction to Word2vec, BERT, GPT, and ChatGPT.

**语言模型视角下的数字人文.** Corpus methods are contrasted with pretrained models. Design remains researcher-led. Harris's distributional hypothesis is the theoretical hinge.

**方法与应用.**
- **Word2vec.** CBOW and Skip-gram; Chinese-Word-Vectors; diachronic semantics (Hamilton et al.); occupational gender bias (Garg et al.). Gensim as the usual implementation.
- **BERT.** MLM and NSP; pretrain-then-finetune; DeepMind Ithaca for damaged inscriptions; BNU work on automatic punctuation of 古籍. Hugging Face as the distribution channel.
- **Large language models.** GPT versus BERT; RLHF; capabilities and failure modes; model selection; prompt engineering; structured dictionary parsing (Qiu Ziliang et al. on knowledge-base construction). Ziems et al. on LLMs in social science.

**未来展望.** Multimodal LLMs, multi-agent systems, and digital humans for heritage. The refrain: models are not an out-of-the-box magic solution. Efficiency depends on human decisions about when, which model, and how. LLMs can join teams as annotators; they should not be treated as autonomous scholars [PAGE 224–246].

Directly useful beside Chapter 7: this is the handbook's cleanest account of vectors, pretraining, and what a humanist should and should not outsource to a model.

---

## 第十章　主题模型 / Chapter 10: Topic Models

**苏祺**, Peking University School of Foreign Languages and Institute for Artificial Intelligence.

Unsupervised discovery of latent themes as a form of distant reading. Literary and historical texts, the chapter insists, cannot be reduced to model output.

**发展概况.** From matrix factorization and LDA to neural and BERT-based models (BERTopic). Interpretability is traded against expressiveness as models grow richer.

**数字人文中的主题模型.** A tour of applications. Literary studies: Jockers and Mimno on nineteenth-century novels; Navarro-Colorado on Spanish sonnets (in poetry, LDA often surfaces motifs and rhyme patterns rather than neat thematic labels; `VERIFY` some OCR-garbled Spanish examples). History: Martha Ballard's diary; *New York Times* editorials; 何琳 on the *Zuozhuan*. Philosophy and religion: Allen and Murdock; *Bhagavad Gita* / *Upanishads*; moral-dilemma posts on Reddit. Cultural heritage: South Slavic Wikipedia; Sheffield "value maps." Rachel Sagner Buurma on the "fictionality of topic modeling" is a useful caution.

**方法与应用.** Workflow: preprocessing, bag-of-words / TF-IDF / embeddings. Models: LSA, pLSA, LDA, LDA2vec, BERTopic, plus dynamic, sparse, hierarchical, and structural topic models (STM). Evaluation: perplexity, coherence, and human review. Distance measures such as Jensen-Shannon divergence are used for cultural comparison. Tools: MALLET, Gensim, pyLDAvis, TopicNets, Top2Vec.

**结语.** Topic models remain a core semantic engine if they stay paired with close reading. Hybrid and metadata-rich models (STM, BERTopic) address earlier limits, but topic-number choice and preprocessing still steer results [PAGE 247–282].

---

## 第十一章　网络分析与计算批评 / Chapter 11: Network Analysis and Computational Criticism

**赵薇**, CASS Institute of Literature.

Network analysis is both a structural worldview and a method of computational criticism. Relations, not isolated attributes, explain social and textual phenomena. "Structure determines function" is stated as the structuralist premise.

**网络分析发展史概述.** Two origin stories: graph theory and topology (physicists, mathematicians); social psychology, sociology, and anthropology. John Scott's three twentieth-century origins; Moreno; the Manchester anthropologists. Watts and Barabási bring physics-style networks. In Chinese history, CBDB is the major infrastructure. Networks need not be interpersonal: texts, places, and objects can be nodes.

**作为方法共同体的网络分析.** Kieran Healy (and Han) on Paul Revere: importance can be read from organizational metadata alone, without any knowledge of beliefs or writings. Basic objects: nodes, edges, matrices, edgelists. Metrics: degree, betweenness, closeness, eigenvector centrality, modularity, core-periphery. The contrast is with attribute-based statistics. Gephi and UCINET are the working tools. An appendix walks through constructing the "Boston-area intelligence network."

**作为推理和论证手段的网络分析.** Character networks: Moretti on Horatio in *Hamlet*; *世说新语*; *唐语林*; *大波*. Historical networks: 陈松 on Song stele authors; Rudolph on women activists' biographies; Schich et al. on cultural migration; 应申 et al. on Tang-Song writer mobility. The movement described is "from metaphor to model to criticism."

**未来展望.** Inspectable, rule-based modeling is preferred to opaque AI-generated graphs. Computational criticism works when metrics are tied to interpretable features and a historical argument. Zhao's warning against untested "emotion curves" (quoted in Chapter 7) belongs here: automation without verification suspends understanding [PAGE 283–314].

---

## 第十二章　文学时空分析 / Chapter 12: Spatiotemporal Analysis of Literature

**唐宸**, Tsinghua School of Humanities.

Chinese classical literary study has entered a spatiotemporal turn. Dynasty-based periodization ("三古、七段") cannot hold the material. The chapter's claim is that structured 编年系地 data, GIS platforms, and mixed methods can yield verifiable, repeatable findings.

**发展概况.** Traditional literary-historical periodization and its limits. Historical geography (CHGIS, CCTS) and literary geography (梅新林, 曾大兴) supply the older frames. Early GIS proposals come from 郑永晓 and 王兆鹏. Moretti's distinction between "space in literature" and "literature in space" is the imported theoretical pair.

**数字人文与中国古典文学研究的量化转变.** Infrastructure now makes spatiotemporal data operational: 搜韵's Tang-Song literary chronology map; Zhejiang University's academic map platform; 罗凤珠; 简锦松's 天下通衢; 刘京臣's Yuan literature platform. 白居易 is used as an example of a structured life-table.

**方法与应用.** Text mining and knowledge graphs (刘京臣; 邱伟云 and 严程; 何捷). Big-data literary history (王兆鹏 rankings; Song / Yuan / Ming distributions). On-site 现地研究 (简锦松). Social and textual networks (CBDB; 严程 on 秋红吟社; 李飞跃 on intertextuality). 文学天文: 唐宸's 璇玑 platform runs repeatable astronomical simulations for 柳如是, 李白, and 黄景仁, aiming at "ten-tenths insight" rather than associative commentary. LLMs appear as extraction tools (吾与点; DeepSeek-R1), with a warning about hallucination. GPS, JSON APIs, and WebGIS are the technical substrate.

**余论.** Priorities: data interoperability, method fusion, and caution about LLM error. Fuller digitization and shared APIs are needed before the turn can be more than a set of experiments [PAGE 315–334].

---

## 第十三章　数字基础设施与人文实践 / Chapter 13: Digital Infrastructure and Humanistic Practice

**姜文涛**, Zhejiang University International Campus.

The most theoretically Western-facing chapter. DH is not a toolkit. It is a material reconfiguration of humanistic knowledge, and it has to be read through the history of **print infrastructure**.

Opening frame: Moretti's distant reading (2000) as the usual turning point, because no one has read or could read all nineteenth-century novels (`VERIFY` the exact wording of the Williams / Underwood citation in the OCR). The genealogy is then widened: Busa, humanities computing, Unsworth, Kirschenbaum. Supporters stress openness, teamwork, data management, and visualization; the field's breadth makes simple definition difficult.

**印刷文化基础设施、文学研究近代知识史与数字转型.** Memory and knowledge from Plato through Ong to Chad Wellmon. Reading and literary capital: Hayles, Guillory. "Big humanities" and McGann's Rossetti archive. Siskin and Warner's Re:Enlightenment and "mediating Enlightenment." The modern English department is itself a print-era infrastructure.

**数字化时代之前的数字人文与20世纪文学批评史.** Vernon Lee's statistical stylistics. I. A. Richards, Basic English, and the birth of close reading. Moretti's distant reading and its critics: Katie Trumpener; Katherine Bode on infrastructural and textual scholarship. Distant reading is not the whole story of DH.

**推进思辨性数字人文基础设施研究及其与印刷文化的关系.** Alan Liu's speculative infrastructure studies; Wellmon on data-as-knowledge; Liu and Drucker on humanities layers; Critical Infrastructure Studies (cistudies.org). Andrew Piper: digitization is conversion, not reproduction. EEBO and Aozora bunko are ideological archives still in flux (Bode), not stable raw data. Bonnie Mak and Hoyt Long appear in this critical lineage.

**结语.** DH change has to be read through long media history. Infrastructure critique is what keeps "enhanced humanities" from becoming mathematics in place of interpretation. Scholars should be able to criticize databases and platforms rather than treat their contents as given [PAGE 335–371].

---

## 第十四章　新型语料库建设 / Chapter 14: Building New Corpora

**饶高琦**, Beijing Language and Culture University, Institute of International Chinese Education.

Corpora are the empirical infrastructure of DH, and DH in turn gives corpus-building new targets. Most humanities data is carried by natural language, so the corpus is the field's data layer.

**发展概况.** A corpus is scientifically sampled, processed language that actually occurred in use. Card files for dictionary-making already count. Three generations: 1960s–70s, 1980s–90s, twenty-first century. Types: text / multimodal, general / domain, static / dynamic, written / spoken, synchronic / diachronic, monolingual / bilingual. The stance is empiricist: knowledge comes from observed language, not introspection.

**语料库的构建与服务.** Pipeline: collect, digitize (OCR, transcription), clean, store; annotate (segmentation, POS, syntax, semantics, NER, sentiment; manual, semi-automatic, automatic); query, analyze, visualize, maintain. Ethics: copyright, privacy, security, bias, and "data poisoning." Humor, HSK, and CBDB annotation are used as examples.

**语料库语言学.** The data-driven lineage from Zipf and the Brown Corpus. Methods: frequency and Zipf's law, collocation, corpus-driven grammar, sentiment analysis. Su Qi et al. on occupational gender in Chinese is a named study. NLTK and BCC appear as working tools.

**常见的语料库（系统）.** Brown, COCA, COHA, BCC, CCL, UN parallel corpus, CECPC, Tmxmall, HSK / QQK learner corpora, 中国裁判文书网.

**结语.** Even LLMs are data-driven; underneath them is still a corpus system. Legal compliance and bias mitigation remain unresolved [PAGE 372–397].

---

## 第十五章　数据基础与人文数据结构化 / Chapter 15: Data Foundations and the Structuring of Humanities Data

**李斌**, Nanjing Normal University School of Literature.

Scanning is not structuring. DH advances when humanistic knowledge becomes **concept nodes and explicit relations**. That definitional work is the hardest part and belongs to humanists. Computer science contributes structured thinking, mass processing, and complex models; the concepts themselves cannot be outsourced.

**发展概况.** Knowledge structuring is the foundation of the DH crossover, not "machine-collected data" such as page images or 3D scans.

**数据类型和数据结构.** Machine types: numeric, character, image, audio, video, 3D, vector / tensor. Logical structures: linear (timeline), tree (syntax), graph (social or citation network). Each is illustrated with a humanities case.

**人文数据.** Tables fail for fluid life-data such as CBDB; ontology-building is costly. The long kinship case works through five schemes: naive graphs, academic kin diagrams, patrilineal and matrilineal trees, the paradox of an ancestor binary tree, and finally predicate logic (Father / Mother / Husband / Male) that can support inference: 爷爷(X,Y) := Father(X,Z) and Father(Z,Y). WordNet and SUMO are the imported ontology references; Li Bin et al. on kinship normalization (*DSH* 2024) is the author's own technical work. CBDB applications for persons, places, dates, and offices show what structured data can do; LLMs without such knowledge remain limited.

**结语.** This is introductory methodology. High-quality structured knowledge bases should be funded alongside large models. The depth of structuring, in Li's phrase, is the thickness of humanistic knowledge [PAGE 398–419].

---

## 第十六章　数字媒介与知识范式转型 / Chapter 16: Digital Media and the Transformation of Knowledge Paradigms

**桑海**, editorial office of the *Journal of Macao Polytechnic University*.

DH is a media event, not a new tool or a new method. The opening corrects the common reduction of DH to "computers applied to the humanities." Woodblock print (Tang to Northern Song; from 写本 to 刻本) and Gutenberg are the precedents. Eisenstein on print and the Reformation; Manovich's contrast is the hinge: print changed distribution, while computing changed acquisition, manipulation, storage, and distribution across all media types. Dominique Cardon is used for the claim that the digital revolution changed how we think, question knowledge, and store or circulate information.

**数字媒介的特征.** Digitization and computability (Turing; Piper; Manovich; Galloway). Decentralization: hyperlinks, open source, Wikipedia, blockchain. Interactivity: McLuhan versus Manovich; Web 2.0.

**新兴媒介概念.** Algorithmic media (Cardon's four types; PageRank; SCI). AI media and agents. Posthuman media (Wiener, Latour, Hayles, Harari, Musk). Platform media. Infrastructure media (Alan Liu; Heidegger's Ge-stell). Mediality (Hayles on analog / digital interplay). Tsinghua work on classical poetic prosody is a passing Chinese case.

**数字媒介时代的知识范式转型.** Acquisition moves from search to generative AI. Storage becomes linked databases. Dissemination becomes interactive and multi-directional. Production includes machines as co-producers, with new problems of IP and filter bubbles.

**媒介变革与数字出版.** Bhaskar's "content machine." China's 知网 model is an incomplete transition. An ideal platform would support intertextuality, altmetrics, open access, and preprints (arXiv; PSSXiv, 2024).

**结语.** DH is a cross-disciplinary cultural practice. Humanists should practice "mediation" across data, code, and algorithms, neither naive embrace nor refusal. Some Piper / Manovich passages are gapped in the OCR (`VERIFY` if quoting) [PAGE 420–442].

---

## 第十七章　海外数字人文研究 / Chapter 17: Overseas Digital Humanities Research

**肖爽**, Tsinghua School of Humanities.

A closing survey of international DH, organized as four "news" that echo themes already treated inside China: ideas, fields, methods, infrastructure. The overseas arc is from mid-century humanities computing (computer-assisted text analysis, electronic textbases) to critical and public DH in the internet and big-data period.

**新理念.** Practice versus theory: THATCamp's "more hack, less yack," set against Stanley Fish, Stephen Ramsay, Johanna Drucker, and Claire Warwick, who warn that hacking must not erase theory. Critical DH: ideology, power, ethics (#TransformDH). Public DH: crowdsourcing and open science (British Library maps); the OCR is messy in this subsection (`VERIFY` section breaks). Global DH: center-periphery, English dominance, GO::DH. Minimal computing (Roopika Risam and Alex Gil): what do we need, have, prioritize, and give up?

**新领域.** Literary stylometry (Stanford Literary Lab, ARTFL). Digital philology (Busa / *Index Thomisticus*, Perseus, Digital Latin, MARKUS). Digital history (Valley of the Shadow, Digital Panopticon, Mapping the Republic of Letters, CBDB). Digital archaeology (Silchester, 3D-PITOTI). Digital art history (Kinolab, Manovich, distant listening). Also digital philosophy, games and narrative, and multilingual DH.

**新方法.** Knowledge graphs (Neo4j, Gephi); cultural analytics; distant reading (Moretti); GIS (Orbis); VR / AR (Hidden Florence 3D); deep learning (Ithaca, *Nature* 2022; lost-language decipherment); sentiment analysis; critical code studies.

**新设施.** Standards: TEI, IIIF, Dublin Core, LOD, PROV-O. Consortia: DARIAH-EU, CLARIN, Europeana. Publishing: MLA evolving anthology, *Journal of Digital History*, OA. Community: ADHO and its SIGs, the Humanist listserv, DH labs. Compute and corpora: Google Colab, Kaggle, HathiTrust Research Center.

**结语.** International DH now requires reflection, collaboration, and a global sense of responsibility. Tool-worship is not enough [PAGE 443–476].

---

## What to reread for *Vector Poetics*

- **绪论 and 第七章** (李飞跃): objectivity / transparency; databases as macro-text; latent variables; BERT-CCPoem; intertextuality as nonlocality.
- **第九章** (胡韧奋): the handbook's cleanest account of vectors, BERT, and LLM limits.
- **第十一章** (赵薇): networks as computational criticism, with a brake on uninterpreted metrics.
- **第十三章** (姜文涛): infrastructure and print-culture critique of "raw" corpora.
- **第十六章** (桑海): media-theoretical frame (Manovich, Hayles, Liu) for why DH is not only a method.
