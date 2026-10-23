---
description: "Record types, constructors, the spread operator, and named type embedding."
---

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

```typr
# --- setup ---
type Point <- list { x: int, y: int };
type Tag <- list { z: int };
let source <- Point:{ x = 1, y = 2 };
let a <- source;
let b <- Tag:{ z = 3 };
# -------------

Point:{ ..source };     # "static" spread (nominal) — one per call
Point:{ ...source };    # "runtime" spread (structural) — one per constructor, several in a record literal
:{ ...a, ...b, z = 1 }; # record literal: multiple runtime spreads allowed, merged in order then overridden
```

| Form | Name | Allowed in | Behavior |
|------|------|-----------|----------|
| `..source` | Static spread | Constructor call | Nominal; one per call |
| `...source` | Runtime spread | Constructor call or literal | Structural; merged in order |

---

## Named type embedding

```typr
# --- setup ---
type Position <- list { x: int, y: int };
# -------------

type Widget <- list { embed coords: Position, label: char };
```

`embed` is a "soft" keyword — it is only recognized before `name: Type` with a trailing space, so a field actually named `embed` remains parsable.

Embedding is TypR's mechanism for **behavioral composition**: a type that embeds another one
automatically gets the functions defined on it. There is no inheritance, no class and no `impl`
block, and nothing is mutated.

### Forwarding

Every function whose first parameter is `self: B` and which returns a `B` becomes available on
any type `A` that embeds `B`. Calling it on an `A` forwards to the embedded field, then rebuilds
the `A` around the result:

```typr
type Position <- list { x: int, y: int };

let move <- fn(self: Position, dx: int, dy: int): Position {
    Position:{ x = self$x + dx, y = self$y + dy }
};

type Player <- list { embed coords: Position, name: char };

let p <- Player:{ coords = Position:{ x = 1, y = 2 }, name = "ada" };
let q <- move(p, 1, 1);    # q is a Player, with coords moved
```

Conceptually, TypR generates this function for you:

```typr noplayground
let move <- fn(self: Player, dx: int, dy: int): Player {
    Player:{ coords = move(self$coords, dx, dy), ...self }
};
```

The rebuild is purely functional: a new record is constructed with `Player:{ ... }`, the other
fields are carried over through the runtime spread `...self`, and the embedded field is
explicitly rewritten with the forwarded result (an explicit field always wins over a spread).

:::note
A type named `Character` collides with the cast function `as.Character` of the builtin `char`
type. Pick another name for your own types (`Player`, `Hero`, …).
:::

### What can be embedded

The embedded type must be structurally a **record** (`list { ... }`, or an alias that resolves to
one). Numbers, literal types, functions and non-record unions are rejected:

```typr compile_fail
type Bad <- list { embed n: int };
```

A record may contain several `embed` fields:

```typr
type Position <- list { x: int, y: int };
type Stats <- list { hp: int };

type Player <- list { embed coords: Position, embed stats: Stats };
```

### Collisions are errors

TypR never shadows implicitly. If the same function would be provided twice, you must resolve
the conflict yourself.

Two embeddings providing the same function name:

```typr compile_fail
type Position <- list { x: int, y: int };
type Stats <- list { hp: int };
let move <- fn(self: Position, dx: int): Position { self };
let move <- fn(self: Stats, dx: int): Stats { self };

type Player <- list { embed coords: Position, embed stats: Stats };
```

An explicit function defined on the embedding type that clashes with an inherited one:

```typr compile_fail
type Position <- list { x: int, y: int };
let move <- fn(self: Position, dx: int): Position { self };

type Player <- list { embed coords: Position, name: char };
let move <- fn(self: Player, dx: int): Player { self };
```

Rename or remove one of the conflicting functions or fields.

### Current limits

- **Monomorphic embedded types only.** Only functions defined directly on `B` are forwarded; a
  generic function (`fn id(x: T): T`) is not instantiated for `B`, and `Vec2<#N>`-style generic
  embedded types are not supported yet.
- **Direct embedding only.** Collision detection and combined forwarding work for `embed` fields
  declared in the same `list { ... }`. If records are combined with the intersection `&`, the
  `embed` flag is not preserved by the field merge.
- **No variadic forwarding.** A function of `B` with a variadic parameter (`...xs: T`) is silently
  not forwarded.
- **Refined types** (predicates such as `(. > 0)`) do not exist in TypR yet, so they cannot be
  embedded.
- **Declaration order.** A type must be declared before any function that mentions it, so a
  clash is only detected when the explicit function is written *after* the embedding type.

---

## The `{...}` rule for generic types

A `{ ... }` block following a parameterized type name **always** makes it a record constructor:

```typr noplayground
Tibble[3]{ id: int, active: bool }   # record constructor
Tibble[3]                             # just a parameterized alias (no braces)
```

Two violations are caught explicitly:

```typr compile_fail
Df[8, int]{ name: char }        # SyntaxError::RecordConstructorIndex
Array[5, { a: int }]             # SyntaxError::RecordInRecursiveParams
```
