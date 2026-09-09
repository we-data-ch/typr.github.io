---
sidebar_position: 4
title: Build, test & document
description: "The full development workflow of a TypR package: building, testing, and documenting it."
---

# How to build, test, and document a TypR package

A TypR package is a normal R package with one extra folder. This guide covers
the full development workflow: building, testing, and documenting.

## Package structure

A TypR package follows standard R package conventions:

```
mypackage/
  DESCRIPTION
  NAMESPACE
  R/            # generated R code (do not edit by hand)
  TypR/         # your typed source code
    main.ty     # entry point (mandatory)
    utils.ty    # additional modules
  man/          # documentation (auto-generated)
  tests/        # testthat tests
  mypackage.Rproj
```

The `TypR/` folder is the only addition. Everything else, `DESCRIPTION`,
`NAMESPACE`, `R/`, `man/`, `tests/`, is standard R.

## Step 1: Build the package

Write your typed code in `TypR/main.ty`:

```typr
# a signature types the base-R `paste` so the call below is checked
@paste: (...values: Any) -> char;

type Person <- list {
  name: char,
  age: int
};

let new_person <- fn(name: char, age: int): Person {
  list(name = name, age = age)
};

let greet <- fn(p: Person): char {
  paste("Hello,", p$name)
};

print(greet(new_person("Alice", 25)));
```

Run the build from the package root:

```bash
typr build
```

This transpiles every `.ty` file in `TypR/` into R code in `R/`:

```
R/
  a_std.R                # generated helpers
  b_generic_functions.R  # generated helpers
  c_types.R              # generated type definitions
  d_main.R               # transpiled main.ty
```

The naming convention (`a_`, `b_`, `c_`, `d_`) ensures correct load order.

## Step 2: Test with testthat

TypR has a built-in `Test` block that extracts into standard testthat files
during transpilation:

```typr
# --- setup, from step 1 ---
@paste: (...values: Any) -> char;
type Person <- list { name: char, age: int };
let new_person <- fn(name: char, age: int): Person { list(name = name, age = age) };
let greet <- fn(p: Person): char { paste("Hello,", p$name) };
# --------------------------

Test {
  test_that("new_person creates a valid person", {
    let p <- new_person("Alice", 25);
    expect_equal(p$name, "Alice");
    expect_equal(p$age, 25);
  });

  test_that("greet returns a greeting string", {
    let p <- new_person("Bob", 30);
    expect_equal(greet(p), "Hello, Bob");
  })
}
```

Run tests as you would for any R package:

```r
devtools::test()
# or
testthat::test_local()
```

:::tip
Place `Test` blocks directly after the functions they test. This keeps
logic and tests side by side and the transpiler extracts them into
`tests/testthat/` automatically.
:::

## Step 3: Document with roxygen2

TypR generates roxygen2-compatible comments from your type annotations. The
transpiler infers `@param`, `@return`, and `@export` directives from the
function signatures:

```typr
# --- setup, from step 1 ---
@paste: (...values: Any) -> char;
type Person <- list { name: char, age: int };
# --------------------------

@pub let greet <- fn(p: Person): char {
  paste("Hello,", p$name)
};
```

The `@pub` keyword generates an `@export` directive. After transpilation,
run:

```r
devtools::document()
```

This populates `man/` with `.Rd` files and updates `NAMESPACE`.

## Step 4: Install and check

```r
devtools::install()
devtools::check()
```

The package installs and checks like any standard R package. CRAN, R CMD check, and pkgdown all see regular R code, TypR is invisible at this stage.

## Step 5: Use modules for clean organization

As your package grows, split code into one file per type or concept:

```typr noplayground
# main.ty
mod person;
mod utils;
```

TypR resolves `mod person` to `TypR/person.ty` and generates `R/person.R`.
This keeps the codebase modular without any extra configuration.

See [Modules & Imports](/docs/reference/modules) for the full module system.

## Incremental migration

You do not have to convert an entire R package at once. The recommended
approach:

1. Add a `TypR/` folder to your existing package
2. Move one function at a time from `R/` to `TypR/`
3. Run `typr build` to regenerate the R code
4. Run `devtools::test()` to verify nothing broke
5. Repeat

TypR never forces an all-or-nothing choice.

## Common build issues

| Problem | Solution |
|---------|----------|
| `main.ty` not found | Ensure `TypR/main.ty` exists (mandatory entry point) |
| Collision with `R/` file | TypR overwrites `R/<name>.R` when `TypR/<name>.ty` exists. Do not edit generated files by hand. |
| Missing type errors | Run `typr build` and the compiler reports type errors before generating R code |
| `@importFrom` not in NAMESPACE | Run `devtools::document()` after `typr build` |

## Where to go next

- [Compatibility with R](/docs/reference/r-typr) — full package walkthrough
- [Type existing R functions](type-r-functions) — adding `@` signatures
- [Modules & Imports](/docs/reference/modules) — organizing code into modules
