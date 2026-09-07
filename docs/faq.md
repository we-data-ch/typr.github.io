---
sidebar_position: 100
title: FAQ
description: Frequently asked questions about TypR for R users.
---

# TypR — FAQ for R Users

Answers to common questions about TypR. Cross-links point to the [documentation](intro.md) and [blog](/blog) where you can explore topics in depth.

---

## First questions

### 1. What is TypR?

TypR is a **statically typed version of R**, designed for package and application developers. You write code that looks almost identical to R, a compiler checks your types, and everything is translated into ordinary `.R` files.

It grew out of a master's thesis on type systems for multidimensional arrays and is developed openly by [WeData.ch](https://we-data.ch) (Geneva, Switzerland), principally Fabrice Hategekimana. The compiler is written in Rust.

### 2. Do I have to give up R to use it?

No. TypR is built to live *next to* R, not replace it. There is no new platform, no virtual machine, no special version of R, and no system-level dependency—just one small `typr` binary. After compilation, TypR disappears: the output is plain R code that runs wherever R runs.

R stays the best tool for research, exploration, and interactive statistics. TypR is for packages and applications that need to survive production. See [R and TypR](/blog/r-and-typr) for a walkthrough.

### 3. Will TypR replace R?

No. TypR was never intended to replace R. Use it when you need stronger guarantees against errors.

> "What makes R great for data science makes it bad for package building. TypR decides to inverse that."
> — Fabrice Hategekimana

### 4. Who is TypR for? Who should skip it?

**TypR fits well if you are:**

- A package developer
- Building Shiny applications for production
- Maintaining R code that other people depend on

**TypR may not be worth it if you mainly:**

- Write exploratory scripts or one-off analyses
- Work in interactive sessions where flexibility matters more than safety

In those scenarios, strict typing is pure overhead. Using TypR for pure data analysis would be a burden at best.

> **The 10-second litmus test:** if your script is thrown away after the analysis, stay in R. If your code will still be running in six months, keep reading.

### 5. How does TypR relate to R?

Think of **TypeScript for JavaScript**. You write in a more structured, safer language and get standard R at the end.

One important nuance: TypR is **not** a strict superset of R. It is a dialect of R with design ideas borrowed from Rust, Scala, Nim, and Roc.

### 6. Does TypR add system dependencies?

No. The transpiler ships as a single binary. The compiled result has **no dependency on Rust whatsoever**—Rust is only the language the transpiler is written in.

You can work from the command line (`typr build`), in a compatible IDE, or in RStudio via the [`typr_runner`](https://www.youtube.com/watch?v=GMo20g__nOc) package. An LSP and a formatter are in development.

### 7. Is TypR just R with Rust syntax?

No. TypR is **gradually typed**: plain R code is valid TypR code, so you can start with normal R and add types incrementally. If you know R, you already know the base syntax of TypR.

On top of that, TypR takes inspiration from [Scala](https://www.scala-lang.org/), [Nim](https://nim-lang.org/), and [Roc](https://www.roc-lang.org/), not just Rust.

---

## Getting started

### 8. How do I install it?

1. Install a recent version of R.
2. Get the `typr` compiler:
   - **Binaries:** Windows, macOS, or Linux from the [Releases page](https://github.com/we-data-ch/typr/releases/)
   - **Docker:** `docker pull fabricehategekimana/typr:latest`
   - **Cargo:** if you already have Rust installed, `cargo install typr`
3. Verify with `typr --version`.
4. Install an IDE if you do not have one:
   - [RStudio](https://docs.posit.co/ide/user/#rstudio-ide-oss-downloads)
   - [Positron](https://positron.posit.co/download)
   - [VS Code](https://code.visualstudio.com/download)
   - [Neovim](https://neovim.io/doc/install/)
5. Add the TypR helper:
   - **RStudio / Positron:** install `typr.runner_*.tar.gz` from the [latest release](https://github.com/we-data-ch/typr/releases)
   - **VS Code / Positron:** search "TypR" in the Marketplace

For more details, see the [installation guide](reference/installation.md).

### 9. What does TypR code look like?

Very close to R. The design principle is that typed code should still look like R, with minimal syntactic overhead:

```typr
# Hello World in TypR
let message: char <- "Hello, TypR!";

# A typed function
let add <- fn(a: int, b: int): int {
  a + b
};

add(5, 3);
```

Assignment still uses `<-`, and base R functions work as-is.

What is new:

- `let` for declarations
- Semicolons (`;`) at the end of statements
- Type annotations (`name: type`)
- `fn` for typed functions

Object management is also simpler. Roughly **70 lines** of typical generated S3 boilerplate (constructors, `missing()` juggling, field-by-field validators) collapse into about **15 lines** of TypR. See [Solving the OOP chaos for R](/blog/typr-oop) for a deeper look.

### 10. Why are there semicolons?

Semicolons disambiguate statements for the current parser. They may become optional in the future; treat them as practical today, not permanent.

### 11. Do I have to annotate everything?

No. TypR is **gradually typed**, like Python with type hints or TypeScript with `any`. Both of these are valid TypR:

```typr
# Strong on safety
let my_addition <- fn(a: int, b: int): int { a + b };

# Strong on freedom — plain R style
let my_addition <- function(a, b) { a + b };
```

The compiler also performs **type inference**, filling in types from literals, expressions, and context. You only annotate where clarity or safety really matters. Pick your own point on the freedom-versus-safety spectrum, with R at one extreme and Rust at the other. See the [types reference](reference/types.md) for details.

---

## Types and data structures

### 12. What types are built in?

- **Primitives:** `int`, `num`, `bool`, `char`
- **Empty:** `Empty` for functions that return nothing
- **Any:** `Any` as the escape hatch
- **Composite types:**
  - Vectors — `Vector[3, int]` or `c(...)`
  - Arrays — `[3, int]`, written `[1, 2, 3]`
  - Lists — `list { field: T, ... }`
  - Function types — `(T1, T2) -> T3`

See the [types reference](reference/types.md) for the full list and examples.

### 13. How do I define my own data types?

With a `type` declaration:

```typr
type Person <- list {
  name: char,
  age: int
};
```

From then on, the compiler checks that everything using a `Person` respects the structure. A mistyped field name or a `char` where an `int` belongs fails **at compile time**, before anything runs. Under the hood, this generates standard S3-based R (constructors, validators, classes) that any other R package can consume.

Subtle but important: `type X <- ...` creates a *distinct* new type, while `type X = ...` creates a mere *alias*, interchangeable with the underlying type. See the [types reference](reference/types.md) for examples.

### 14. How do I handle values that can be one of several things?

Use **tagged unions** and **pattern matching**. This is the safe way to handle optionals and error cases:

```typr
type Option<T> <- .Some(T) | .None;

let val: Option<bool> <- .None;

let res = match val {
  .Some(a) => a,
  _        => false
};
```

Generics like `Option<T>` work with any inner type, and the compiler checks that your `match` is exhaustive. Plain union types (`int | bool`) exist too, with variants marked by a leading dot. See [control flow](reference/control-flow.md) for more on `match`.

### 15. What is structural typing?

In most typed languages, a type must be *declared* to belong somewhere (nominal typing). TypR instead checks **shape** (structural typing, like TypeScript): a function expecting a list with an `age` field accepts any list that contains that field. No inheritance ceremony is required.

For example, **row polymorphism** lets functions declare only the columns they touch:

```typr
let get_age <- fn(p: { age: int }): int {
  p$age
};
```

That function accepts every value—including data frames—with an integer `age` field, regardless of what other fields are present. See the [types reference](reference/types.md) for more on structural subtyping.

---

## Working alongside R

### 16. Can I add TypR to an existing R package without rewriting everything?

Yes. Just add a `TypR/` directory to a normal R package. It contains `.ty` files and a mandatory `main.ty` entry point. Run `typr build` and TypR generates plain R code into `R/` (typically helper files like `a_std.R`, `b_generic_functions.R`, `c_types.R`, plus `d_main.R` as the entry point). To `devtools`, `testthat`, `pkgdown`, and CRAN, it is just a regular package. `devtools::install()` and `library()` work unchanged.

Migration is gradual: file by file, function by function. Best practice is one file per type, wired together via the `mod` keyword (`mod person;` finds, checks, and transpiles `person.ty`). Be careful: if a `.ty` file would transpile to an `.R` file of the same name, it will overwrite it. Agree on a naming convention to avoid collisions.

See the full walkthrough in [R and TypR](/blog/r-and-typr).

### 17. Can I mix TypR and R in the same project?

Yes, in all directions:

- Write some functions in TypR, others in plain R
- Call R code from TypR
- Call TypR-generated code from R

See [Working with R and TypR](reference/r-typr.md).

### 18. Base R functions are untyped—how do I get type checking on them?

Out of the box, most base R functions arrive in TypR as accepting `Any` and returning `Empty`, so `toupper(7)` still only fails at runtime. The fix is a **signature annotation**, which types an existing function without touching it:

```typr
@toupper: (char) -> char;

toupper("Hi");   # fully type-checked
# toupper(7);    # compile-time error
```

This works for base R (`paste`, `cat`, `toupper`, …), functions from external packages, and even **Rcpp** packages whose functions you call with type signatures you write yourself. See the [functions reference](reference/functions.md) for more.

### 19. What does a compiled package contain?

Currently, the transpiler emits **standard S3-based R**. Transpiling to S7 is under discussion, but S7 may not be rich enough to sustain TypR's type system. Either way, downstream users never need TypR installed to consume your package.

TypR can also target other languages: **JavaScript and WebAssembly** are transpilation targets in addition to R. A related feature, **JS Blocks**, type-checks JavaScript strings meant for D3/Plotly/Shiny front-ends. See [TypR for the frontend?](/blog/r-js) for details.

---

## Advanced language features

### 20. How do function calls work? I heard something about methods and pipes.

Every TypR function can be called in **three equivalent ways**, thanks to the [uniform function call syntax](https://en.wikipedia.org/wiki/Uniform_function_call_syntax) inspired by Nim:

```typr
add(5, 3)          # classic
(5) |> add(3)      # pipe
(5).add(3)         # method-call style
```

Because any function's first argument can become the receiver, you get readable chaining without attaching methods to classes. Function values are first-class citizens with their own type syntax (`(T1, T2) -> T3`), and higher-order functions, lambdas, and closures all work. See the [functions reference](reference/functions.md).

### 21. What about OOP? Do I still have to choose S3, S4, or R6?

No. All you need are **types and functions**. Instead of picking an OOP system, you declare types and functions, and TypR handles the object system underneath.

When you need polymorphism, TypR offers **interfaces**—ad-hoc polymorphism in the spirit of Rust traits or Haskell type classes:

```typr
# Signature for an existing R function
@paste: (Any, Any) -> char;

# Define an interface
type Viewable <- interface {
  view: (Self) -> char
};

# Implement `view` for `bool`
let view <- fn(a: bool): char { "bool" };

# Function written against the interface
let double_view <- fn(a: Viewable): char {
  paste(view(a), view(a))
};

true.double_view();   # bool inherits every function written for Viewable
```

Implement one required function for a type, and that type instantly inherits every function written against the interface, without modifying the original code. See [Solving the OOP chaos for R](/blog/typr-oop).

### 22. How does vectorization work?

TypR keeps vectorization, but rethought: **lifting-based vectorization**. You write functions for scalar values, and the type system decides when to lift them over collections.

> "The best way to use vectorization is not to think about vectorization."
> — Fabrice Hategekimana

Native R vectors handle atoms well but fall apart around custom objects. In TypR, arrays are vectorized by default:

```typr
type Point <- { x: int, y: int };

let new_point <- fn(x: int, y: int): Point {
  list(x = x, y = y)
};

let scale <- fn(p: Point, n: int): Point {
  new_point(p$x * n, p$y * n)
};

let points <- [new_point(1, 2), new_point(3, 4), new_point(5, 6)];

scale(points, 2);   # works: lifts the scalar function automatically
points * 3;         # works: via operator overloading
```

Reductions come along for the ride. If your type implements `+`, `sum()` works on the vector:

```typr
let `+` <- fn(p1: Point, p2: Point): Point {
  new_point(p1$x + p2$x, p1$y + p2$y)
};

points |> sum();   # uses your type's +
```

However, with `reduce`, the type system currently cannot infer which operator instance you mean, so you must write `` points |> reduce(`+`<Point>) ``.

TypR arrays are backed by a custom S3 object (`typed_vec`), which means **native R vectors and data frames remain faster** for raw numeric work. Bridges to native types and field accessors are planned but not yet shipped. See [Vectorization by design](/blog/vectorization-by-design).

### 23. What other type-system features exist?

The full toolkit includes: pattern matching, tagged unions, generics, interfaces, partial currying, union and intersection types, structural subtyping, row polymorphism, type aliases, and type inference.

From the thesis heritage, **multidimensional arrays are first-class**: `[[1, 2, 3], [4, 5, 6]]` infers the recursive type `[2, [3, int]]`, enabling type-safe matrix operations (transpose, products). Type-safe ML packages and tensor types (`Tf[I, T]`) are feasible future directions.

You can also export constructors compactly with the `@export` decorator:

```typr
type Button <- list {
  color: char
};

@export
let new_button <- fn(color: char): Button {
  list(color = color)
};
```

See the [types reference](reference/types.md) for details.

---

## Comparisons and evidence

### 24. How is TypR different from R7, S4, or checkmate-style assertions?

R7 and S4 solve the class definition problem, but neither offers **static analysis before runtime**. Runtime validation packages check types as code executes; TypR checks them at compile time, then emits code that plays nicely with whatever class system your consumers expect. Validation code does not disappear—it moves from your maintenance burden to the compiler.

### 25. Can R's metaprogramming do runtime type checking already?

Yes. Several projects have built runtime validation for R, such as infix operators using active bindings. For data analysis, a lighter approach is genuinely better, and adopting TypR there would be a burden at best. TypR's justification is being a **framework**: a real type system, a project manager, an LSP (in development), and a future formatter.

### 26. How does TypR compare to vapour?

**vapour** is another type-system project for R. TypR's differentiators include:

- typing for multidimensional arrays and tensors
- multi-target transpilation (R, JavaScript, WebAssembly)
- type embedding
- row polymorphism
- uniform function call syntax

### 27. How does TypR compare to Julia?

**Julia** is an open-source scientific computing language optimized for performance with optional typing. TypR's advantages for R users are the smaller learning curve and staying inside the existing R ecosystem. Performance is not the primary goal yet; **type safety and robust projects** come first.

### 28. Does static typing actually reduce bugs?

There is strong industry evidence that static typing reduces defect rates. TypeScript's success over JavaScript is one prominent example. The TypR team uses typed languages (Rust, TypeScript, Nim, and others) and wishes for similar safety when returning to R. A type system catches bugs before they reach production, where they are harder and more expensive to fix.

---

## Day-to-day workflow

### 29. How does testing work?

Inline `Test { }` blocks sit right next to the code they validate. During transpilation, they are extracted into standard **testthat** files (`tests/testthat/test-<filename>.R`). Logic and tests stay side by side, while the resulting package remains fully conventional.

```typr
type Person <- list {
  name: char,
  age: int
};

let new_person <- fn(name: char, age: int): Person {
  list(name = name, age = age)
};

let is_adult <- fn(self: Person): bool {
  self$age >= 18
};

Test {
  test_that("is_adult works", {
    let adult <- new_person("Alice", 25);
    let minor <- new_person("Bob", 15);
    expect_true(adult.is_adult());
    expect_false(minor.is_adult());
  })
}
```

See [Better tests with TypR](/blog/typr-tdd) for a full example.

### 30. What about documentation (Rd, pkgdown, roxygen)?

TypR injects types, modules, and examples straight into **Rd documentation, with pkgdown support**: documented types cross-link automatically, type aliases get their own documentation page (and constructor where appropriate), roxygen `#'` comments are preserved, and `@export`-style annotations work in `.ty` files.

### 31. Can I keep using RStudio?

Yes, via the companion `typr_runner` package. Otherwise: command line, any compatible IDE, or the Docker image. See the [installation guide](reference/installation.md).

### 32. Was TypR built for AI-generated code?

Not originally. It grew from academic interest in type systems and industrial frustration with code that must survive production. However, as AI writes more code, the expensive part shifts from writing to **trusting** (reviewing, validating, and maintaining). A strict type system becomes a free automatic checker over generated code, and concise syntax means less for a human to misread. LLMs also tend to perform better with strongly typed languages.

---

## Status

### 33. Is TypR production-ready?

Not yet. TypR is **alpha-stage**. It is still new and needs work before it is ready for general use. Feedback is actively solicited—especially the skeptical kind.

Do not use it unless you really need it, and you are really sure you need it.

### 34. Where can I discuss TypR or give feedback?

- [GitHub Discussions](https://github.com/we-data-ch/typr/discussions)
- [GitHub issues](https://github.com/we-data-ch/typr/issues)
- [Reddit r/rstats](https://www.reddit.com/r/rstats/)
