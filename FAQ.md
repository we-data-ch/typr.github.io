# TypR — FAQ for R Users

*A friendly guide to the typed version of R, compiled from the official documentation, the GitHub repository, and the author's posts and Q&A sessions on r/rstats.*

## First questions

### 1. What is TypR?

It's simple, TypR is a **statically typed version of R**. This product was designed for package and application developers.

You could think of it as "R, but where mistakes get caught before your code runs instead of halfway through your analysis." You write code in a language that looks almost identical to R, a compiler checks your types, and then it translates everything into ordinary `.R` files.

It was born from a master's thesis on type systems for multidimensional arrays, grew into a full development framework, and the compiler itself is written in Rust and developed openly by WeData.ch (Geneva, Switzerland), principally Fabrice Hategekimana.

### 2. So… do I have to give up R to use it?

Not at all! Quite the opposite. TypR is designed to *live next to* R, not instead of it. There's no new platform, no virtual machine, no special version of R, no system-level dependency, just one small `typr` binary. And once your code is compiled, TypR "disappears": the output is plain R code that runs anywhere R runs.

R stays the tool of choice for research, exploration, and interactive statistics. TypR is for  packages and applications that need to survive production.

### 3. Wait, is this going to replace R?

No, and we are blunt about this: TypR was never there to replace R! Use it only if you need to make R more robust to error. Simply put: use the right tool for the right task.

> "What makes R great for data science makes it bad for package building. TypR decides to inverse that."
> _Fabrice Hategekimana_

### 4. Who is it for, then? And who should skip it?

**In its sweet spot:** package developers, teams building Shiny applications that go to production, and anyone maintaining R code that other people depend on.

**May not be worth it:** if you mainly *do things to data*: exploratory scripts, one-off analyses interactive working sessions. Simply put: code where booleans get multiplied by floats without consequence. R is already amazing for that! In this scenario, strict typing is pure overhead. Using TypR for pure data analysis would be "a burden at best" (Fabrice Hategekimana). 

> **The 10-second litmus test:** if your script is thrown away after the analysis, stay in R. If your code will still be running (and being modified) in six months, keep reading.

### 5. Is there a good mental model for how it relates to R?

A simple analogies: **TypeScript for JavaScript**. You write in a more structured, safer language and get standard R at the end.

One nuance: TypR is *not* a strict superset of R. It's a **dialect** of R with a "flavor of Rust" in the design.

### 6. Ok, TypR is written in Rust and is inspired by it... so more dependencies?

The TypR is just a binary. The compiled result has **no dependency on Rust whatsoever**. Rust is just the language the transpiler happens to be written in. You can then work from the command line (`typr build`), in a compatible IDE, or in RStudio via the companion [`typr_runner`](https://www.youtube.com/watch?v=GMo20g__nOc) package. An LSP and a formatter are in development.

## 7. Then is it just R + Rust?

Not exactly! TypR is gradually Typed, which means that R code is valid TypR code. This means that you can start with your normal R code and you can gradually add types. So if you know R you already most of the synthax of TypR.

On top of that, TypR did not just take inspiration from Rust. But it also took inspiration from more exotic porgramming languages like [Scala](https://www.scala-lang.org/), [Nim](https://nim-lang.org/) and [Roc](https://www.roc-lang.org/).

## Getting started

### 8. How do I install it?

Three steps:

1. Install a recent version of R (RStudio optional).
2. Get the `typr` compiler via any of these routes:
   - **Binaries**: Windows, macOS, or Linux from the [Releases page](https://github.com/we-data-ch/typr/releases/)
   - **Docker**: `docker pull fabricehategekimana/typr:latest`
   - **Cargo**: if you already have Rust installed
3. Verify with `typr --version`.

### 9. What does TypR code actually look like?

Very close to R. "typed code should still look like R, with minimal syntactic overhead":

```r
# Hello World in TypR
let message: char <- "Hello, TypR!";

let add <- fn(a: int, b: int): int {
  a + b
};

print(add(5, 3));
```

The new things: `let` for declarations, a semicolon at the end of statements, type annotations (`name: type`), and `fn` for typed functions. Assignment still uses `<-`, and all your favorite base R functions work as-is.

### 10. Honestly, the semicolons bug me. Why?

Treat them as possibly transitional, not sacred. But it is useful for now.

> "Yeah, this story of semicolon will bring a lot of haters. I will see if I can remove it in the future." 
> Fabrice Hategekimana 

### 11. Do I have to annotate *everything*? That sounds exhausting.

No — TypR is **gradually typed**, like Python with type hints or TypeScript with `any`. Both of these are valid TypR:

```r
# strong on safety
let my_addition <- fn(a: int, b: int): int { a + b };

# strong on freedom — plain R style
let my_addition <- function(a, b) { a + b };
```

On top of that, the compiler does **type inference**, filling in types from literals, expressions, and context. So , you only annotate where clarity or safety really matters. Pick your own point on a freedom-versus-safety spectrum, with R at one extreme and Rust at the other!

## Types and data structures

### 12. What types are built in?

Four primitives — `int`, `num`, `bool`, `char` — plus `Empty` for functions that return nothing and `Any` as the escape hatch. Composite types include vectors (`Vector[n, T]` or `c(...)`), arrays (`[n, T]`, written `[1, 2, 3]`), lists (`list { field: T, ... }`), and function types like `(T1, T2) -> T3`.

### 11. How do I define my own data types?

With a `type` declaration:

```r
type Person <- list {
  name: char,
  age: int
};
```

From then on, the compiler checks that everything using a `Person` respects the structure — a mistyped field name or a `char` where an `int` belongs fails **at compile time, before anything runs**. Under the hood this generates standard S3-based R (constructors, validators, classes) that any other R package can consume — letting, in the author's words, "S3 code write itself."

A subtlety worth knowing: `type X <- ...` creates a *distinct* new type, while `type X = ...` (single equals) creates a mere *alias*, interchangeable with the underlying type.

### 12. What about values that can be one of several things?

That's where **tagged unions** and **pattern matching** come in — the safe way to handle optionals and error cases:

```r
type Option<T> <- .Some(T) | .None;

let val: Option<bool> <- .None;

let res = match val {
  .Some(a) => a,
  _        => false
};
```

Generics like `Option<T>` work with any inner type, and the compiler checks your `match` is exhaustive. Plain union types (`int | bool`) exist too, with variants marked by a leading dot.

### 13. I've heard TypR is "structurally typed." What does that mean for my data frames?

In most typed languages, a type must be *declared* to belong somewhere (nominal typing). TypR instead checks *shape* (structural typing, like TypeScript): a function expecting a list with an `age` field accepts **any** list that contains that field — no inheritance ceremony required.

This is a deliberate design decision from the author's master's thesis, where rigidity was identified as the enemy. For data frames specifically, **row polymorphism** lets functions declare only the columns they touch:

```r
fn(df: DataFrame { age: int }): DataFrame { age: int } {
  ...
}
```

That function accepts *every* data frame with an integer `age` column, however many other columns it carries — the schemas stay flexible, while the compiler still verifies the columns your function actually uses.

## Working alongside R

### 14. Can I add TypR to an existing R package without rewriting everything?

Yes — "just add one folder." A TypR package is a normal R package plus a `TypR/` directory containing `.ty` files and a mandatory `main.ty` entry point. Run `typr build` and TypR generates plain R code into `R/` (typically helper files like `a_std.R`, `b_generic_functions.R`, `c_types.R`, plus `d_main.R` as the entry point). To devtools, testthat, pkgdown, and CRAN, it's just a regular package — `devtools::install()` and `library()` work unchanged.

Migration is gradual: file by file, function by function. Best practice is one file per type, wired together via the `mod` keyword (`mod person;` finds, checks, and transpiles `person.ty`). The one footgun: if a `.ty` file would transpile onto an existing `.R` file of the same name, they overwrite each other — just agree on a naming convention.

### 15. Can I mix TypR and R in the same project?

Yes, in all directions: some functions in TypR, others in plain R; call R code from TypR and TypR-generated code from R. The docs' advice is simply to drop into raw R-style untyped functions only when TypR's typed ones aren't sufficient.

### 16. Base R functions are untyped — how do I get type checking on them?

Out of the box, most base R functions arrive to TypR as accepting `Any` and returning `Empty`, so `toupper(7)` still only fails at runtime. The fix is a **signature annotation**, which types an existing function without touching it:

```r
@toupper: (char) -> char;

toupper("Hi");   # fully type-checked
toupper(7);      # now a compile-time error
```

This works for base R (`paste`, `cat`, `toupper`, …), functions from external packages — and yes, including **Rcpp** packages, whose functions you can call, with type signatures you write yourself.

### 17. What actually ships in a compiled package — S3, S4, S7?

Currently, the transpiler emits **standard S3-based R**. Transpiling to S7 is "in discussion" but in doubt — the author suspects S7 may not be rich enough to sustain TypR's type system. Either way, downstream users never need TypR installed to consume your package.

And TypR can even target other languages: **JavaScript and WebAssembly** are transpilation targets in addition to R. A related feature, "JS Blocks," type-checks JavaScript strings meant for D3/Plotly/Shiny front-ends — goodbye, `paste0()`-built configs.

## Advanced language features

### 18. How do function calls work? I heard something about methods and pipes.

Every TypR function can be called **three equivalent ways** (uniform function call syntax):

```r
add(5, 3)          # classic
(5) |> add(3)      # pipe
(5).add(3)         # method-call style
```

Because any function's first argument can become the "receiver," you get readable chaining without attaching methods to classes. Function values are first-class citizens with their own type syntax (`(T1, T2) -> T3`), and higher-order functions, lambdas, and closures all work — with the type system verifying that what gets captured and composed stays safe.

### 19. What happened to OOP? Do I still have to choose S3 vs S4 vs R6?

No — and that's a headline design goal: "all you need are types and functions." Instead of picking an OOP system, you declare types and functions, and TypR handles the object system underneath (today, S3; S4's clunky syntax, S3's lack of validation, and R6's departure from R idiom are all addressed by one simple, typed, validated syntax).

Where you'd reach for polymorphism, TypR offers **interfaces** — ad-hoc polymorphism in the spirit of Rust traits or Haskell type classes:

```r
type Viewable <- interface {
  view: (Self) -> char
};

let view <- fn(a: bool): char { "bool" };

true.double();   # bool now inherits every function written for Viewable
```

Implement one required function for a type, and that type instantly inherits every function written against the interface — no modification of the original code needed.

### 20. What about vectorization? R users kind of love vectorization.

TypR keeps it, but rethought: **lifting-based vectorization**. You write functions for *scalar* values, and the type system decides when to lift them over collections — "the best way to use vectorization is not to think about vectorization."

Why rethink it? Because native R vectors handle atoms brilliantly but fall apart around custom objects: put `Point` objects in a list and suddenly `scale(points, 2)` errors and `points$x` is `NULL`. In TypR, arrays are "vectorized by default":

```r
let points <- [new_point(1, 2), new_point(3, 4)];

scale(points, 2)   # works — lifts the scalar function
points * 3         # works, via operator overloading
```

Reductions come along for the ride (`points |> sum()` uses *your* type's `+`). One current rough edge: with `reduce`, the type system can't yet infer which operator instance you mean, so you write `` points |> reduce(`+`<Point>) ``.

Be aware of the engine room detail: TypR arrays are backed by a custom S3 object (`typed_vec`), and the docs are candid that **native R vectors and data.frames remain faster**. Bridges to native types (`arr |> to_vec()`, `points |> to_df()`) and field accessors (`points$x`) are planned, but treat them as roadmap, not shipped.

### 21. Anything else up the type-system sleeve?

The full toolkit: pattern matching, tagged unions, generics, interfaces, partial currying, union and intersection types, structural subtyping, row polymorphism, type aliases, and type inference. From the thesis heritage, **multidimensional arrays are first-class**: `[[1,2,3], [4,5,6]]` infers the recursive type `[2, [3, int]]`, enabling type-safe matrix operations (transpose, products) — the author even sketches type-safe ML packages and tensor types (`Tf[I, T]`) as feasible directions.

There's also compact constructor shorthand with an export decorator:

```r
@export
let red_button <- \Button:{ color: "#FF000000" };
```

## Comparisons and evidence

### 22. How is this different from R7, S4, or checkmate-style assertions?

R7 and S4 solve the class *definition* problem, but neither offers **static analysis before runtime**. Runtime validation packages check types as code executes; TypR checks them at compile time, in a separate step, then emits code that plays nicely with whatever class system your consumers expect. The neat summary: validation code doesn't disappear — it moves from being your maintenance burden to being the compiler's job.

### 23. Can't R's metaprogramming do runtime type checking already?

Yes — one Redditor even built a `%::%` infix using active bindings that does runtime validation. The author's honest reply: **for data analysis, that lighter approach is genuinely better**, and adopting TypR there would be a burden at best. TypR's justification is being a *framework* — a real type system, a project manager, an LSP (in development), a future formatter — for complex package and application building, where scattered runtime guards don't scale.

### 24. How does it compare to Julia or vapour?

- **Julia**: a "marvelous language" in the author's words. TypR's advantages for R users are the smaller learning curve and staying inside the existing ecosystem.
- **vapour** (another attempted type system for R): TypR's cited differentiators are typing for multidimensional arrays/tensors, multi-target transpilation (R, JS, WebAssembly), and features like type embedding, row polymorphism, and uniform function call syntax.

### 25. Does static typing *actually* reduce bugs? Show me evidence.

Fair question. The author cites the controlled-study literature, notably Gao et al. (2021), estimating at least a **~15% reduction in fixable faults** — while candidly acknowledging that the field is contested (Ray et al. 2017 vs. Berger et al. 2019; notably, Berger's senior author Jan Vitek has long researched gradual typing for R specifically). His summary of the state of evidence: a significant effect, demonstrated across studies, with a disputed magnitude.

## Day-to-day workflow

### 26. How does testing work?

Inline `#!test` blocks sit right next to the code they validate. During transpilation, they're extracted into standard testthat files (`tests/testthat/test-<filename>.R`). Logic and tests side by side — no more juggling between `R/person.R` and `tests/testthat/test-person.R` — while the resulting package stays fully conventional.

### 27. What about documentation (Rd, pkgdown, roxygen)?

TypR injects types, modules, and examples straight into **Rd documentation, with pkgdown support**: documented types cross-link automatically, type aliases get their own documentation page (and constructor where appropriate), roxygen `#'` comments are preserved, and `@export`-style annotations work in `.ty` files.

### 28. Can I keep using RStudio?

Yes, via the companion `typr_runner` package — the author posted a short demo video. Otherwise: command line, any compatible IDE, or the Docker image.

### 29. Was TypR built for AI-generated code?

Not originally — it grew from academic interest in type systems and industrial frustration with code that must survive production. But the author argues the timing is real: as AI writes more code, the expensive part shifts from *writing* to *trusting* — reviewing, validating, maintaining. A strict type system becomes a free automatic checker over generated code, and concise syntax means less for a human to misread. His illustration: roughly **70 lines** of typical generated S3 boilerplate (constructors, `missing()` juggling, field-by-field validators) collapse into about **15 lines** of TypR. Commenters in the community echo the point — LLMs perform noticeably better against strongly typed languages.

## Status and honest caveats

### 30. Is TypR production-ready?

Not yet — it's **alpha-stage** (the site displays version 0.4.17 (alpha); GitHub releases have progressed to v0.5.x). The author says plainly that it "is still new and needs some work to be ready to use," actively solicits feedback — "especially the skeptical kind" — and has embraced the critic's advice: *don't use it unless you really need it, and you're really sure you need it.* A proposal to the R Consortium ISC Grant Program aims to turn `typr` into a proper installable R package with vignettes; an LSP and a formatter are on the roadmap. He also concedes early documentation was sparse and the syntax intimidating, promising a gentler, more gradual presentation of features going forward.

### 31. Where can I discuss it or give feedback?

Via [GitHub Discussions](https://github.com/we-data-ch/typr/discussions), GitHub issues, and the author's recurring r/rstats threads — where participation is notably rich and community feedback demonstrably shapes the design. Starring the repo helps visibility.