---
sidebar_position: 2
title: Interop with R6/S4/RC
---

# How to interoperate with R6, S4, and Reference Classes

TypR does not replace R's OOP systems — it works alongside them. This guide
shows how to use R6, S4, and RC objects from TypR code.

## The key concept: `Foreign<T>`

R6, S4, and RC objects are opaque R values. TypR represents them with
`Foreign<Any>`, a type that passes through the compiler untouched — no field
access, no method calls, just values flowing through bindings and function
arguments.

```typr
type R6Person <- Foreign<Any>;
```

This is not a limitation. It is the design: TypR does not try to model R's
dynamic OOP systems inside its type checker. Instead, you wrap the OOP object
in `Foreign<Any>` and delegate operations to R code.

## Working with R6 objects

Suppose you have an R6 class in `R/Person.R`:

```r
Person <- R6::R6Class("Person",
  public = list(
    name = NULL,
    age = NULL,
    initialize = function(name, age) {
      self$name <- name
      self$age <- age
    },
    greet = function() {
      paste0("Hi, I'm ", self$name)
    }
  )
)
```

From TypR, declare the constructor and methods as signatures:

```typr noplayground
type R6Person <- Foreign<Any>;

@extern Person$new: (name: char, age: int) -> R6Person;

let p <- Person$new("Alice", 30);
```

For calling methods, use an `extern` escape hatch since method call syntax
(`$`) is not typed:

```typr
extern (p: R6Person) -> char r#"p$greet()"#;
```

The `r#"..."#` raw R string is emitted verbatim into the generated `.R` file.

## Working with S4 objects

S4 classes follow the same pattern — wrap the object in `Foreign<Any>` and use
`@extern` for the generic functions:

```typr
type S4Model <- Foreign<Any>;

@readRDS: (path: char) -> S4Model;
@extern stats::coef: (object: S4Model) -> Foreign<Any>;
@extern stats::summary: (object: S4Model) -> Foreign<Any>;

let m: S4Model <- readRDS("model.rds");
let s <- summary(m);
```

For creating S4 objects, use `@extern` with the constructor:

```typr
@extern methods::new: (Class: char, ...args: Any) -> Foreign<Any>;
```

## Working with Reference Classes (RC)

RC objects are handled identically to R6 — they are just R values:

```typr noplayground
type RCLogger <- Foreign<Any>;

@extern Logger$new: () -> RCLogger;

let log <- Logger$new();
```

## Using R `{}` blocks for complex OOP interactions

When you need to call multiple methods or access fields, `R {}` blocks are
often cleaner than chaining `extern` escape hatches:

```typr
let result <- R {
  person <- Person$new("Bob", 25)
  paste(person$name, "is", person$age)
};
```

This block is emitted as-is into the generated R code. It is not type-checked,
but it integrates seamlessly with the surrounding typed code.

## Best practices

1. **Wrap, do not rebuild** — Use `Foreign<Any>` for OOP objects. TypR is not
   meant to reimplement R's class systems.

2. **Signature the entry points** — Declare `@extern` for constructors and
   key methods. Leave internal field access to `R {}` blocks.

3. **Keep OOP code in R files** — If a class is complex, define it in `R/`
   and only call it from TypR via signatures. This is the cleanest interop.

4. **Prefer `R {}` for multi-step OOP** — When you need to create, configure,
   and call methods on an object in sequence, a raw R block is simpler than
   multiple `extern` escape hatches.

## Full example

```typr noplayground
# Type declarations
type R6Person <- Foreign<Any>;
@extern Person$new: (name: char, age: int) -> R6Person;

# Create and use
let p <- Person$new("Alice", 30);

# Multi-step interaction via R block
let greeting <- R {
  p$greet()
};
```

## Where to go next

- [Escape Hatches](/docs/reference/escape-hatches) — `extern`, `R {}`, `Foreign<T>`
- [Type existing R functions](type-r-functions) — `@` signatures for plain functions
- [Working with R and TypR](/docs/reference/r-typr) — full compatibility walkthrough
