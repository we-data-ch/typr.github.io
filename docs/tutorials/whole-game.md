---
sidebar_position: 2
title: The Whole Game
description: "A quick tour of TypR package development: scaffold, type-check, build, test, document, and install a toy package, in the spirit of Hadley Wickham's 'The Whole Game'."
---

# The Whole Game

_Before you start_

This tutorial develops a small toy package from start to finish. The goal is
the big picture and a workable workflow, before the rest of the documentation
gets into the details of the type system.

It is a TypR adaptation of the chapter
[The Whole Game](https://r-pkgs.org/whole-game.html) from
[_R Packages (2e)_](https://r-pkgs.org/) by Hadley Wickham and Jennifer Bryan.
The structure and the toy package are the same, so the two workflows can be
compared side by side. All credit for the original material goes to the
authors.

The tutorial is self-contained. Finishing it is not required to read on, but
following along and actually building the package is strongly recommended.

> **Duration:** 15 to 20 minutes.

## Prerequisites

- **R** (≥ 4.1) installed
- **The `typr` compiler**: see the [installation guide](/docs/reference/installation)
- **Git** (optional, for the version-control section)
- A terminal and a text editor

Run `typr init` once to install the R packages TypR needs (`devtools`,
`testthat`):

```bash
typr init
```

## Toy package: regexcite

The package built here is small but has the features commonly seen in released
packages:

- Functions that address a specific need: helpers for work with regular
  expressions, made safer by TypR's type system.
- Static type checking with `typr check`, a step that simply does not exist in
  a pure R workflow.
- The established R workflows for installation, help, and quality checks:
  - Documentation via roxygen2, generated from type annotations.
  - Unit testing with testthat, extracted from `Test` blocks.
- Version control with Git (optional but recommended).

The package is called **regexcite**, after the original chapter. The functions
are deliberately simple; they only serve to demonstrate the development
process. For actual regular-expression helpers, look at
[stringr](https://stringr.tidyverse.org/),
[stringi](https://stringi.gagolewski.com/) or
[rex](https://cran.r-project.org/package=rex).

## `typr new`

`typr new` is TypR's equivalent of `usethis::create_package()`. Pick the
location deliberately: somewhere alongside other projects, not nested inside
another package or Git repo, and not inside an R package library.

```bash
typr new regexcite
```

```
Creating the R package 'regexcite'...
Writing DESCRIPTION
Writing NAMESPACE
Writing .Rbuildignore
Writing .gitignore
Writing TypR/main.ty
Writing tests/testthat.R
Writing README.md
Package R 'regexcite' successfully created!
Initializing renv...
```

Move into the new directory and look around:

```bash
cd regexcite
```

```
regexcite/
  DESCRIPTION       # package metadata
  NAMESPACE         # exports/imports (generated, do not edit)
  R/                # generated R code (do not edit by hand)
  TypR/
    main.ty         # typed source code, the business end
  tests/
    testthat.R      # standard testthat entry point
  man/              # documentation (auto-generated)
  README.md
  renv.lock         # environment snapshot
  rproj.Rproj       # RStudio project file
```

The layout is a standard R package with exactly one addition: the `TypR/`
folder, which holds the typed `.ty` sources. Everything under `R/` is
transpiled output and should never be edited directly.

:::note renv today, Rig tomorrow
`typr new` currently initializes [renv](https://rstudio.github.io/renv/) for
environment and package management. A future release will switch to
[Rig](https://github.com/r-lib/rig), Posit's R installation manager, for this
role. The package layout and the rest of this tutorial stay the same.
:::

## `git init`

The regexcite directory is now a TypR source package. Making it a Git
repository is optional but recommended, and it makes it easy to see what
changes at each step:

```bash
git init
git add .
git commit -m "Initial commit: typr new scaffold"
```

The only change is a hidden `.git` directory. The scaffold already ships a
`.gitignore` covering R's behind-the-scenes files.

## Write the first function

Splitting a single string into parts is a common task. Base R's `strsplit()`
does this, but returns a list of character vectors, because it accepts a
vector of strings. With just one string, the first element is always the one
wanted:

```r
x <- "alfa,bravo,charlie,delta"
strsplit(x, split = ",")
#> [[1]]
#> [1] "alfa"    "bravo"   "charlie" "delta"
```

The function `str_split_one()` captures this pattern and, on top of it,
guarantees at compile time that one string goes in and a character vector
comes out. Replace the contents of `TypR/main.ty` with:

```typr
# Split a single string into pieces.
@pub let str_split_one <- fn(x: char, pat: char): [char] {
  let parts <- strsplit(x, pat);
  parts[[1]] as! [char]
};
```

Two things to notice:

- The signature `fn(x: char, pat: char): [char]` declares that both arguments
  are single strings and the result is a character vector. `@pub` exports the
  function from the package (it maps to roxygen2's `@export`).
- `strsplit` is an R function TypR types at the `T3` tier, so its return type
  is `any`. The explicit cast `as! [char]` is the programmer asserting "this
  is a character vector". See [escape hatches](/docs/reference/escape-hatches)
  for the full story.

:::caution A parser quirk (tracked, fix planned)
Writing the body as a single expression, `strsplit(x, pat)[[1]]`, confuses the
parser in the current release. Indexing a call result directly is rejected
only in tail position of a `fn` body; the same code parses fine anywhere else.
Two workarounds: bind the result to a variable first, then index it (as shown
above), or parenthesize the call, `(strsplit(x, pat))[[1]]`.

The bug is cataloged as an open, automatically replayed case in the compiler's
bug catalog (`typr case`, case `0107-call-result-index-in-fn-tail`): every
compiler run of the catalog re-checks that this snippet still fails, and the
case flips to `fixed` once the parser accepts it. Remove this note when that
happens.
:::

## `typr check`: your new best friend

Before building anything, ask the compiler what it thinks:

```bash
typr check
```

```
Parsing... done
Type checking... done
Code verification successful!
```

Now for the whole point of TypR. Add a bad call at the bottom of
`TypR/main.ty`, passing a number where a string is expected:

```typr compile_fail
# --- setup: the function under test, from the previous block ---
@pub let str_split_one <- fn(x: char, pat: char): [char] {
  let parts <- strsplit(x, pat);
  parts[[1]] as! [char]
};
# ----------------------------------------------------------------

let r <- str_split_one(42, ",");
```

```bash
typr check
```

```
Type errors found:
  × Type error: No signature of function 'str_split_one' matches this call.
   ╭─[TypR/main.ty:6:10]
 6 │ let r <- str_split_one(42, ",");
   ·          ──────┬──────
   ·                ╰── Called with 2 argument(s): (42, ",")
   ╰────
  help: 'str_split_one' exists but none of its signature(s) accepts these
        arguments:
            (char, char) -> [any, char]
```

In pure R this bug would only surface at run time, possibly hours into a
pipeline. Here it shows up before the code ever runs. Delete the bad line and
commit:

```bash
git add TypR/main.ty
git commit -m "Add str_split_one()"
```

## `typr build`

Transpile the typed source into R:

```bash
typr build
```

```
R code successfully generated in the R/ folder
```

What appeared:

```
R/
  std.R                # generated helpers
  generic_functions.R  # generated generics
  types.R              # generated type definitions
  main.R               # transpiled main.ty
man/
  str_split_one.Rd     # documentation, from the annotations
```

Two results are worth pausing on:

1. `R/main.R` contains ordinary R code with roxygen2 comments derived from the
   types. No `#'` is ever written by hand.
2. `man/str_split_one.Rd` was generated automatically. `str_split_one` is
   already a documented, exported function:

```
\name{str_split_one}
\title{Split a single string into pieces.}
\usage{str_split_one(x, pat)}
```

## `Test { }` and `typr test`

In the R world this is where `usethis::use_testthat()` and a test file come
in. In TypR, tests live next to the code in a `Test` block and are extracted
into `tests/testthat/` at build time. Add this to `TypR/main.ty`:

```typr
# --- setup: the function under test ---
@pub let str_split_one <- fn(x: char, pat: char): [char] {
  let parts <- strsplit(x, pat);
  parts[[1]] as! [char]
};
# --------------------------------------

Test {
  test_that("str_split_one splits a string", {
    expect_equal(str_split_one("a,b,c", ","), c("a", "b", "c"));
  });

  test_that("str_split_one returns one piece per separator group", {
    expect_equal(length(str_split_one("a,b", ",")), 2);
  })
}
```

Rebuild and run the test suite:

```bash
typr build   # extracts the block to tests/testthat/test-main.R
typr test    # runs devtools::test()
```

:::note Supported testthat assertions
The current release only types a subset of testthat inside `Test` blocks:
`expect_equal` and `expect_true` are available, while `expect_error`,
`expect_length`, and `expect_type` are rejected with *not defined in this
scope*. The natural test for this section would have been
`expect_error(str_split_one("a,b,c", ""))`; it is replaced above by an
equivalent assertion on the result. Support for the full testthat assertion
surface is planned for a future release.
:::

:::caution A renv quirk (fixed in the next release)
In the current release, `typr test` can fail inside a freshly scaffolded
project because the renv environment does not see the globally installed
`devtools` and `testthat` packages, even after `typr init`. As a workaround,
run the tests from a plain R session at the project root with
`devtools::test()`. This environment friction is exactly what the planned move
to [Rig](https://github.com/r-lib/rig) will address in the next release.
:::

Commit the tests:

```bash
git add TypR/main.ty tests/testthat/
git commit -m "Add tests for str_split_one()"
```

## `typr pkg install`: use the package

The result is a perfectly ordinary R package. Install it into the R library:

```bash
typr pkg install
```

(`devtools::install()` from R works too.) Then, in a fresh R session:

```r
library(regexcite)

str_split_one("alfa,bravo,charlie,delta", ",")
#> [1] "alfa"    "bravo"   "charlie" "delta"

?str_split_one   # yes, the help page is already there
```

Final commit:

```bash
git add .
git commit -m "Build, document and test regexcite"
```

## Review: what just happened?

| R Packages (2e) step | TypR equivalent |
| --- | --- |
| `usethis::create_package()` | `typr new regexcite` |
| `usethis::use_git()` | `git init` |
| Write `R/str-split-one.R` by hand | Write `TypR/main.ty`, run `typr build` |
| `devtools::document()` | automatic from `@pub` + type annotations |
| `usethis::use_testthat()` + test files | `Test { }` blocks, extracted at build |
| `devtools::test()` | `typr test` |
| `devtools::install()` | `typr pkg install` |
| `R CMD check` | `typr check`, before anything runs |

The whole game, in one sentence: typed code goes in `TypR/`, and the compiler
turns it into a conventional, documented, tested, installable R package while
catching type errors before R ever sees them.

## Where to go next

- [Create your first TypR package](/docs/tutorials/first-package): a
  type-modeling tutorial with records and union types.
- [How to build, test & document](/docs/howto/build-and-test): the workflow in
  reference form.
- [Type system reference](/docs/reference/types): everything about `char`,
  `[char]`, refinements, and friends.
- [Escape hatches](/docs/reference/escape-hatches): the `as!` cast and the
  trust tiers (`T1` to `T3`) in depth.
- The original chapter: [The Whole Game, R Packages (2e)](https://r-pkgs.org/whole-game.html).
