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
let view <- fn(a: bool): char {
    "bool"
};

# bool now inherits 'double'
true.double()
```

This pattern is powerful for building extensible libraries where users can plug in their own types without modifying the original code.

---

## Intersection of interfaces

```typr
type Combined <- Movable & Drawable;   # intersection of interfaces
```

A value must satisfy **all** interfaces in the intersection.
