---
description: "Dropping out of TypR's type system to write raw R or JavaScript."
---

# Escape Hatches

This page covers the mechanisms for dropping out of TypR's type system to write raw R or JavaScript code.

<!-- truncate -->

## `extern` — typed R escape

```typr
extern (x: int, y: char) -> char r#"paste0(x, y)"#;   # raw R body, typed input/output
```

`extern` keeps a TypR-verified signature around an opaque R body. The compiler checks the types; the R code itself is emitted verbatim.

---

## Untyped R functions

```typr
let add <- function(x, y) { x + y };   # raw R function (RFunction), body captured as-is

add(3, 7)
```

Any `function(...)` expression is captured as an untyped R function — its body is never type-checked, but it is callable: TypR checks the call's arity against the parsed parameter list (here, `add(3, 7)` is accepted because `add` takes 2 parameters) and types the result `Any`. To use the result as a concrete type, cast it explicitly with `as!`.

---

## `R { }` blocks — raw R values

```typr
R {
  df |>
    dplyr::filter(x > 1) |>
    dplyr::mutate(z = y + 1)
}
```

`R { ... }` captures its body verbatim (balanced braces, like `function(...)`), and transpiles to a plain R block `{ ... }` — which already evaluates to the value of its last instruction, so no wrapper or call is emitted.

This is the preferred form for idiomatic R that is difficult to type (pipes `%>%`/`|>`, dplyr NSE, formulas `~`, etc.) when you just want a value without worrying about the type system.

---

## `JS { }` blocks

```typr noplayground
JS { /* ... */ }               # raw JavaScript block (JS target)
```

For targeting JavaScript output (when TypR compiles to JS).

---

## `Class(...)` — R class denotation

```typr noplayground
Class("data.frame", "tbl")    # denotes an existing R class (RClass)
```

Used to name existing R classes in the type system without constructing them.

---

## `@{ ... }@` — vectorial blocks

```typr
@{ 1 + x * 2 }@
```

Vectorial blocks are re-parsed as a sequence of TypR elements (literals, calls, variables) — **not** arbitrary R. This is different from `R { ... }`, which captures arbitrary R code.

---

## Comparison

| Form | Type-checked? | Use case |
|------|--------------|----------|
| `extern` | signature yes, body no | Typed interop with existing R functions |
| `function(...)` | arity only, result: `Any` | Untyped R functions |
| `R { }` | no | Idiomatic R values (pipes, NSE, formulas) |
| `JS { }` | no | JavaScript target |
| `@{ }@` | partially (TypR elements only) | Lightweight vectorial expressions |
| `Class(...)` | naming only | Referencing existing R classes |
