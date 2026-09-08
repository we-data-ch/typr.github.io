---
sidebar_position: 1
title: Type existing R functions
---

# How to type existing R functions with `@` signatures

This guide shows how to add type safety to R functions you already have — base R,
your own helpers, or third-party packages — without rewriting them.

## Why use signatures?

By default, untyped R functions accept `Any` and return `Empty`. The compiler
cannot check their usage, so mistakes slip through to runtime. A signature
declares the types an R function expects and returns, giving you compile-time
checking without touching the original R code.

## Basic signature

Suppose you have an R function in `R/utils.R`:

```r
normalize <- function(x, center = TRUE, scale = TRUE) {
  x <- scale(x, center = center, scale = scale)
  as.vector(x)
}
```

Declare its type in a `.ty` file:

```typr
@normalize: (x: [Any, num], center: bool, scale: bool) -> [Any, num];
```

The `@` prefix tells TypR this is a signature for an existing R function — no
body needed. The compiler will now check every call to `normalize` against these
types.

## Working with base R

Base R functions benefit immediately from signatures. The `__` convention maps
to `.` in R output:

```typr
@toupper: (char) -> char;
@nchar: (char) -> int;
@paste0: (...Any) -> char;
@as__character: (Self) -> char;
@as__numeric: (Self) -> num;
```

Now `toupper("Hi")` is type-checked as `char -> char`, and `toupper(7)` would
fail at compile time instead of producing a silent coercion at runtime.

## Signatures with overloading

Some R functions accept multiple input types. Repeat the signature with
different type parameters:

```typr
@abs: (int) -> int;
@abs: (num) -> num;
@sqrt: (int) -> num;
@sqrt: (num) -> num;
```

The compiler picks the right overload based on the argument type.

## Using `@extern` for external packages

When calling functions from other packages, use `@extern` to declare both the
package and the type:

```typr
@extern stats::sd: (x: [Any, num]) -> num;
@extern stats::lm: (formula: char, data: Foreign<Any>) -> Foreign<Any>;
@extern base::readRDS: (path: char) -> Foreign<Any>;
@importFrom dplyr filter select mutate;
```

- `@extern` generates a `package::function` call at runtime
- `@importFrom` generates a roxygen2 `@importFrom` directive
- `Foreign<Any>` wraps opaque R values that pass through TypR untouched

## Practical example: typing a dplyr pipe

Say you call `dplyr::filter` on a dataframe. You can declare its signature and
use it in typed code:

```typr
@extern dplyr::filter: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;

let filter_adults <- fn(df: Foreign<Any>): Foreign<Any> {
  # the NSE argument stays inside an R block; the call itself is typed
  R { dplyr::filter(df, .data$age >= 18) }
};
```

## Step-by-step workflow

1. **Identify** the R function you want to type
2. **Determine** the input types and return type
3. **Write** a `@` signature in a `.ty` file
4. **Run** `typr build` — the compiler checks your usage
5. **Fix** any type errors that surface

:::tip
Start with the functions you call most often. You do not have to sign everything
at once — add signatures incrementally as you find value in the type checking.
:::

## Where to go next

- [Signatures, @extern & Foreign](/docs/reference/signatures) — full reference
- [Escape Hatches](/docs/reference/escape-hatches) — `extern`, `R {}`, `function()`
- [Use dplyr/tidyr from TypR](use-dplyr-tidyr) — tidyverse interop patterns
