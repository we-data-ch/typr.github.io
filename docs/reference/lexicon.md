---
description: "The fundamental tokens and literal types of TypR."
---

# Lexicon & Literals

This page covers the fundamental tokens and literal types in TypR.

<!-- truncate -->

## Semicolons

Every top-level instruction ends with `;`. The parser tolerates missing semicolons (emitting a `SyntaxError::ForgottenSemicolon` warning), except for the **last expression in a block**, which acts as an implicit return value — just like in R.

```typr
let x <- 42;        # explicit semicolon
let y <- 42         # tolerated, warning emitted
```

---

## Literals

| Literal | Syntax | Note |
|---------|--------|------|
| Integer | `42`, `-7` | `Lang::Integer` |
| Number | `3.14`, `-0.5` | a decimal point is **required** for `Number`; otherwise it's an `Integer` |
| String | `"text"` or `'text'` | single and double quotes are interchangeable; escapes: `\" \' \\ \n \t` |
| Boolean | `true` / `TRUE`, `false` / `FALSE` | both lowercase and uppercase forms accepted |
| Null | `null` / `NULL` | `Lang::Null` — distinct from `NA` |
| Missing | `na` / `NA` | `Lang::NA` — distinct from `null` |

### Literal types

Literals can also appear as **types** (singleton types): `3`, `3.14`, `true`, `"chat"` are valid types, more precise than `int`/`num`/`bool`/`char`.

---

## Identifiers

| Kind | Convention | Example | Enforcement |
|------|-----------|---------|-------------|
| Variable | `snake_case` | `my_var` | must start with `a-z` or `_` |
| Type | `PascalCase` | `MyType` | **required** for `type`/`opaque`/alias declarations |
| Quoted | backticks | `` `+` ``, `` `weird name` `` | useful for naming custom operators |

The parser explicitly rejects casing mistakes:

- `let PascalCase <- ...` triggers `LetInsteadOfType`
- `type snake_case <- ...` triggers `TypeInsteadOfLet`

---

## Comments

```typr
# This is a comment
```

Only `#` is recognized. There is **no** `//` syntax — a `.ty` file containing `//` will fail silently (see [Known Pitfalls](../concepts/known-pitfalls)).
