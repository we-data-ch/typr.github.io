# Operators & Precedence

This page covers all operators in TypR and their precedence rules.

<!-- truncate -->

## Precedence

Precedence from strongest (evaluated first) to weakest. Note that member access / pipe binds **more tightly** than arithmetic, unlike most languages.

| Rank | Operators | Role |
|------|-----------|------|
| 4 (strong) | `.` `\|>` `$` `::` `as!` `in` | member access / UFCS, pipe, validating cast |
| 3 | `*` `/` `%` `@` | multiplicative, matrix product |
| 2 | `+` `-` | additive |
| 1 (weak) | `== != < > <= >=`, `and/&&/&`, `or/\|\|/\|`, `%op%` | comparison, logical, custom operators |

---

## UFCS — `.` and `|>`

TypR supports the **Uniform Function Call Syntax**: `x.f(y)` is equivalent to `f(x, y)`.

```typr
x.f(y)            # ≡ f(x, y) — method-style call
x |> f() |> g()   # pipe — same desugaring
t.1                # positional tuple access (1-based index)
mod$member         # record field / module access — "::" is a historical alias for "$"
```

### Comparison with R

```typr
# TypR
data |> filter(x > 0) |> mean()
```
```r
# R
data |> filter(x > 0) |> mean()
# or with magrittr: data %>% filter(...) %>% mean()
```

---

## Validating cast

```typr
x as! Point                 # calls validate_Point(x) at runtime
xs as! [Any, int]           # cast to an inline structural type (not an alias)
```

---

## Ranges

```typr
1:10        # ≡ seq(1, 10, 1)
1:2:10      # ≡ seq(1, 10, 2) — step in the middle
```

---

## Removed operators

The following doubled operators were removed from the tokenizer: `++ -- ** // %% @@ .. $$ |>>`, as well as `@`/`@@`/`=` in infix position. None had typing/transpilation branches or a stdlib `` `op` `` signature to support them. A stray `//` (common C-style comment mistake) is now recognized by a dedicated parser and treated as a valid comment (see [Known Pitfalls](../concepts/known-pitfalls)).

---

## Arithmetic on types

```typr
type Combined <- A + B;      # Type::Operator on indices/dimensions
T if T1 in T2                 # conditional type (experimental refinement)
```
