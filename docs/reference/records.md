# Records & Constructors

This page covers record types, constructors, spread operators, and named type embedding in TypR.

<!-- truncate -->

## Record literals and constructors

```typr
let p <- :{ x = 1, y = 2 };                 # anonymous record (requires type context)
let p <- Point:{ x = 1, y = 2 };             # explicit constructor → transpiles to Point(x=1, y=2)
let q <- Point:{ ...p, y = 9 };              # runtime spread: structural merge, override after
let r <- mod$Point:{ x = 1, y = 2 };          # constructor qualified by module path

let arr <- IntBox:[1, 2, 3];                  # ArrayConstructorCall
```

Equivalent record literal forms: `record{...}`, `object{...}`, `list{...}`, `:{...}` — the form is determined by the **shape** of the fields, not the keyword: named fields `name = value` produce a record (`Lang::List`), positional values produce a tuple (`Lang::Tuple`) even with `list{1, 2, 3}`.

---

## Spread — two distinct mechanisms

```typr noplayground
Point:{ ..source }     # "static" spread (nominal) — one per call
Point:{ ...source }    # "runtime" spread (structural) — one per constructor, several in a record literal
:{ ...a, ...b, z = 1 } # record literal: multiple runtime spreads allowed, merged in order then overridden
```

| Form | Name | Allowed in | Behavior |
|------|------|-----------|----------|
| `..source` | Static spread | Constructor call | Nominal; one per call |
| `...source` | Runtime spread | Constructor call or literal | Structural; merged in order |

---

## Named type embedding

```typr noplayground
type Widget <- list { embed coords: Position, label: char };
```

`embed` is a "soft" keyword — it is only recognized before `name: Type` with a trailing space, so a field actually named `embed` remains parsable.

---

## The `{...}` rule for generic types

A `{ ... }` block following a parameterized type name **always** makes it a record constructor:

```typr noplayground
Tibble[3]{ id: int, active: bool }   # record constructor
Tibble[3]                             # just a parameterized alias (no braces)
```

Two violations are caught explicitly:

```typr noplayground
Df[8, int]{ name: char }        # SyntaxError::RecordConstructorIndex
Array[5, { a: int }]             # SyntaxError::RecordInRecursiveParams
```
