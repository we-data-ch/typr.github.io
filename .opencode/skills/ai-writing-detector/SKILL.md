---
name: ai-writing-detector
description: >
  Detect and transform AI-generated writing patterns in any text document.
  Scans markdown, plain text, or formatted documents for identifiable LLM
  signatures — from overused vocabulary and promotional puffery to structural
  tells like Markdown quirks, broken citations, and formulaic conclusions.
  Produces a detailed audit report and a rewritten, humanized version
  with inline annotations. Use when the user wants to "de-AI" an essay,
  article, draft, report, or any text that feels artificially generated.
---

# AI Writing Detector & Humanizer

> **Version:** 1.0
> **Source material:** Wikipedia:Signs of AI writing (accessed August 2026)
> **Scope:** General text (essays, articles, reports, comments, drafts) with Wikipedia-specific signs noted where applicable.

## Overview

This skill operationalizes the complete field guide from Wikipedia's
**"Signs of AI writing"** article. It treats AI detection not as a single
score but as a structured audit of ~40 distinct pattern categories. For each
category the agent:

1. **Flags** occurrences with severity (critical / strong / moderate / mild).
2. **Explains** why the pattern is a tell.
3. **Rewrites** the passage with a concrete, humanized alternative.

The output is two artefacts:
- `AI_Audit_Report.md` — the full diagnostic.
- `Humanized_Text.md` — the cleaned version with before/after tracked changes.

## Detecting — Pattern Encyclopedia

Scan the input text against every category below. For each hit, record the
exact quoted snippet, severity, and a suggested fix.

### Search Cheat-Sheet (for large documents)

When auditing a long document, use `bash` + `grep` / `rg` to pre-scan for
high-signal keywords before the close-reading pass.

```bash
# High-signal AI vocabulary (case-insensitive, whole word where possible)
rg -in '\b(additionally|boasts?|bolstered|crucial|delve|emphasiz|enduring|fostering|garner|highlight|intricate|interplay|landscape|meticulous|pivotal|showcasing|tapestry|testament|underscore|vibrant|align with|enhance|valuable insights|deep dive|robust)\b' file.md

# Promotional / puffery markers
rg -in '\b(nestled in the heart of|natural beauty|groundbreaking|renowned|diverse array|commitment to|exemplifies|showcasing|enhancing)\b' file.md

# Copula avoidance
rg -in '\b(serves as|stands as|functions as|operates as|boasts a|features a|maintains an|offers a)\b' file.md

# Superficial -ing clauses
rg -in '(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|cultivating|fostering|encompassing|enhancing),?' file.md

# Knowledge-cutoff / disclaimer language
rg -in '\b(as of my last (knowledge|training)|up to my last|specific details are (limited|scarce)|not widely (available|documented|disclosed)|based on available information)\b' file.md

# Markdown-in-Wikipedia / formatting bugs
rg -in '(```wikitext|contentReference|oaicite|oai_citation|turn0search|grok_card|start_span|attached_file|ppl-ai-file-upload|:::writing\{)' file.md

# Broken citation suspects (placeholder dates, AI UTM tags)
rg -in '(20[0-9][0-9]-(XX|xx)-(XX|xx)|utm_source=(openai|chatgpt\.com|copilot\.com)|referrer=grok\.com)' file.md
```

### A. Semantic / Content Patterns

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 1 | **Undue emphasis on significance, legacy, broader trends** | Phrases like *stands/serves as, is a testament/reminder, crucial/pivotal/vital/significant/key role, underscores/highlights its importance, reflects broader, symbolizing its ongoing/enduring/lasting, contributing to the, setting the stage for, marking/shaping the, represents/marks a shift, key turning point, evolving landscape, focal point, indelible mark, deeply rooted*. AI "puffs up" mundane topics by connecting them to grand narratives. | Strong |
| 2 | **Canned emphasis on notability / attribution / media coverage** | *independent coverage, local/regional/national/[country] media outlets, music/business/tech outlets, trade publications, profiled in, written by a leading expert, active social media presence*. Also: listing sources to "prove" notability in Wikipedia-tone. | Strong |
| 3 | **Superficial analyses** | Present-participle (-ing) phrases tacked onto sentence ends: *highlighting/underscoring/emphasizing..., ensuring..., reflecting/symbolizing..., contributing to..., cultivating/fostering..., encompassing..., enhancing..., valuable insights, align/resonate with*. Often vague attributions to critics or reviewers that don't match cited sources. | Moderate |
| 4 | **Promotional / advertisement-like language** | *boasts a, vibrant, rich, profound, enhancing, showcasing, exemplifies, commitment to, natural beauty, nestled, in the heart of, groundbreaking, renowned, featuring, diverse array*. Reads like a travel guide or press release rather than neutral prose. | Strong |
| 5 | **Vague attributions & overgeneralization** | *Industry reports, Observers have cited, Experts argue, Some critics argue, several sources/publications* (when only few cited), *such as* before exhaustive lists. Presenting one source as widely held consensus. | Moderate |
| 6 | **Outline-like conclusions: challenges & future prospects** | Rigid formula: *Despite its [positive words], [subject] faces several challenges...* ending with a vaguely positive assessment or speculation. Often paired with a separate "Future Prospects" or "Future Outlook" section. The structure is mechanical: challenge → optimism. Note: formula is the tell, not merely mentioning challenges. | Strong |
| 7 | **Leads treating lists/broad titles as proper nouns** | First sentence introduces a non-proper-noun title as if it were a standalone entity: e.g. *"Catchment area (health) refers to..."* or *"The 'List of songs about Mexico' is a curated compilation..."* instead of a natural definition. AI treats the article title itself as the subject rather than the concept it denotes. | Moderate |
| 8 | **"Awards and recognition" section** | Nearly ubiquitous AI header *Awards and recognition* (or simply *Recognition*) especially in biographies. Human editors may write "Awards" or "Accolades" but the exact pairing "Awards and recognition" is disproportionately common in AI output. | Moderate |
| 9 | **Abrupt topic-shift or non-sequitur** | Sentences that flow grammatically but introduce information with no logical connection to the previous thought. | Moderate |
| 9a | **Etymology or basic data given undue weight** | LLMs will add significance-padding even to the most mundane facts (etymology, population data, basic specifications), often with hedging preambles: *"While relatively minor, the etymology nonetheless reflects broader..."* The hedging preamble + significance claim is the tell. | Moderate |
| 9b | **Biology over-generalizations** | When writing about species, AI over-emphasizes tenuous ecosystem connections and belabors conservation status/research efforts even when unknown or non-existent. | Moderate |
| 9c | **Social media presence mention** | For people or entities using social media, AI often notes they *"maintain an active social media presence"* or similar — idiosyncratic phrasing relatively uncommon in human-written encyclopedic text before ~2024. | Moderate |

### B. Vocabulary Tells ("AI Vocabulary")

High co-occurrence of these words is one of the strongest tells. They often
cluster: where there is one, others usually follow.

| Era | Red-flag words |
|-----|----------------|
| **2023 – mid-2024** (GPT-4) | *Additionally, boasts, bolstered, crucial, delve, emphasizing, enduring, garner, intricate/intricacies, interplay, key (adj.), landscape, meticulous/meticulously, pivotal, underscore, tapestry, testament, valuable, vibrant* |
| **Mid-2024 – mid-2025** (GPT-4o) | *align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant* |
| **Mid-2025 onwards** (GPT-5) | *emphasizing, enhance, highlighting, showcasing* + notability-attribution vocabulary (see #2) |
| **Grok-specific** | *causal, empirical, correlate* (oversued as "scientific" filler), continued heavy use of *underscore* |

> **Rule of thumb:** One or two words = coincidence. A paragraph dense with multiple items from the list = very likely AI.
> **Cluster signal:** Juzek et al. (2025) and Kobak et al. (2025) independently found that LLM overuse words co-occur non-randomly — a paragraph with *delve* is significantly more likely to also contain *intricate*, *tapestry*, or *underscore*.

### B.5 Model-Specific Idiolects (Non-Cited but Observable)

Research (Sun et al., Rudnicka 2025) confirms each LLM family has a
characteristic "voice." Use these for finer attribution when the user
wants to know *which* AI likely generated the text.

| Model | Distinguishing traits |
|-------|----------------------|
| **ChatGPT (GPT-4/4o/5)** | Most prone to legacy/significance puffery (#1); verbose; favors *additionally* at sentence starts; uses American English by default; heavy boldface in lists; produces the longest outputs. |
| **Grok** | Particularly idiosyncratic scientific vocabulary (*causal, empirical, correlate*); extremely long outputs (cf. Grokipedia); overuses *underscore* even in 2026; tends toward reversed negative parallelisms. |
| **Gemini** | More concise than ChatGPT/Grok; less promotional tone; typically does **not** use curly quotes; rarely adds em dashes compared to ChatGPT/Claude. |
| **Claude** | More restrained tone; uses em dashes more than professional writers (per 2026 studies); system prompt enforces strict Markdown rules (single space after `#`, blank lines around blocks). |
| **DeepSeek** | May leak lenticular bracket citations: `【85†L261-269】`. |
| **Perplexity** | May append `[attached_file:N]`, `[web:N]`, or `ppl-ai-file-upload` S3 URLs. |

### C. Syntactic Patterns

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 10 | **Avoidance of basic copulatives (is/are)** | Replacing *is/are/has* with *serves as a, stands as, marks, functions as, operates as, represents [a], boasts/features/maintains/offers [a], refers to*. E.g., *"Gallery 825 serves as LAAA's exhibition space"* instead of *"is"*. | Moderate |
| 11 | **Negative parallelisms** | *Not only X but Y, not just X but also Y, it's not... it's..., no... no... just...* Contrast constructions that sound like they're clearing up a misconception no one asked about. | Moderate |
| 12 | **Rule of three** | Triple adjective or triple short-phrase lists: *"adjective, adjective, adjective"* or *"phrase, phrase, and phrase"*. Used to make superficial analysis look comprehensive. | Mild |
| 13 | **Lexical diversity / elegant variation** | Excessive synonym swapping driven by repetition-avoidance algorithms. E.g., "constraints" becomes "climate of constraints" then "confines" then "limitations" — all within a few sentences. Feels ornate and oddly formal. | Moderate |
| 14 | **Lower-than-human rate of simple constructions** | Missing everyday connectors: *there is a, it has a, one of the best, is the only, was the first, very, perhaps, tends to, as a result of, in order to, all of the, a part of, the fact that*. AI text under-uses these. Research (Geng & Trotta 2024) documents >10% decrease in *is/are* usage in 2023 academic writing. | Moderate |

### C.5 Older-AI Patterns (Still Useful for Pre-2025 Text)

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 14a | **Didactic disclaimers** | *It's important/critical/crucial to note/remember/consider, worth noting, may vary* — especially on safety, controversial, or jurisdiction-varying topics. Common in 2023-era GPT-4 output. | Moderate |
| 14b | **Forced conclusion paragraphs** | Sections titled *Conclusion* or *In summary/In conclusion/Overall* ending a paragraph by restating its core idea. Older LLMs treated this as obligatory. | Mild |
| 14c | **"As an AI language model"** | Self-identification or partial refusal: *As an AI language model, I cannot..., I'm sorry, but I can't...* | Critical |
| 14d | **Outdated access-date parameters** | Citations with `|access-date=` that looks unexpectedly old relative to when the document was produced (e.g., Dec 2025 article with multiple `access-date=12 December 2024`). | Mild |

### D. Formatting & Markup Tells

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 15 | **Title case in section headings** | All main words capitalized: *Impact of Technology and Digitalization* (humans more often use sentence case). | Mild |
| 16 | **Excessive boldface** | Mechanical bolding of every instance of a key term in a "key takeaways" style, inherited from readmes and listicles. | Moderate |
| 17 | **Inline-header vertical lists** | Bullets with bold inline headers followed by a colon: `* **Topic**: description...`. Also: bullet characters (•), hyphens (-), en dashes (–), hashes (#), or emoji used as list markers instead of standard wikitext/list syntax. | Strong |
| 18 | **Overuse of em dashes** | Frequent `—` where commas, parentheses, or colons would do, often formulaic and surrounded by spaces. | Mild |
| 19 | **Emoji in headings or bullets** | Emoji decorating section headers or list items (especially older AI output). | Moderate |
| 20 | **Curly quotes/apostrophes** | Typographic `“”` `‘’` instead of straight `""` `''`; curly apostrophe `’` instead of straight `'`. Note: this alone is weak (Word, macOS auto-convert) but strong when combined with other tells. | Mild |
| 21 | **Skipping heading levels** | Starting sections at level 3 (`###`) while skipping level 2 (`##`). | Moderate |
| 22 | **Thematic breaks before headings** | Horizontal rules (`---` or `----`) placed directly before every heading (common in Markdown output). | Moderate |
| 23 | **Use of Markdown in Wikipedia context** | Asterisks/underscores for bold/italic, hash symbols for headings, parentheses around URLs instead of brackets, triple backticks for code blocks. | Strong |
| 24 | **Unusual / unnecessary small tables** | Tiny tables that should be prose or an infobox; tables as a substitute for structured argument. | Mild |

### E. Citation & Reference Tells

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 25 | **Hallucinated / broken citations** | URLs that 404 and aren't in Wayback; DOIs that resolve to unrelated articles; ISBNs with invalid checksums; book citations without page numbers. | Critical |
| 26 | **UTM parameters from known AI tools** | `utm_source=openai`, `utm_source=chatgpt.com`, `utm_source=copilot.com`, `referrer=grok.com` in URLs. Near-definitive proof of AI tool involvement (though user may have added content manually). | Critical |
| 27 | **Placeholder dates** | `2025-xx-xx` or `20XX-XX-XX` in access-date or date fields. | Strong |
| 28 | **Named refs declared but unused** (or used but undefined) | `<references>` tags containing sources never cited inline, or broken named-reference re-use syntax. | Moderate |
| 29 | **Non-existent templates or categories** | Red links to plausible-sounding but hallucinated infoboxes or category pages. | Strong |
| 30 | **Internal formatting markup bugs** | `contentReference[oaicite:0]{index=0}`, `turn0search0`, `oai_citation`, `[cite: 1]`, `[span_1](start_span)`, `grok_card`, `【85†L261-269】` (DeepSeek), `[attached_file:1]`, `ppl-ai-file-upload`, `:::writing{variant="document" id="12345"}` — leaked internal AI syntax. | Critical |

### F. Meta-Text / Self-Reference Tells

| # | Category | What to look for | Severity |
|---|----------|------------------|----------|
| 31 | **Knowledge-cutoff disclaimers** | *As of [date], up to my last training update, as of my last knowledge update, while specific details are limited/scarce, not widely available/documented/disclosed, ...in the provided/available sources/search results, based on available information*. Often paired with speculation. | Strong |
| 32 | **Collaborative communication residue** | *I hope this helps, Of course!, Certainly!, You're absolutely right!, Would you like..., is there anything else, let me know, more detailed breakdown, here is a...* pasted into article text. | Strong |
| 33 | **Canned policy-compliance assurances** | *to ensure the article/content/draft/page adheres to/aligns with/complies with/follows/meets Wikipedia's [policy]* — especially in edit summaries or comments. | Strong |
| 34 | **"Preserved / retained" mentions** | Edit summaries talking about what was *preserved* or *retained* while editing — language typical of AI instructed to change X but keep Y. | Moderate |
| 35 | **Overemphasis on sourcing in edit summaries** | *added sourced [information/content/infobox/section], added [coverage/citations/references], improved attribution* — focusing on the fact of sourcing rather than the content added. | Moderate |
| 36 | **Didactic disclaimers (older models)** | *It's important/critical/crucial to note/remember/consider, worth noting, may vary*. | Moderate |
| 37 | **Formulaic conclusions** | Paragraphs or sections beginning *In summary, In conclusion, Overall* — especially in older LLM output. | Mild |
| 38 | **Self-identification** | *As an AI language model, as a large language model, I cannot offer medical advice, but I can...* | Critical |

## Rewriting — Humanization Rules

For each flagged pattern, apply the corresponding fix. When in doubt, prefer:

### Core Principles
1. **Specificity over generality.** Replace *"a pivotal moment in the evolution of regional statistics"* with the actual event or its concrete effects. AI *regresses to the mean* — it replaces rare, specific facts with statistically common, generic praise. Reverse this: put the sharp photograph back in place of the blurry sketch.
2. **Neutral verbs over marketing verbs.** Use *is/has/was* instead of *serves as/boasts/features*. Use *wrote* instead of *authored*; *died* instead of *passed away*; *used* instead of *utilized*; *moved* instead of *relocated*; *tried* instead of *attempted*.
3. **Simple copulatives.** Restore basic *is/are/has* constructions. They are invisible to readers and human. A 10%+ decrease in *is/are* usage is documented in post-2023 academic text — push back against this trend.
4. **One idea per sentence.** Break em-dash-heavy sentences into two. Remove unnecessary participial clauses.
5. **Cut puffery.** Delete sentences whose only function is to announce that the topic is important. If a sentence can be summarized as "X is significant/important/notable," it's probably AI-generated filler.
6. **Add hedging & qualifiers.** Natural human writing includes *very, perhaps, tends to, one of the best* — sprinkle them back in where appropriate. AI-trained-on-human-text data shows these are *more* common in human writing than in LLM output.
7. **Allow repetition.** Humans repeat words; AI sweats to avoid them. Don't force elegant variation. If a topic involves "constraints," keep saying "constraints" rather than cycling through "limitations," "restrictions," "confines."
8. **Sentence case headings.** Convert title-case headers to sentence case unless proper nouns demand caps.
9. **Remove meta-commentary.** Strip *I hope this helps, it's important to note, as of my knowledge cutoff, based on available information*.
10. **Fix or remove broken citations.** If a source is fabricated or doesn't verify the claim, either find a real source or remove the claim. Hallucinated citations are worse than no citations.
11. **Straighten quotes.** Unless the context genuinely demands typographic quotes, use straight `"` and `'`. Default to straight unless publishing in a venue that explicitly requires curly.
12. **Kill the framing.** AI constantly frames topics amid "debates" or "broader movements" even when no such framing is warranted. Remove *"This initiative was part of a broader movement to..."* unless the broader movement is itself the subject and properly sourced.

### Paragraph-Level Surgery
- **Replace "significance" paragraphs.** AI often adds a paragraph whose sole purpose is to say the topic matters. Cut it unless it says *how* or *why* with specific evidence.
- **Unstack parallelisms.** *"Not only X but also Y"* → two simple sentences, or reorder into *"Both X and Y"*.
- **Split rule-of-three lists.** Separate the three items into individual sentences or cut the weakest one.
- **Remove "challenges" boilerplate.** If a "Challenges" section begins *"Despite its [positive words], [subject] faces challenges..."*, rewrite from first principles or delete if the challenges are trivial.

## Cross-Validation Checks (Human Reverse-Tells)

Before finalizing the verdict, confirm the text is *not* human by checking for
these genuinely human patterns that AI typically avoids:

| Human pattern | AI frequency |
|---------------|--------------|
| Simple *is/are/has* constructions | Lower in AI |
| Hedging: *very, perhaps, tends to, one of the best* | Lower in AI |
| Straightforward superlatives: *was the first, is the only* | Lower in AI |
| Common wordy constructions: *as a result of, in order to, all of the, the fact that* | Lower in AI |
| Direct word repetition without synonym-swapping | Lower in AI (repetition penalty) |
| Sentence fragments, informality, or conversational asides | Very low in AI |
| Self-deprecating or uncertain phrasing | Very low in AI |

If the document shows *many* of these human patterns alongside a few AI tells,
downgrade the severity — it may be human writing with formal habits, or lightly
AI-edited human text.

## Workflow

### Step 1: Read the input
Accept the user's document (markdown, `.txt`, or pasted text). If the file is large, you may process it in sections, but keep a running tally.

### Step 2: Audit pass
Systematically scan the document against all tables in **Sections A–F** above. For each hit, record:
```markdown
### Hit #N — [Category Name]
- **Severity:** [critical/strong/moderate/mild]
- **Location:** [paragraph or line number, or quote first 10 words]
- **Original:** "exact quoted text"
- **Issue:** [1-sentence explanation]
- **Suggested fix:** [brief rewrite or "delete entirely"]
```

### Step 2.5: Cross-validation (Human reverse-tells)
Before scoring, explicitly check the text for human patterns (see Cross-Validation
Checks section). If many human patterns are present alongside AI tells, note
this in the assessment and downgrade the overall verdict by one level
(e.g., "Highly likely" → "Probably").

### Step 3: Severity summary
At the end of the audit, produce a summary table:

| Severity | Count |
|----------|-------|
| Critical | N |
| Strong | N |
| Moderate | N |
| Mild | N |

And an **Overall Assessment** paragraph with a **confidence level**:

| Verdict | Criteria | Confidence |
|---------|----------|------------|
| **Highly likely AI** | Multiple critical + strong hits across ≥2 of {semantic, syntactic, formatting, citation} categories; vocabulary clusters present; absence of strong human reverse-tells. | High |
| **Probably AI-assisted** | Several strong/moderate tells but no critical errors; OR critical errors limited to one category with strong human patterns elsewhere; may be human-edited AI output. | Moderate |
| **Possibly AI** | Only mild tells or isolated moderate ones; could be a human writer with formal habits, or AI with heavy human editing. | Low |
| **Likely human** | No hits, or only a couple of mild coincidences; strong human reverse-tells present throughout. | High |

Add a **model guess** if the vocabulary era table permits (e.g., "GPT-4-era, circa 2023–2024" or "GPT-4o/5-era, 2024–2025"). Note this is speculative.

### Step 4: Humanized rewrite
Produce a full rewrite of the document with tracked changes. Format options (ask user preference, default to **inline**):

**Option A — Inline annotations:**
```markdown
Original: The Statistical Institute of Catalonia was officially established in 1989, marking a pivotal moment in the evolution of regional statistics in Spain.
[AI-AUDIT: PUFFERY — "marking a pivotal moment in the evolution of" adds no factual content]
Rewritten: The Statistical Institute of Catalonia was established in 1989 to coordinate regional statistics for Spain's autonomous communities.
```

**Option B — Clean rewrite only:**
```markdown
[Full cleaned text with no annotations]
```

**Option C — Side-by-side markdown table:**
| Original | Rewritten |
|----------|-----------|
| ... | ... |

### Step 5: Delivery
Save both artefacts in the **current working directory**:
- `AI_Audit_Report.md`
- `Humanized_Text.md`

Then present a concise summary to the user and ask:
> Audit complete. [N] critical, [N] strong, [N] moderate, [N] mild flags found. Overall assessment: **[verdict]**.
> Do you want me to:
> 1. Show the full audit report
> 2. Show the humanized rewrite
> 3. Refine a specific section
> 4. Export both files

## False Positives — What NOT to Flag

The following patterns are often *mistakenly* cited as AI signs but are **not**
reliable indicators on their own. Do not report them unless they cluster with
other, stronger tells.

| Supposed "tell" | Why it is NOT reliable | When to ignore |
|-----------------|------------------------|----------------|
| **Perfect grammar** | Many humans are skilled writers, editors, or professionals. | Always treat as neutral. |
| **Combination of casual + formal registers** | Common in technical fields (CS, engineering), youth writing, mixed-register preference, neurodivergence, or multi-author wikis. | Ignore unless combined with strong vocabulary/syntactic tells. |
| **"Bland" or "robotic" prose** | AI output is *not* bland by default — it is verbose, promotional, and formulaic. True AI text has the specific traits listed above. | Never flag "blandness" alone. |
| **"Fancy", "academic", or "formal" prose** | AI overuses *specific* words (the vocabulary table above), not all formal language. Many humans write formally. | Only flag when specific AI-vocabulary words appear in clusters. |
| **Transition words in isolation** | *Additionally, Consequently, Notably* at sentence starts are common in human essays and accepted by style guides. | Only flag when transitions are part of a larger vocabulary cluster. |
| **Unsourced content** | >570,000 Wikipedia articles need citations, most pre-dating LLMs. Modern AI can search the web and often *does* cite sources (even if fabricated). | Do not flag lack of sources as AI; flag *broken/fabricated* sources instead. |
| **Bizarre wikitext / HTML artifacts** | Random `<span>` tags are typically browser extension bugs or Wikipedia Content Translation tool errors (T113137). Misplaced italics like `''Catch-22 i''s` are VisualEditor glitches. | Only flag when the bizarre markup matches known AI leaked syntax (turn0search, oaicite, etc.). |
| **Correct wikitext formatting** | Using the visual editor or preview button to get formatting right is normal human behavior. | Never flag correct formatting. |

## Important Caveats

1. **One sign ≠ smoking gun.** Coincidences happen; humans also write formally, use em dashes, or occasionally bold keywords.
2. **Context matters.** A *delve* in an archaeology article about actual digging is fine; a *delve* in a tech product review is suspicious.
3. **Post-2022 baseline.** These patterns became significant after ChatGPT's public launch (Nov 30 2022). Pre-2022 text with these features is human coincidence. If you know the text's age, apply this hard filter.
4. **Model drift.** AI vocabulary shifts with each generation. Refer to the "Era" table when dating suspected output. Heavy users of LLMs can correctly identify AI text ~90% of the time; non-users perform near random chance.
5. **Human-in-the-loop.** Always give the user the chance to override a "fix" — what looks like AI puffery might be the user's genuine analytical frame.
6. **Style shift analysis.** If you have access to multiple samples by the same author, check for sudden shifts: flawless grammar where previous writing was less polished, American English for a non-American topic, or formatting habits (boldface, em dashes, lists) that appear abruptly.
7. **Wikipedia-specific vs general.** Some signs (Markdown syntax, wikitext errors, AfC templates, red categories) are specific to Wikipedia/MediaWiki. For general essays/articles, ignore those and focus on semantic, vocabulary, and syntactic tells.
8. **Native speaker nuance.** Non-native English speakers may also avoid word repetition (taught in some school systems, e.g., Italian) and may use more formal constructions. Do not conflate L2 writing patterns with AI generation.
9. **Confirmation bias check.** Before declaring AI use, consider whether the Dunning-Kruger effect or confirmation bias may be clouding your judgment. Detection based on style alone is *not* as easy as it seems.

## Tool Usage

- `read` — ingest the user's document. If it is very long, read in chunks but maintain a running tally.
- `edit` — make surgical replacements when the user asks to fix a specific passage.
- `write` — create `AI_Audit_Report.md` and `Humanized_Text.md`.
- `bash` — grep/rg for known AI-vocabulary terms across very large documents to speed up the audit (see Search Cheat-Sheet above).
- `web_search` / `web_fetch` — optionally verify whether suspected hallucinated citations actually exist or resolve correctly. Use this when the text contains DOIs, ISBNs, or URLs that may be fabricated.

## Iterative Refinement Protocol

When the user says "make it more human" or "de-AI this further," do not just
re-run the same audit. Instead:

1. **Compare versions.** Read the previous `Humanized_Text.md` against the original.
2. **Identify residual tells.** Look for AI patterns that survived the first pass — often these are subtler: a lingering *enhancing* clause, a still-title-cased heading, or a promotional adjective that was missed.
3. **Escalate specificity.** On each pass, push further toward concrete facts, statistics, named individuals, dates, and direct quotations.
4. **Introduce imperfection.** Deliberately add (or preserve) minor human touches: a sentence fragment, a colloquial transition, a repeated word, a slightly informal aside.
5. **Check for over-correction.** Ensure the rewrite hasn't introduced new awkwardness or factual errors in the name of "humanization."
6. **Present incremental diff.** Show only what changed between the current and previous version, labeled as `Pass N → Pass N+1`.

Stop iterating when the user says **stop**, **done**, **finish**, or **this is good**.

## Example Run (abbreviated)

**User provides:** a blog post draft about urban gardening.

**Agent grep pre-scan:**
```bash
rg -in '\b(boasts|vibrant|showcasing|pivotal|underscore|enhancing|testament|crucial|delve|intricate)\b' draft.md
# → 14 hits across 6 paragraphs — high signal
```

**Agent output (audit excerpt):**
```markdown
### Hit #1 — Promotional language (Strong)
- **Original:** "Nestled in the heart of the city, the community garden boasts a vibrant array of native plants, showcasing the community's deep commitment to environmental stewardship."
- **Fix:** "The community garden, established in 2019 on a former parking lot, grows native plants and is maintained by about 40 volunteers."

### Hit #2 — AI Vocabulary cluster (Moderate)
- **Original:** "This pivotal initiative underscores the importance of green spaces in urban landscapes."
- **Fix:** Delete sentence — restates the obvious. If kept: "Green space in cities correlates with lower ambient temperatures (Smith 2021)."

### Hit #3 — Superficial analysis (Moderate)
- **Original:** "The garden features educational workshops for local schools, fostering environmental awareness among young residents."
- **Fix:** "Local schools use the garden for workshops on composting and plant biology."

### Hit #4 — Avoidance of copula (Mild)
- **Original:** "The site serves as a living classroom for sustainable practices."
- **Fix:** "The site is used as a classroom for workshops on sustainable gardening."
```

**Overall Assessment:** Highly likely AI — multiple strong semantic and vocabulary tells with promotional tone inconsistent with neutral blog style. Vocabulary cluster analysis suggests GPT-4-era output (mid-2023 to mid-2024).
