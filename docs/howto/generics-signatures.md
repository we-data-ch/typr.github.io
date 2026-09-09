---
sidebar_position: 6
title: Declare S3/S4 generics
description: "Declare the types of R's S3 and S4 generic functions so TypR can check calls into R's object systems."
---

# How to declare S3 and S4 generics in TypR

TypR can declare the types of R's S3 and S4 generic functions, giving you
type safety when working with R's object-oriented systems.

## S3 generics

S3 is R's simplest OOP system — a generic function dispatches on the class of
its first argument. Declare S3 generics with `@` signatures:

```typr
@print: (x: Foreign<Any>) -> Empty;
@summary: (object: Foreign<Any>) -> Foreign<Any>;
@plot: (x: Foreign<Any>, ...args: Any) -> Empty;
@format: (x: Foreign<Any>, ...args: Any) -> char;
```

The `Foreign<Any>` type is used because S3 dispatch is dynamic — the actual
type is determined at runtime based on the class attribute.

### Typing your own S3 generics

If your package defines an S3 generic:

```r
# In R/my_generic.R
#' @export
my_generic <- function(x, ...) {
  UseMethod("my_generic")
}
```

Declare it in TypR:

```typr
@my_generic: (x: Foreign<Any>, ...args: Any) -> Foreign<Any>;
```

Then implement methods in `R/` as usual — TypR does not need to know about
the individual S3 methods.

## S4 generics

S4 generics are more structured. Use `@extern` to declare them:

```typr
@extern stats::coef: (object: Foreign<Any>) -> Foreign<Any>;
@extern stats::confint: (object: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern stats::fitted: (object: Foreign<Any>) -> Foreign<Any>;
@extern stats::residuals: (object: Foreign<Any>, ...args: Any) -> Foreign<Any>;
```

For your own S4 generics, declare them with `@extern` pointing to the package:

```typr
@extern mypackage::my_generic: (x: Foreign<Any>, ...args: Any) -> Foreign<Any>;
```

## Using generics in typed code

Once declared, generics work naturally in typed functions:

```typr
@summary: (object: Foreign<Any>) -> Foreign<Any>;
@plot: (x: Foreign<Any>, ...args: Any) -> Empty;

let analyze <- fn(model: Foreign<Any>): char {
  let s <- summary(model);
  R { capture.output(plot(model)) };
  "Analysis complete"
};
```

## The `Foreign<T>` wrapper

`Foreign<T>` is the idiomatic type for opaque R values. It wraps any R object
that passes through TypR untouched:

```typr
type LmModel <- Foreign<Any>;
type Ggplot <- Foreign<Any>;
type R6Object <- Foreign<Any>;
```

Key properties of `Foreign<T>`:

- Values pass through `let` bindings, function arguments, and return values
  without conversion
- `m.field` / `m$field` never type-checks (no structural access)
- You need a dedicated `@extern` accessor for each field or method

## Reference classes (RC)

RC generics are handled the same way as S3 — declare with `@` or `@extern`:

```typr noplayground
@Logger$log: (msg: char) -> Empty;
@Logger$get_entries: () -> Foreign<Any>;
```

## Practical pattern: typed model interface

```typr
type Model <- Foreign<Any>;

@extern stats::lm: (formula: char, data: Foreign<Any>) -> Model;
@extern stats::summary: (object: Model) -> Foreign<Any>;
@extern stats::coef: (object: Model) -> Foreign<Any>;
@extern stats::predict: (object: Model, newdata: Foreign<Any>) -> Foreign<Any>;

# an `@extern pkg::name` signature binds the *bare* name in TypR code
let fit_model <- fn(formula: char, data: Foreign<Any>): Model {
  lm(formula, data)
};

let get_coefficients <- fn(model: Model): Foreign<Any> {
  coef(model)
};
```

## Best practices

1. **Use `Foreign<Any>` for dispatch types** — S3/S4 dispatch is dynamic.
   Do not try to model the class hierarchy in TypR's type system.

2. **Declare signatures for generics you call** — Even partial type safety
   (checking the first argument) is better than none.

3. **Keep method implementations in R** — TypR is for typed logic, not for
   reimplementing OOP dispatch. Write methods in `R/`, declare generics in `.ty`.

4. **Use `@extern` for cross-package generics** — When calling generics from
   other packages (stats, ggplot2, etc.), `@extern` is the right tool.

## Where to go next

- [Interfaces & Structural Validation](/docs/reference/interfaces) — TypR's own structural polymorphism
- [Signatures, @extern & Foreign](/docs/reference/signatures) — full reference
- [Escape Hatches](/docs/reference/escape-hatches) — `R {}`, `extern`, `function()`
