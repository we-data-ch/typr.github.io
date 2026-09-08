# Functions

This page covers function definitions, calling conventions, signatures, and advanced patterns in TypR.

<!-- truncate -->

## Defining typed functions

The `fn` keyword defines a typed function. Parameter types use `: type`, and the return type appears after the closing parenthesis:

```typr
let add <- fn(a: int, b: int): int {
    a + b
};

print(add(5, 3));
```

:::caution
`fn(...)` **always** requires a return type — omitting it triggers an explicit panic ("You forgot to specify the function return type").
:::

---

## Default parameters

Default values are supported for the **final parameter(s)**:

```typr
let greet <- fn(name: char, greeting: char = "Hello"): char {
    greeting
};

greet("World");        # "Hello"
greet("World", "Hi");  # "Hi"
```

---

## Variadic functions

```typr
let sum_all <- fn(...xs: int): int {
    sum(xs)
};

print(sum_all(1, 2, 3));
```

The `...` prefix makes a parameter accept any number of arguments.

---

## Calling conventions

TypR supports three equivalent ways to call a function, thanks to the **uniform function call syntax** (UFCS):

```typr
# Classic call
print(add(5, 3));

# Pipe syntax (|>)
(5) |> add(3)
    |> print();

# Method call syntax (.)
(5).add(3)
   .print();
```

All three styles produce the same result. The first argument can be "pulled out" as the receiver in pipe or method-call notation — making operation chaining readable and natural.

---

## Lambdas

Lambdas use `\` without type annotations:

```typr
let sq <- \(x) x * x;
```

:::info
`\(...)` (lambda) has no declared parameter types or return type. Use `fn(...)` when types are needed.
:::

---

## Partial application

The `\` symbol also supports **partial application** of functions:

```typr
# --- setup ---
let add <- fn(a: int, b: int): int { a + b };
type Point <- list { x: int, y: int };
# -------------

let add5 <- \add(a = 5);                         # partial application of a function
let origin <- \Point:{ x = 0, y = 0 };           # partial application of a record constructor

print(add5(3));
```

:::note
**Lambda vs partial application**: both use `\`, disambiguating by what follows — `\(` → lambda, `\identifier(` → partial application. `PartialApp` is desugared into `Lang::Function` during type-checking and never reaches transpilation.
:::

---

## Higher-order functions

Functions are first-class values in TypR. They can be passed as arguments and returned as values:

```typr
type Function <- (int) -> bool;

let function0 <- fn(a: int): bool {
    true
};
```

The type system tracks function types using `(T1, T2) -> T3` syntax, ensuring composition and callbacks are type-safe.

---

## Closures

Functions can capture variables from their surrounding environment. The type system ensures captured variables and returned functions remain type-safe:

```typr noplayground
let make_adder <- fn(n: int): (int) -> int {
    fn(x: int): int { x + n }
};

let add5 <- make_adder(5);
add5(3);   # 8
```

---

## Signatures: typing existing R functions

By default, most base R functions accept `Any` and return `Empty`. The `@` annotation declares the type of an existing R function without modifying it:

```typr
@toupper: (char) -> char;

toupper("Hi"); # now takes char, returns char
# toupper(7);  # would now fail at compile time
```

See [Signatures, @extern & Foreign](signatures.md) for overloading, `@extern`, and `@importFrom`.

---

## Interfaces: polymorphic functions

Interfaces enable **ad-hoc polymorphism** — write functions that work across multiple types:

```typr
@paste: (Any, Any) -> char;

type Viewable <- interface {
    view: (Self) -> char
};

let double <- fn(a: Viewable): char {
    paste(view(a), view(a))
};

let view <- fn(a: bool): char { "bool" };

true.double();  # works because bool implements Viewable
```

See [Interfaces & Structural Validation](interfaces.md) for details.
