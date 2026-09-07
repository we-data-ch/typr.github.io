---
sidebar_position: 5
title: Use raw R blocks
---

# How to use raw R blocks in TypR

Not everything needs to be typed. TypR provides several escape hatches for
writing plain R code when the type system gets in the way.

## When to use raw R blocks

Use raw R when:

- You need idiomatic R that is hard to type (pipes `%>%`, NSE, formulas `~`)
- You are calling complex dplyr/tidyr pipelines
- You are working with R6/S4 objects and their methods
- You are prototyping and want to move fast

The goal is not to type everything — it is to type the parts where types help.

## `R {}` blocks — the primary escape hatch

```typr
let result <- R {
  mtcars |>
    dplyr::filter(cyl > 4) |>
    dplyr::mutate(efficiency = mpg / wt) |>
    dplyr::arrange(desc(efficiency))
};
```

`R {}` captures its body verbatim and emits it as a plain R block `{ ... }`.
It is the preferred form for idiomatic R that is difficult to type.

### Using return values

`R {}` blocks evaluate to the value of their last instruction, just like R
blocks:

```typr
let count <- R { length(x) };         # returns an integer
let names <- R { colnames(df) };      # returns a character vector
```

The return value flows into the surrounding typed code as `Foreign<Any>`.

### Calling typed functions from R blocks

You can call TypR functions from within `R {}` blocks — the transpiler resolves
the references:

```typr
let compute <- fn(x: int): int { x * 2 };

let result <- R {
  sapply(1:10, compute)
};
```

## `extern` — typed R functions

When you want type checking on the signature but have a plain R body:

```typr
extern (x: int, y: char) -> char r#"paste0(x, y)"#;
```

The compiler checks the types of `x` and `y` and the return type. The R code
itself is emitted verbatim. This is useful for small helpers where you want
the type safety but not the effort of writing typed TypR.

## `function()` — untyped R functions

Any `function(...)` expression in TypR is captured as an untyped R function:

```typr
let my_func <- function(x, y) {
  x + y
};
```

The body is not type-checked. This is useful for callbacks, callbacks to R
functions that expect plain functions, and quick prototypes.

## Comparison table

| Form | Type-checked? | Returns typed value? | Best for |
|------|--------------|---------------------|----------|
| `R {}` | No | `Foreign<Any>` | Idiomatic R pipelines, NSE |
| `extern` | Signature only | Yes | Small typed helpers with R bodies |
| `function()` | No | `RFunction` | Callbacks, prototypes |
| `@` signature | N/A | N/A | Typing existing R functions |

## Practical patterns

### Data transformation pipeline

```typr
let clean_data <- fn(df: Foreign<Any>): Foreign<Any> {
  R {
    df |>
      tidyr::drop_na() |>
      dplyr::mutate(across(where(is.character), trimws))
  }
};
```

### Configuration with R code

```typr
let theme <- R {
  ggplot2::theme_minimal() +
    ggplot2::theme(
      plot.title = ggplot2::element_text(size = 14, face = "bold"),
      axis.text = ggplot2::element_text(size = 10)
    )
};
```

### Prototype first, type later

```typr
# Quick prototype (untyped)
let analyze <- function(data) {
  summary(lm(mpg ~ wt, data = data))
};

# Later, add types
let analyze_typed <- fn(data: Foreign<Any>): Foreign<Any> {
  R { summary(lm(mpg ~ wt, data = data)) }
};
```

## Best practices

1. **Use `R {}` as the default escape** — It is the cleanest way to embed R
   code. Save `extern` for cases where you need the typed signature.

2. **Keep `R {}` blocks small** — Large `R {}` blocks defeat the purpose of
   using TypR. If a block grows beyond 10-15 lines, consider whether it should
   be a function in `R/`.

3. **Extract return types** — Even if the block is untyped, you can annotate
   the binding with a type if the return value is known:

   ```typr
   let count: int <- R { nrow(df) };
   ```

4. **Do not nest `R {}` blocks** — Keep them flat. If you need typed logic
   inside R code, call a TypR function from the R block.

## Where to go next

- [Escape Hatches](/docs/reference/escape-hatches) — full reference for all escape mechanisms
- [Use dplyr/tidyr from TypR](use-dplyr-tidyr) — tidyverse-specific patterns
- [Interop with R6/S4/RC](interop-r6-s4) — working with OOP objects
