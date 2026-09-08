# Generics & Kind Sigils

This page explains the generic type parameters and kind sigils that power TypR's type system.

<!-- truncate -->

## Free generics

A **free generic** is a type parameter that can stand for any type. It is declared with an uppercase letter:

```typr
let id <- fn(x: T): T { x };         # T is a free generic
let pair <- fn(a: T, b: U): Tuple[T, U] { :{a, b} };
```

Free generics have **no constraints** — any type can be substituted. They are the simplest form of polymorphism in TypR.

---

## Kind sigils

Kind sigils are prefix characters that **constrain** what a generic parameter can represent. They encode structural intent directly in the type signature:

| Sigil | Name | Constraint | Example |
|-------|------|-----------|---------|
| `#N` | Index | Dimension of an array | `[#N, int]` |
| `$T` | Label | Name of a field | `$T` |
| `%R` | Record | Must be a Record | `%R` |
| `@I` | Interface | Must be an Interface | `@I` |
| `^S` | String | Must be `char` | `^S` |
| `?B` | Boolean | Must be `bool` | `?B` |

### Index generics (`#N`)

The `#N` sigil represents a **dimension** — the size or index of an array. It is used when you need to track or enforce array lengths at the type level:

```typr noplayground
let head <- fn(v: [#1, T]): T { v[0] };

# Here #N is inferred as 3
let arr <- [1, 2, 3];
let first <- head(arr);   # type-checks: #1 matches the first element
```

Index generics appear prominently in array and dataframe types:

```typr noplayground
type Vector <- [#N, int];        # vector of ints, length N
df[N]{ name: char, age: int }    # dataframe with N columns
```

See [Types](../reference/types.md) for more on array and vector syntax.

### Label generics (`$T`)

The `$T` sigil represents a **field name** — a compile-time string literal used as a record key:

```typr noplayground
# $T constrains the generic to a field label
let get_field <- fn(r: %R, key: $T): Any { r[key] };
```

Label generics are primarily used internally by the compiler to enforce named field access on records.

### Record generics (`%R`)

The `%R` sigil constrains a generic to **any record type**:

```typr
let fields_of <- fn(r: %R): char { "record" };

let p <- :{ x = 1, y = 2 };
fields_of(p);   # OK — p is a record
```

This is useful when a function needs to operate on any record without caring about its specific fields.

### Interface generics (`@I`)

The `@I` sigil constrains a generic to **any interface type**:

```typr noplayground
type Movable <- interface { mv: (Self, int, int) -> Self };

let move_all <- fn(items: [@I, T], dx: int, dy: int): [@I, T] {
    # T must be an interface implementor
    /* ... */
};
```

See [Interfaces & Structural Validation](../reference/interfaces.md) for how interfaces work.

### String generics (`^S`)

The `^S` sigil constrains a generic to the `char` type (strings):

```typr noplayground
let repeat <- fn(s: ^S, n: int): ^S { /* ... */ };
```

### Boolean generics (`?B`)

The `?B` sigil constrains a generic to the `bool` type:

```typr noplayground
let guard <- fn(condition: ?B, value: T): T { /* ... */ };
```

---

## Combining generics

Generics can be combined in function signatures to express complex relationships:

```typr
@map: (a: [#N, T], f: (T) -> U) -> [#N, U];
```

Here, three different generic forms appear together:
- `#N` — the array dimension (preserved through the map)
- `T` — the input element type (free generic)
- `U` — the output element type (free generic)

The signature enforces that `map` preserves array length while allowing element type transformation.

---

## Generics in type definitions

Generics also appear in type aliases and opaque types:

```typr noplayground
type Option`<T>` <- .Some(T) | .None;   # free generic
opaque Factor`<L>` <- int;               # phantom parameter — L is never used in the body
```

A **phantom parameter** (like `L` above) exists only for type-level tracking — it appears in signatures but has no runtime representation. This pattern is useful for encoding constraints that are checked at compile time only.

See [Type Constructors & Aliases](type-constructors.md) for more on type definitions.

---

## Summary

| Form | Purpose | Example |
|------|---------|---------|
| `T` | Free generic (any type) | `fn(x: T): T` |
| `#N` | Array dimension / index | `[#N, int]` |
| `$T` | Field label (compile-time string) | `$T` |
| `%R` | Constrained to Record | `%R` |
| `@I` | Constrained to Interface | `@I` |
| `^S` | Constrained to `char` | `^S` |
| `?B` | Constrained to `bool` | `?B` |
