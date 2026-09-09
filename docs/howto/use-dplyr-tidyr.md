# Use dplyr/tidyr from TypR

> Call dplyr, tidyr, and the rest of the tidyverse from typed TypR code.

# How to use dplyr/tidyr from TypR

TypR does not require you to abandon the tidyverse. This guide shows how to
use dplyr, tidyr, and related packages from typed code.

## The core pattern: `R {}` blocks

Tidyverse functions rely heavily on non-standard evaluation (NSE), formulas,
and the pipe operator `%>%` / `|>`. These are fundamentally untyped constructs.
The idiomatic way to use them from TypR is `R {}` blocks:

```typr
let filtered <- R {
  mtcars |>
    dplyr::filter(cyl > 4) |>
    dplyr::select(mpg, cyl, hp)
};
```

The `R {}` block captures its body verbatim and emits it as plain R code. It
is not type-checked, but it integrates perfectly with typed code that surrounds
it.

## Declaring tidyverse signatures

For typed interop with dplyr, use `@extern` to declare the types of functions
you want to call with type safety:

```typr
@extern dplyr::filter: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::mutate: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::select: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::summarise: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::arrange: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
```

With these declarations, `dplyr::filter(df, .data$x > 1)` is partially checked —
the compiler verifies the first argument is a dataframe, but the variadic
`...args: Any` tail is intentionally untyped to allow NSE.

## Mixing typed and untyped code

The best pattern is to do data preparation in `R {}` blocks and business
logic in typed functions:

```typr
@extern dplyr::filter: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::mutate: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;

# Typed business logic
let compute_score <- fn(row: Foreign<Any>): num {
  R { row$age * 0.3 + row$income * 0.7 }
};

# Untyped data preparation
let prepare <- fn(df: Foreign<Any>): Foreign<Any> {
  R {
    df |>
      dplyr::filter(!is.na(age)) |>
      dplyr::mutate(score = compute_score(.))
  }
};
```

## Using `@importFrom`

To generate proper roxygen2 import directives, use `@importFrom`:

```typr
@importFrom dplyr filter select mutate arrange summarise;
@importFrom tidyr pivot_longer pivot_wider;
@importFrom purrr map map_dbl;
```

This ensures your package's `NAMESPACE` file is correctly populated when the
package is built.

## Working with dataframes in TypR

TypR supports dataframe types for typed access:

```typr
type PersonRow <- df[1]{ name: char, age: int };

# a dataframe column is a vector, so `df$name` is `[1, char]`, not `char`
let process <- fn(df: PersonRow): [1, char] {
  df$name
};
```

However, for most tidyverse workflows, `Foreign<Any>` with `R {}` blocks is
more practical because tidyverse functions return generic tibbles, not
specific dataframe types.

## Practical patterns

### Typed wrapper around dplyr

```typr
@extern dplyr::group_by: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;
@extern dplyr::summarise: (data: Foreign<Any>, ...args: Any) -> Foreign<Any>;

let summarize_by_group <- fn(
  df: Foreign<Any>,
  group_col: char
): Foreign<Any> {
  R {
    df |>
      dplyr::group_by(.data[[group_col]]) |>
      dplyr::summarise(n = dplyr::n())
  }
};
```

### Type-safe column access

```typr
@extern dplyr::pull: (data: Foreign<Any>, var: char) -> Foreign<Any>;

let get_column <- fn(df: Foreign<Any>, col: char): Foreign<Any> {
  pull(df, col)
};
```

## Best practices

1. **Use `R {}` for NSE** — Tidyverse NSE (bare column names, formulas, `...`)
   cannot be type-checked. Embrace `R {}` blocks for these operations.

2. **Signature the entry points** — Add `@extern` for dplyr/tidyr functions
   you call frequently. This gives you partial type safety on the first argument.

3. **Use `@importFrom`** — Generate proper namespace imports for your package.
   This is required for CRAN and good practice for any R package.

4. **Keep business logic typed** — Do data transformation in `R {}` blocks, but
   write the core logic of your package in typed TypR functions.

5. **Return `Foreign<Any>`** — Tidyverse functions return tibbles, which are
   opaque R objects. Do not try to type them as specific dataframe types unless
   you know the exact schema.

## Where to go next

- [Escape Hatches](/docs/reference/escape-hatches) — `R {}` blocks, `extern`, `function()`
- [Type existing R functions](type-r-functions) — `@` signatures for plain functions
- [Compatibility with R](/docs/reference/r-typr) — full interop walkthrough
