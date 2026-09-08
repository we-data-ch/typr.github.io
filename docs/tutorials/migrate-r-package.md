---
sidebar_position: 2
title: Migrate an existing R package
---

# Migrate an existing R package to TypR

This tutorial shows how to add TypR to an R package you already have, one file
at a time. You do not need to rewrite anything — TypR works incrementally.

> **Duration:** 20–30 minutes.
>
> This is a tutorial. It teaches you by doing. For the full details, follow the
> links to the [reference](/docs/reference/intro).

## What you will learn

- How to add a `TypR/` folder to an existing package
- How to type one function at a time using `@` signatures
- How to convert R code to typed TypR and verify nothing broke
- How to mix typed and untyped code in the same package

## Prerequisites

- An existing R package (or create a sample one below)
- **R** (≥ 4.1) and **devtools**
- **The `typr` compiler** — see the [installation guide](/docs/reference/installation)

## Step 1: Create a sample package (skip if you have one)

If you do not have a package to migrate, create a minimal one:

```r
devtools::create("mypkg")
```

Add a function in `R/utils.R`:

```r
#' Normalize a numeric vector
#' @param x Numeric vector
#' @param center Logical, center the data
#' @param scale Logical, scale the data
#' @return Normalized numeric vector
#' @export
normalize <- function(x, center = TRUE, scale = TRUE) {
  x <- scale(x, center = center, scale = scale)
  as.vector(x)
}

#' Compute the mean of a vector
#' @param x Numeric vector
#' @return Numeric mean
#' @export
mean_val <- function(x) {
  mean(x, na.rm = TRUE)
}
```

Run `devtools::document()` and `devtools::test()` to make sure everything works
before you start.

## Step 2: Add the TypR folder

```bash
mkdir TypR
```

Create `TypR/main.ty` — the mandatory entry point:

```typr
# main.ty — typed code lives here
```

Run `typr build` to verify the toolchain works. The generated `R/` files will
be mostly empty at this stage.

## Step 3: Type one function with a signature

You do not have to rewrite the R code. A **signature** declares the types of
an existing R function, giving you compile-time checking without touching the
original code.

Add to `TypR/main.ty`:

```typr
@normalize: (x: [Any, num], center: bool, scale: bool) -> [Any, num];
```

The `@` prefix tells TypR this is a signature for an existing R function — no
body needed. The compiler will now check every call to `normalize` against
these types.

Run `typr build` again. The signature is type-checked but the generated R code
still calls your original `normalize` function. Nothing changed at runtime.

## Step 4: Add signatures for base R functions

As you write typed code, you will call base R functions. Declare their types
so the compiler can check your usage:

```typr
@normalize: (x: [Any, num], center: bool, scale: bool) -> [Any, num];
@mean_val: (x: [Any, num]) -> num;
@as__character: (Self) -> char;
@as__numeric: (Self) -> num;
@paste0: (...Any) -> char;
@toupper: (char) -> char;
@nchar: (char) -> int;
```

The `__` convention maps to `.` in R output: `as__character` becomes
`as.character`.

## Step 5: Write typed code that calls the signed functions

Now add a typed function that uses the signatures:

```typr noplayground
@normalize: (x: [Any, num], center: bool, scale: bool) -> [Any, num];
@mean_val: (x: [Any, num]) -> num;
@as__numeric: (Self) -> num;

let standardize_and_report <- fn(x: [Any, num]): char {
  let normalized <- normalize(x, true, true);
  let avg <- mean_val(normalized);
  paste("Mean after normalization:", as__character(avg))
};
```

The compiler checks that:

- `x` is a numeric vector
- `normalize` receives the right types
- `mean_val` receives a numeric vector
- `paste` returns a character string

If you pass a string to `normalize`, it fails at compile time — not at
runtime.

## Step 6: Convert R code to typed TypR (optional)

Once you are comfortable with signatures, you can convert R functions to full
TypR implementations. Move `normalize` from `R/utils.R` to `TypR/main.ty`:

```typr
@pub let normalize <- fn(x: [Any, num], center: bool, scale: bool): [Any, num] {
  R {
    x <- scale(x, center = center, scale = scale)
    as.vector(x)
  }
};
```

The `R {}` block preserves the original R logic. The function signature is
type-checked, but the body is emitted verbatim. This is the cleanest way to
migrate: typed signature + R body.

:::tip
You do not have to convert everything at once. Keep functions in `R/` and
add signatures in `.ty` files. Convert to full TypR only when you are ready.
:::

## Step 7: Test

Run your existing tests:

```r
devtools::test()
```

Everything should pass. The generated R code is functionally identical to what
you had before. TypR adds type checking on top — it does not change behavior.

## Step 8: Add inline tests (optional)

As you convert more functions, add `Test` blocks next to them:

```typr noplayground
@pub let normalize <- fn(x: [Any, num], center: bool, scale: bool): [Any, num] {
  R {
    x <- scale(x, center = center, scale = scale)
    as.vector(x)
  }
};

Test {
  test_that("normalize centers and scales", {
    let x <- c(1.0, 2.0, 3.0, 4.0, 5.0);
    let result <- normalize(x, true, true);
    expect_equal(mean_val(result), 0.0, tolerance = 1e-10);
  })
}
```

## Step 9: Document

Run `devtools::document()` to regenerate `man/` and `NAMESPACE`. The `@pub`
keyword generates `@export` directives, and type annotations become `@param`
and `@return` tags.

## The incremental migration strategy

Here is the recommended approach for migrating any R package:

1. **Add `TypR/`** to your existing package
2. **Sign the functions you call most** — add `@` signatures in `.ty` files
3. **Write new code in TypR** — use signatures for existing functions, write
   new logic in typed TypR
4. **Convert one function at a time** — move from `R/` to `TypR/` when ready
5. **Run `devtools::test()` after each step** — verify nothing broke
6. **Repeat** until you are satisfied with the coverage

TypR never forces an all-or-nothing choice. You can stop at any point and your
package works exactly as before.

## Where to go next

- [Create your first TypR package](first-package) — start from scratch
- [Model data with TypR types](typed-data-modeling) — records, unions, and
  dataframes
- [How-To: Type existing R functions](/docs/howto/type-r-functions) — the
  `@` signature reference
- [Reference: Compatibility with R](/docs/reference/r-typr) — the full
  interop walkthrough
