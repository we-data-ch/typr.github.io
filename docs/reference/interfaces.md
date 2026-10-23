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

```typr noplayground
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

```typr noplayground
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

---

## Interfaces and generics are the same mechanism

In TypR an interface used as a parameter type **is** a constrained generic. You never write the
type parameter yourself; it is introduced for you:

```typr
# --- setup ---
type Incrementable <- interface { incr: (Self) -> Self };
let incr <- fn(self: int): int { self + 1 };
# -------------

let double <- fn(i: Incrementable): Incrementable { incr(incr(i)) };
```

is read as "for any type `A` that satisfies `Incrementable`, `double` takes an `A` and returns an
`A`", that is `∀ A: Incrementable. A → A`. The same interface name in the parameter and in the
return type stands for **one and the same type**.

Applying it picks `A` from the argument, so the result keeps its real type, not the interface:

```typr
# --- setup ---
type Incrementable <- interface { incr: (Self) -> Self };
let incr <- fn(self: int): int { self + 1 };
let double <- fn(i: Incrementable): Incrementable { incr(incr(i)) };
# -------------

let r <- double(3);    # r : int  (A = int, because int has an `incr`)
```

Bare generic names follow the same scheme with the weakest possible constraint. In
`fn(a: A, b: B): A`, each free type identifier that is neither a primitive nor a declared type
becomes a parameter `A: interface {}` (see the next section).

| You write | TypR reads it as |
|-----------|------------------|
| `fn(a: A, b: B): A` | `∀ A, B. (A, B) → A` — each constraint is the empty interface |
| `fn(i: Incrementable): Incrementable` | `∀ A: Incrementable. A → A` |

### An interface only in the return type is rejected

If an interface appears in the return type **without** any matching parameter, there is no
argument from which to pick the concrete type. That would be an *existential* type
(`∃ A: Incrementable. A`), which TypR does not support; the compiler reports that the interface
"appears only in return position":

```typr compile_fail
type Incrementable <- interface { incr: (Self) -> Self };
let make <- fn(): Incrementable { 3 };
```

To hide an implementation behind a stable name, use an `opaque` type instead
(`opaque Counter <- ...`).

---

## Generics `T`, `U` are opaque inside the body

A bare generic such as `T` or `U` behaves like a parameter whose interface is
**empty** (`interface {}`): the caller may pass anything, but inside the function
body nothing is known about the value except its name. Two different generics are
never interchangeable.

```typr
let id <- fn(a: T): T { a };
let first <- fn(a: [#N, T]): [#N, T] { a };
let second <- fn(a: T, b: U): U { b };
```

Returning the wrong generic is rejected, including when the generic is nested in a
type such as `[#N, T]`:

```typr compile_fail
let swap_wrong <- fn(a: T, b: U): T { b };
```

```typr compile_fail
let nested_wrong <- fn(a: [#N, T], b: [#N, U]): [#N, T] { b };
```

The error names the generics you wrote (`Expected: T`, `Found: U`). The same name
(`T`) always stands for the same type throughout one signature, and the generated R
is unchanged.

You can also write an empty interface yourself (`type Any1 <- interface {};`); it is
accepted by the parser and does not add any method requirement.
