---
description: "Interfaces: describing structural capabilities without modifying the original types."
---

# Interfaces & Structural Validation

This page covers interfaces in TypR — a way to describe structural capabilities without modifying the original types.

<!-- truncate -->

## Defining an interface

```typr
type Movable <- interface { mv: (Self, int, int) -> Self };
```

An interface describes a **structural capability**: any type whose free functions have this type as their first parameter "implements" it, without requiring an `impl` keyword.

---

## Using an interface as a validator

```typr
# --- setup ---
type Point <- list { x: int, y: int };
type Movable <- interface { mv: (Self, int, int) -> Self };
let mv <- fn(p: Point, dx: int, dy: int): Point { Point:{ x = p$x + dx, y = p$y + dy } };
# -------------

let p <- Point:{ x = 1, y = 2 };
let q <- Movable(p);   # compile-time validator — transpiles to `q <- p`, never a real call
```

Calling `I(x)` where `I` is an interface alias is never a real function call (aliases live in a separate namespace from variables) — it is a compile-time compatibility check that fails with `InterfaceNotSatisfied` or `IncompatibleInterfaceMethod`.

---

## Polymorphic functions with interfaces

Interfaces enable **ad-hoc polymorphism** — similar to type classes in Haskell or traits in Rust:

```typr
@paste: (Any, Any) -> char;

type Viewable <- interface {
    view: (Self) -> char
};

# A function that works for ALL Viewable types
let double <- fn(a: Viewable): char {
    paste(view(a), view(a))
};
```

To make a type part of an interface, simply define the required function for it:

```typr
# --- setup, from the previous block ---
@paste: (Any, Any) -> char;
type Viewable <- interface { view: (Self) -> char };
let double <- fn(a: Viewable): char { paste(view(a), view(a)) };
# --------------------------------------

let view <- fn(a: bool): char {
    "bool"
};

# bool now inherits 'double'
true.double();
```

This pattern is powerful for building extensible libraries where users can plug in their own types without modifying the original code.

---

## Several parameters of the same interface: `I@Id`

A bare interface name stands for **one** hidden type variable per interface. Two `Lovable`
parameters therefore share the same concrete type:

```typr compile_fail
# --- setup ---
type Lovable <- interface { love: (Self) -> int };
type Cat <- list { name: char };
type Dog <- list { age: int };
let love <- fn(c: Cat): int { 1 };
let love <- fn(d: Dog): int { 2 };
let cat <- Cat:{ name = "tom" };
let dog <- Dog:{ age = 3 };
# -------------

let cmp <- fn(a: Lovable, b: Lovable): bool { a.love() == b.love() };
cmp(cat, dog);   # rejected: a and b must have the same type
```

To let the two parameters have **different** concrete types, name the variables with a suffix
`@Id` (one uppercase letter, glued to the interface name):

```typr
# --- setup ---
type Lovable <- interface { love: (Self) -> int };
type Cat <- list { name: char };
type Dog <- list { age: int };
let love <- fn(c: Cat): int { 1 };
let love <- fn(d: Dog): int { 2 };
let cat <- Cat:{ name = "tom" };
let dog <- Dog:{ age = 3 };
# -------------

let cmp <- fn(a: Lovable@A, b: Lovable@B): bool { a.love() == b.love() };
cmp(cat, dog);
```

The identifier also ties the return type to a parameter. Here the result is the type of `b`, not of `a`:

```typr
# --- setup, from the previous block ---
type Lovable <- interface { love: (Self) -> int };
type Cat <- list { name: char };
type Dog <- list { age: int };
let love <- fn(c: Cat): int { 1 };
let love <- fn(d: Dog): int { 2 };
let cat <- Cat:{ name = "tom" };
let dog <- Dog:{ age = 3 };
# --------------------------------------

let second <- fn(a: Lovable@A, b: Lovable@B): Lovable@B { b };
let d: Dog <- second(cat, dog);
```

The same identifier used twice means the same type: `fn(a: Lovable@X, b: Lovable@X)` called with a `Cat`
and a `Dog` is an error. `Lovable@_` is a fresh variable at each occurrence.

The rules, in short:

- `@Id` is written right after the interface name, with no space. `Lovable @A` and `Lovable@Self` are syntax errors (S018).
- One identifier carries one bound: `Lovable@A` with `Printable@A` is an error (T047).
- An identifier cannot also be a free generic of the signature (`fn(a: T, b: Lovable@T)`, T048).
- An identifier that appears only in the return type has nothing to be bound to (T017).
- The generated R does not change: the S3 dispatch uses the interface name, never the identifier.

---

## Intersection of interfaces

```typr
type Combined <- Movable & Drawable;   # intersection of interfaces
```

A value must satisfy **all** interfaces in the intersection.
