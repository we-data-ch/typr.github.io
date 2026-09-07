# Types

This page provides a comprehensive overview of the TypR type system.

<!-- truncate -->

## Basic types

Typed R provides explicit basic (primitive) types:

| Type | Description | Example |
|------|-------------|---------|
| `int` | Integer numbers | `42` |
| `num` | Floating-point numbers | `3.14159` |
| `bool` | Boolean values | `true`, `false` |
| `char` | Character strings | `"Hello"` |
| `null` | Null value (`NULL`) | `null` |
| `na` | Missing value (`NA`) | `na` |
| `Any` | Top type — accepts any value | (used in signatures) |
| `Empty` | Bottom type — no value satisfies it | (return type for side-effect functions) |
| `Self` | Refers to the type that implements an interface | (used in interface definitions) |

### Literal types

Literals can appear as **types** (singleton types), providing more precise type information than their base type:

```typr
let x: 3 = 3;          # x is exactly 3, not just int
let flag: true = true;  # flag is exactly true, not just bool
let name: "hello" = "hello";  # name is exactly "hello", not just char
```

---

## Composite types

### Records

Records combine named fields of different types. They are the primary way to model structured data:

```typr
type Point <- list { x: int, y: int };
type Config <- record { name: char, timeout: int };   # explicit synonym
```

Equivalent literal forms: `list{...}`, `record{...}`, `object{...}`, `:{...}`.

See [Records & Constructors](records.md) for construction, spread, and named embedding.

### Tuples

Tuples combine values of different types by position:

```typr
tuple{int, char}          # explicit
Tuple[int, char]           # bracket notation
Tuple[T..., U]             # variadic: T... captures a sequence of types
```

### Vectors

```typr
type Vector <- Vec[3, int];
let v <- c(1, 2, 3);
```

### Arrays

```typr
type Array <- [4, bool];
let a <- [true, false, false, true];
```

| Form | Example | Description |
|------|---------|-------------|
| `[T]` (S3 short) | `[int]` | array of integers, free size (`Any`) |
| `[#N, T]` (S3 full) | `[#N, int]` | size indexed by generic `#N` |
| `Array[N, T]` | `Array[3, int]` | named variant, fixed size = 3 |
| `Vec[T]` | `Vec[num]` | native R vector |
| `df[N]{...}` | `df[N]{ name: char, age: int }` | `df` = short alias for `dataframe` |
| `Tibble[N]{...}` | `Tibble[3]{ id: int, active: bool }` | requires a `typeconstructor` declaration |

### Dataframes

```typr
dataframe[N]{ name: char, age: int }
```

---

## Generic types

### Generics and kind sigils

```typr
let id <- fn(x: T): T { x };         # T uppercase = free generic
#N     # "index" generic (array dimension)
$T     # "label" generic (field name)
%R     # constrained: must be a Record
@I     # constrained: must be an Interface
^S     # constrained: must be a char
?B     # constrained: must be a bool
```

### Generic type definitions

```typr
type Option`<T>` <- .Some(T) | .None;
opaque Factor<L> <- int;             # phantom parameter: L appears only in signatures
```

---

## Function types

Functions are first-class values and have their own type syntax:

```typr
(int, char) -> bool                  # anonymous function type
(a: int, b: int) -> int              # parameter names optional, ignored for typing
```

:::caution
Writing `fn(a: int) -> int` in **type position** (instead of `(int) -> int`) triggers `SyntaxError::FunctionTypeSyntax` — `fn(...)` only exists at the expression level, never in types.
:::

---

## Interfaces

```typr
interface { view: (Self) -> char }    # structural capability
```

See [Interfaces & Structural Validation](interfaces.md) for details.

---

## Union types

```typr
type Shape <- .Circle(num) | .Square(num);
type Combined <- Movable & Drawable;          # intersection of interfaces
```

See [Unions, Tags & Pattern Matching](unions-patterns.md) for pattern matching.

---

## Type aliases

Type aliases give a name to an existing type:

```typr
type Person <- list {
    name: char,
    age: int
};
```

With an alias, `Person` and `list { name: char, age: int }` are interchangeable. See [Signatures](signatures.md) for `type` vs `opaque`.

---

## Type inference

Typed R features **type inference** — explicit annotations are not always required. The compiler infers types from:

- literal values
- expressions
- function bodies
- usage context

Explicit types can be added incrementally where clarity or safety is critical.

---

## Summary of type constructors

| Kind | Syntax | Example |
|------|--------|---------|
| Vector | `Vec[n, T]` | `c(1, 2, 3)` |
| Array | `[n, T]` | `[true, false, true]` |
| Record | `list { field: T, ... }` | `list(a = 3, b = false)` |
| Tuple | `tuple{T1, T2}` | `:{1, "hello"}` |
| Function | `(T1, T2) -> T3` | `fn(a: int): bool { true }` |
| Interface | `interface { f: (T) -> T, ... }` | no default constructor |
| Union | `T1 \| T2` | no default constructor |
| Tagged | `.Tag(T) \| .Tag2` | `.Some(42)`, `.None` |
| Alias | `type Name = T` | `type Person = list { ... }` |
