---
description: "Defining new types with type, opaque, and typeconstructor."
---

# Type Constructors & Aliases

This page explains how to define new types in TypR using `type`, `opaque`, and `typeconstructor`.

<!-- truncate -->

## Transparent aliases (`type`)

A `type` alias creates a **transparent** name for an existing type. The alias and its underlying type are fully interchangeable:

```typr
type Meters <- int;
type Person <- list { name: char, age: int };

# These are equivalent
let d: Meters <- 42;
let d: int <- 42;
```

Transparent aliases are useful for **documentation** and **clarity** — they give semantic meaning to raw types without changing behavior.

---

## Opaque aliases (`opaque`)

An `opaque` alias **hides** the underlying type from external code. This provides stronger encapsulation:

Inside the module that defines it, the underlying type is still visible:

```typr
module Distance {
    @pub opaque Meters <- int;
    @pub let make <- fn(v: int): Meters { v };
};
```

Outside, the boundary holds:

```typr compile_fail
# --- setup: the module above ---
module Distance {
    @pub opaque Meters <- int;
    @pub let make <- fn(v: int): Meters { v };
};

let d <- Distance$make(42);
let n: int <- d;   # the opaque type does not convert back on its own
```

Opaque types enforce a boundary: code outside the module where the alias is defined cannot freely mix the opaque type with its underlying type. This prevents accidental misuse of domain-specific values.

---

## Generic type definitions

Both `type` and `opaque` support generic parameters using angle brackets `<T>`:

```typr
type Option<T> <- .Some(T) | .None;
opaque Factor<L> <- int;
```

:::note
Generic parameters use `<T>` (angle brackets), not `[T]` (square brackets). Square brackets are reserved for array dimensions and index generics.
:::

### Phantom parameters

A **phantom parameter** appears in the type definition but not in its body. It exists only for type-level tracking:

```typr
opaque Factor<L> <- int;   # L never appears in the right-hand side
```

Phantom parameters are useful when you need to distinguish between values that have the same runtime representation but different semantic meanings. The constraint is enforced at compile time through [signatures](../reference/signatures.md).

---

## Typeconstructors

The `typeconstructor` keyword registers a **generic record constructor** that can be used with the `TypeName[N]{ ... }` syntax:

```typr
typeconstructor Tibble[N] record;
typeconstructor Matrix[N, M, T] recursive;
```

Once registered, you can create parameterized records:

```typr noplayground
Tibble[3]{ id: int, active: bool }   # record constructor with 3 columns
Tibble[8]{ name: char, score: num }  # record constructor with 8 columns
```

### How typeconstructors differ from type aliases

| Feature | `type` / `opaque` | `typeconstructor` |
|---------|-------------------|-------------------|
| Purpose | Name an existing type | Register a generic record constructor |
| Parameters | `<T>` for type parameters | `[N]` for dimension/label parameters |
| Result | A type alias | A constructor that creates records |
| Usage | `let x: MyType <- ...` | `MyType[N]{ field: T }` |

See [Records & Constructors](../reference/records.md) for how constructor calls work with spread operators and named embedding.

---

## The `{...}` rule

A `{ ... }` block following a parameterized type name **always** makes it a record constructor:

```typr noplayground
Tibble[3]{ id: int, active: bool }   # record constructor
Tibble[3]                             # just a parameterized alias (no braces)
```

This distinction is important — the presence or absence of braces changes the semantics entirely.

---

## Relationships with other features

Type constructors and aliases interact with several other TypR features:

- **[Generics & Kind Sigils](generics-kind.md)** — Generic parameters (`<T>`) and kind sigils (`#N`, `%R`, etc.) work together to constrain type parameters
- **[Signatures](../reference/signatures.md)** — `@extern` and `@signature` use type aliases to declare external function types
- **[Foreign values](../reference/signatures.md#foreign--opaque-external-r-values)** — `opaque Foreign<T>` is the idiomatic way to wrap external R values

---

## Summary

| Keyword | Purpose | Generic syntax | Example |
|---------|---------|----------------|---------|
| `type` | Transparent alias | `<T>` | `type Meters <- int` |
| `opaque` | Opaque alias | `<T>` | `opaque Meters <- int` |
| `typeconstructor` | Generic record constructor | `[N]` | `typeconstructor Tibble[N] record` |
