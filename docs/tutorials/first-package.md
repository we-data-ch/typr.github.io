---
sidebar_position: 1
title: Create your first TypR package
---

# Create your first TypR package

This tutorial walks you through creating a complete R package with TypR — from
an empty folder to an installable package with types, tests, and documentation.

> **Duration:** 15–20 minutes.
>
> This is a tutorial. It teaches you by doing. For the full details on every
> construct used here, follow the links to the [reference](/docs/reference/intro).

## What you will build

A small package called `tempscale` that converts temperatures between Celsius,
Fahrenheit, and Kelvin. By the end you will have:

- A `TypR/` folder with typed source code
- Generated R code in `R/`
- Inline tests extracted into testthat
- Roxygen2 documentation from type annotations
- A package that installs and checks cleanly

## Prerequisites

- **R** (≥ 4.1) and **devtools** installed
- **The `typr` compiler** — see the [installation guide](/docs/reference/installation)
- A terminal and a text editor

## Step 1: Scaffold the package

Create a new directory and initialize a minimal R package:

```bash
mkdir tempscale
cd tempscale
Rscript -e 'devtools::create(".")'
```

This gives you `DESCRIPTION`, `NAMESPACE`, and an `R/` folder. Now add the
TypR folder:

```bash
mkdir TypR
```

Your package should look like this:

```
tempscale/
  DESCRIPTION
  NAMESPACE
  R/            # generated code will go here
  TypR/         # your typed source code
```

## Step 2: Write typed source code

Create `TypR/main.ty` with a type definition, a constructor, and two functions:

```typr
# main.ty — entry point of the package

type Unit <- .Celsius | .Fahrenheit | .Kelvin;

type Temp <- list {
  value: num,
  unit: Unit
};

let new_temp <- fn(value: num, unit: Unit): Temp {
  Temp:{ value = value, unit = unit }
};

let to_celsius <- fn(t: Temp): num {
  let unit <- t$unit;
  match unit {
    .Celsius    => t$value,
    .Fahrenheit => (t$value - 32.0) * 5.0 / 9.0,
    .Kelvin     => t$value - 273.15
  }
};

@pub let to_fahrenheit <- fn(t: Temp): num {
  to_celsius(t) * 9.0 / 5.0 + 32.0
};

let fahrenheit: Unit <- .Fahrenheit;
let boiling <- new_temp(212.0, fahrenheit);
print(to_celsius(boiling));
```

A few things to notice:

- `Temp` is a **record type** — a named structure with typed fields.
- `Unit` is a **tagged union** — `match` on it is checked for exhaustiveness.
- `@pub` marks `to_fahrenheit` as **public** — it will be exported in the
  generated NAMESPACE.
- `new_temp` and `to_celsius` are package-internal by default.

## Step 3: Add inline tests

Add a `Test` block at the bottom of `TypR/main.ty`:

```typr
# --- setup, from step 2 ---
type Unit <- .Celsius | .Fahrenheit | .Kelvin;
type Temp <- list { value: num, unit: Unit };
let new_temp <- fn(value: num, unit: Unit): Temp { Temp:{ value = value, unit = unit } };
let to_celsius <- fn(t: Temp): num {
  let unit <- t$unit;
  match unit {
    .Celsius    => t$value,
    .Fahrenheit => (t$value - 32.0) * 5.0 / 9.0,
    .Kelvin     => t$value - 273.15
  }
};
@pub let to_fahrenheit <- fn(t: Temp): num { to_celsius(t) * 9.0 / 5.0 + 32.0 };
# --------------------------

Test {
  test_that("to_celsius converts Fahrenheit", {
    let fahrenheit: Unit <- .Fahrenheit;
    let f <- new_temp(212.0, fahrenheit);
    expect_equal(to_celsius(f), 100.0);
  });

  test_that("to_celsius converts Kelvin", {
    let kelvin: Unit <- .Kelvin;
    let k <- new_temp(373.15, kelvin);
    expect_equal(to_celsius(k), 100.0);
  });

  test_that("to_fahrenheit converts Celsius", {
    let celsius: Unit <- .Celsius;
    let c <- new_temp(100.0, celsius);
    expect_equal(to_fahrenheit(c), 212.0);
  })
}
```

During transpilation, this block is extracted into a standard
`tests/testthat/test-main.R` file. To R, devtools, and testthat, it is just
regular test code.

## Step 4: Build

Run the compiler from the package root:

```bash
typr build
```

TypR transpiles `TypR/main.ty` into `R/` files:

```
R/
  a_std.R                # generated helpers
  b_generic_functions.R  # generated helpers
  c_types.R              # generated type definitions (Temp, new_temp, ...)
  d_main.R               # transpiled main.ty
```

The naming convention (`a_`, `b_`, `c_`, `d_`) ensures correct load order.

## Step 5: Test

Run the tests as you would for any R package:

```r
devtools::test()
```

You should see all three tests pass. The test code was generated from the
`Test` block — you never had to write `tests/testthat/` by hand.

## Step 6: Document

The `@pub` keyword on `to_fahrenheit` generates a roxygen2 `@export` directive.
Type annotations are turned into `@param` and `@return` tags. Run:

```r
devtools::document()
```

This populates `man/` with `.Rd` files and updates `NAMESPACE`.

## Step 7: Install and check

```r
devtools::install()
devtools::check()
```

The package installs and passes `R CMD check`. CRAN, pkgdown, and
`devtools::check()` all see regular R code — TypR is invisible at this stage.

## Where you are now

You have built a complete R package using TypR:

- **Types** — `Temp` is a record type with named, typed fields.
- **Pattern matching** — `match` on a tagged union replaces if/else chains.
- **Tests** — inline `Test` blocks that extract into testthat.
- **Documentation** — `@pub` generates roxygen2 exports.
- **Standard R** — the generated code is plain R that any R tool understands.

## Where to go next

- [Migrate an existing R package](migrate-r-package) — add TypR to a package
  you already have
- [Model data with TypR types](typed-data-modeling) — records, unions, and
  dataframes in depth
- [How-To: Build, test & document](/docs/howto/build-and-test) — the full
  development workflow
- [Reference: Records & Constructors](/docs/reference/records) — construction,
  spread, and named embedding
