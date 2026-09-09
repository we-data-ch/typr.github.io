---
description: "Why the type system is shaped the way it is: keeping R's flexibility while taming its fragility."
---

# Why this type system

> The R ecosystem is famous for its flexibility. It is equally famous for the fragility that
> flexibility can bring. TypR's type system is the deliberate attempt to keep the former while
> taming the latter — without forcing you to rewrite your data science code.

<!-- truncate -->

## Freedom and safety are a dial, not a switch

Most languages force you to choose: either you type everything, or you type nothing. TypR
treats typing as a gradual dial. You can write a plain script with inferred variables:

```typr
let x <- 3;
let y <- x * 2;
```

…or add as much precision as a given piece of code needs:

```typr noplayground
let x: int <- 3;
let scale <- fn(p: Point, factor: num): Point { ... };
```

This is what makes TypR tractable for data science: you annotate the *boundaries* — where your
data enters and leaves, where your package meets the outside world — and let inference carry the
rest of the burden.

## Types are about the data, not just the syntax

A recurring principle behind the design is that R data already *has* shape. A data frame has
named columns; a vector has an element type; an S3 object carries a class. The type system is
designed to make that shape explicit instead of inventing a parallel one.

That's why records, tuples, arrays, vectors and data frames are all first-class members of the
type grammar rather than afterthoughts:

```typr
type Point       <- list { x: int, y: int };
type Pair        <- tuple{int, char};
type Coordinates <- [#N, num];                    # size-indexed array
type DataFrame   <- df[#N]{ id: int, active: bool };
```

The rule of thumb: **if R can hold it, TypR can name it.**

## The sigils of kind

Generic parameters in many languages are uniform symbols — `T`, `U`, `K`. TypR distinguishes
them by *kind* with leading sigils, so the intent is visible even without reading the
implementation:

```typr noplayground
let id <- fn(x: T): T { x };       # T    free type variable
#N   # "index" generic — an array dimension
$T   # "label" generic — a field name
%R   # constrained: must be a Record
@I   # constrained: must be an Interface
^S   # constrained: must be a char
?B   # constrained: must be a bool
```

Sigils turn a design conversation into code:

```typr noplayground
type Tibble[N] record;                    # N is a dimension
let  first_col <- fn(df: df[#N]{ ... }): Vec[#N, ^S] { ... };   # column of characters
```

This is a small feature with a large payoff for package maintainers — it makes generic code
self-documenting, and it lets the parser/type-checker reject nonsensical instantiations early.

## Interfaces: structural capacity, no ceremony

TypR uses structural interfaces instead of a mandatory nominal class hierarchy. Anything that
has the required shape satisfies the interface:

```typr noplayground
interface { view: (Self) -> char };
type Drawable <- @I;

fn render <- function(d: Drawable): char { ... };
```

No inheritance declaration, no base class to inherit from, no `setClass`. This mirrors how data
science code is *actually* written: you have a data structure, and you ask "does it support what
I need?" — not "what class hierarchy did it descend from?".

The same structural spirit governs records and unions: a `Point` is a tagged union
`.Circle(num) | .Square(num)`, and matching over it is a first-class, exhaustiveness-checked
construct.

## Encapsulation without magic

`opaque` gives you the privacy that R's dynamic objects rarely provide:

```typr
opaque LmModel <- Foreign<Any>;

@extern stats::coef: (m: LmModel) -> Foreign<Any>;
```

The type-checker *knows* `LmModel` exists and *refuses* access to its internals — you can only
interact with it through the signatures you declare. This is how TypR lets you build robust
package APIs out of inherently untyped R objects: safe at the seam, free inside.

## Kind discipline and phantom parameters

Even the exotic corners of the system serve the same goal. A phantom parameter like
`opaque Factor<L> <- int` seems useless until you realize it lets you distinguish
`Factor<Diet>` from `Factor<Treatment>` at compile time while sharing one runtime
representation. The type system earns its keep by tracking distinctions that *matter to the
caller* but are invisible at runtime.

## What this buys package developers

Taken together, these choices add up to a specific workflow:

1. Keep your existing R functions and data structures — no rewrite required.
2. Declare types only at the boundaries: `@extern`, signatures, record constructors.
3. Let inference and structural checking do the rest.
4. Ship a package where misuse is caught before `R CMD check` runs, not after.

That is the pragmatic contract TypR is built around: **the type system exists to serve the
package developer's workflow, not the other way around.**