---
slug: conceptual-limitations
title: Conceptual limitations of llms
authors: [fabrice]
tags: [typr]
image: /img/typr.png
---

# The Conceptual Limitations of AI: Why LLMs Won't (Yet) Replace Programming Languages and Humans

Artificial intelligence, and *Large Language Models* (LLMs) in particular, are making spectacular progress. Yet, behind the prevailing enthusiasm, several fundamental conceptual limitations persist. These limits are not simple bugs to fix: they are structural and deserve careful consideration. This explain why programming languages will still exist in the future.

## 1. The Data Limitation: AI's Achilles' Heel

The first limitation, and arguably the most well-known, concerns **training data**.

The majority of AI systems are trained on vast datasets, and the quality of that data directly determines the model's capabilities. You could take the best AI of the era: if you train it with erroneous, biased, or low-quality data, it won't produce anything impressive.

### The Bias Problem

Data must not only be of good quality but also **free from bias**. There have already been cases where an AI used in a judicial context produced biased and discriminatory judgments. ProPublica's investigation into the [COMPAS (Correctional Offender Management Profiling for Alternative Sanctions)](https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing) software revealed that for the same offense, the sentence could vary depending on the defendant's skin color. This type of bias, inherited from training data, can have devastating consequences.

### Pollution from AI-Generated Content

The problem is worsening with a recent phenomenon: most LLMs are trained on content sourced from the Internet. However, we are witnessing an explosion of **AI-generated content** on the web. This content, often mass-produced with no concern for quality or added value, ends up in the training data of future AI systems. This is a vicious cycle that researchers call [*model collapse*](https://www.nature.com/articles/s41586-024-07566-y) (Shumailov et al., *Nature*, 2024), a degenerative process that risks progressively degrading model quality over successive generations.

## 2. The Context Limitation: A Failing Short-Term Memory

If training data represents an AI's **long-term memory**, context constitutes its **short-term memory**.

Context has a limited size and can only retain a certain number of elements from a project. Worse still, it resets with each new session. Granted, new techniques allow the creation of summary files to maintain some form of continuity, but these summaries themselves consume part of the available context.

### The Context Window Paradox

Companies have developed AI systems with increasingly large context windows. But as demonstrated by the study [*Lost in the Middle: How Language Models Use Long Contexts*](https://arxiv.org/abs/2307.03172) (Liu et al., 2023), response quality **degrades significantly** when relevant information is located in the middle of the context. Quantity does not replace quality of processing.

### The Human Advantage Over Time

This is precisely where a human eventually outperforms an AI. On a given task, the AI may perform better at first. But as the human develops and accumulates experience, their "context" improves and remains consistent. The AI's context, on the other hand, resets or becomes unreliable over time.

## 3. The Language Limitation: Ambiguity as a Fundamental Obstacle

This limitation is particularly relevant for **code-focused AI**. We often hear that AI will replace developers, or even programming languages themselves, with natural language becoming the new interface.

There is some truth to this vision, but it obscures a fundamental problem: AI systems constitute a **new layer of abstraction** that inherits the flaws of human languages.

The reason we created **formal languages** (programming languages) in the first place is precisely because they eliminate all ambiguity to produce correct machine code. Human language, by contrast, is **inherently ambiguous**. The same sentence can be interpreted in different ways, and the fact that AI systems operate on a **probabilistic generation** basis makes the endeavor even riskier.

However, some avenues exist: certain research shows that natural language can be reduced to a [**controlled language**](https://en.wikipedia.org/wiki/Controlled_natural_language) (*Controlled Natural Language*), trading expressiveness for precision. A [comprehensive classification of these languages](https://doi.org/10.1162/COLI_a_00168) was proposed by Kuhn (2014). Other work explores hybrid approaches combining formal and natural languages.

## 4. The Environment Limitation: The Real World Isn't Ready

The last conceptual limitation is perhaps the most underestimated: that of the **environment**.

The AI systems of the future risk resembling the **flying cars** we were once promised. One of the main reasons flying cars never materialized isn't just technology: it's that **the world wasn't ready to accommodate them**. Airways already had their rules, designed for aircraft. Roads were designed for cars. Integrating a hybrid vehicle would have been a regulatory and systemic nightmare.

### The Gap with Workplace Reality

The reality of a human work environment is fundamentally different. A workplace cannot be reduced to algorithmic metrics. It involves human beings interacting in an environment far more complex than any laboratory, even one equipped with AI agents. We are trying to integrate AI, robots, and machines into a **universe designed by and for humans**. And these machines do not yet have the capacity to fully adapt to it.

### Impressive Performance, but Only in the Lab

The same applies to AI. Benchmarks from the research group [METR](https://metr.org), notably their study [*Measuring AI Ability to Complete Long Tasks*](https://metr.org/research/) (March 2025), show impressive results: AI systems capable of working autonomously for several hours on a given task, with a time horizon that roughly doubles every 7 months. But these tasks remain **confined to specific domains** (programming, security, infrastructure) and take place in **research and experimental environments**.

---

## In Summary

Current LLMs, despite considerable progress in creating AI systems that reason better and can take more initiative, remain systems that:

- are **dependent on training data quality**,
- have a **limited memory** (context),
- suffer from the **ambiguity of natural language**,
- have a **very restricted interaction with the real world**.

The true challenge of creating AI capable of fully replacing human beings therefore remains wide open.

## Let's Not Forget the Progress

That said, it would be unfair not to acknowledge the phenomenal progress that has been made. AI systems are now capable of performing reasoning tasks on existing knowledge, sparing us from "reinventing the wheel." A large portion of repetitive work is now automated, freeing us to focus on **more important tasks**: research tasks, solving open and complex problems, and challenges deeply tied to the human experience.

AI doesn't replace humans. It **repositions** them to do what they do best. AI doesn't replace programming languages. It covers a domain where the actual level of abstraction is blocking development speed so programming languages can strive in their own domain.
