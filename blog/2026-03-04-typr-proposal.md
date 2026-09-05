---
slug: typr-proposal
title: What if S3 code could write itself? 
authors: [fabrice]
tags: [typr, tdd]
image: /img/typr.png
---

# Introducing typr, a type-safe code generator for R

If you've ever maintained an R package with S3 classes, you know the drill: manually writing constructors, hoping field names stay consistent, debugging method dispatch when someone passes the wrong structure. S3 is powerful, but it puts all the burden on the developer.

I've been working on a tool called **typr** that takes a different approach. You declare your types in a concise .ty file, typr checks them statically, and then generates clean, idiomatic R/S3 code. The output is plain R — no runtime dependency, no magic.

**A concrete example**

Suppose you're building a package that models survey respondents:

```
type Respondent <- list {
    id: int,
    name: char,
    score: num
};

create_respondent <- fn(id: int, name: char, score: num): Respondent {
    list(id = id, name = name, score = score)
};
```

TypR checks at compile time that every function using a `Respondent` respects the structure. If you mistype a field or pass a `char` where an `int` is expected, you get an error *before* anything runs. The generated R code uses standard S3 classes that any other R package can consume.

**Why not just use R7 or S4?**

R7 and S4 solve the class *definition* problem, but they don't offer static analysis before runtime. TypR operates at a different level: it catches type errors at write time, then generates code that works with whichever class system you prefer. Think of it as a layer *above* the class system, not a replacement.

**What's next**

I'm preparing a proposal for the R Consortium ISC Grant Program to turn typr into a proper R package — installable, documented, with vignettes showing real package development workflows.

Before I submit, I want to hear from the community:

- Does this match a pain point you've actually experienced?
- What features would matter most? (data.frame column typing? editor integration? CI/CD checks?)
- What would stop you from trying it?

You can try it now:
- GitHub: https://github.com/we-data-ch/typr
- Online playground: https://we-data-ch.github.io/typr-playground.github.io/

I'd genuinely appreciate any feedback — especially the skeptical kind. It'll make the project and the proposal better.

*Fabrice — Geneva, Switzerland*
