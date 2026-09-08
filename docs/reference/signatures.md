# Signatures, @extern & Foreign

This page covers type aliases, opaque types, typeconstructors, and the signature system for declaring types without bodies.

<!-- truncate -->

## Type aliases and opaque types

```typr
type Meters <- int;                 # transparent alias
opaque Meters <- int;               # opaque alias: the underlying type is hidden from external typing
type Option<T> = .Some(T) | .None;  # generic alias — uses `<T>`, not [T]
opaque Factor<L> <- int;            # "phantom" parameter: L appears only in future @signature
```

Key differences:
- **`type`**: transparent — the alias and its underlying type are interchangeable
- **`opaque`**: the underlying type is hidden from external code, providing stronger encapsulation

---

## Typeconstructors

```typr
typeconstructor Tibble[N] record;          # registers a generic record constructor
typeconstructor Matrix[N, M, T] recursive;
```

Typeconstructors register generic constructors that can be used with the `TypeName[N]{ ... }` syntax to create parameterized records.

---

## Signatures (type declarations without bodies)

Signatures declare the type of an existing R function without providing an implementation:

```typr
@map: (a: [#N, T], f: (T) -> U) -> [#N, U];   # generic
@add: (a: int, b: int) -> int;                  # overload: repeat @add with other types
@add: (a: num, b: num) -> num;
@as__character: (Self) -> char;                 # "__" → "." in R output (as.character)
```

A `.ty` signature file can contain a real `let name <- fn(...){...}` body and pass type-checking — but that body is **silently discarded**: only the `(name, type)` pair survives.

### Overloading

Signatures can be repeated with different type parameters to define overloaded functions:

```typr
@add: (a: int, b: int) -> int;
@add: (a: num, b: num) -> num;
```

---

## @extern — external R functions

```typr
@extern stats::sd: (x: [Any, num]) -> num;      # real package::fn call
@extern base::readRDS: (path: char) -> Foreign<Any>;  # already-visible function (no pkg:: prefix needed)
@importFrom dplyr filter select mutate;          # generates a roxygen2 @importFrom
```

`@extern` declares the type of an R function from an external package. The compiler uses this for type-checking; at runtime, the actual `package::function` call is emitted.

---

## Foreign — opaque external R values

`opaque Foreign<T> <- Any;` (defined in `configs/std/foreign.ty`) is the idiomatic companion type for `@extern` — it names an R value that already exists outside TypR (S3/S4/RC/R6 objects, third-party packages) without ever constructing it from TypR:

```typr
type LmModel <- Foreign<Any>;
@extern base::readRDS: (path: char) -> LmModel;
@extern stats::coef: (m: LmModel) -> Foreign<Any>;

let m: LmModel <- readRDS("modele.rds");
```

The value passes through `let` bindings, function arguments, and return values **untouched** (no `as.X()`/`struct()` applied).

### Limitations

1. `m.field` / `m$field` **never** type-checks (`Any` has no known structural fields — you need a dedicated `@extern` accessor for each field/slot/method)
2. `@extern` calls are **positional only** — you cannot directly call an R function that requires named arguments (`new("X", x=1)`)

---

## Signature patterns for the stdlib

The only pattern that works for the standard library is: signature-only in `.ty` + hand-written R implementation in `std.R`.
