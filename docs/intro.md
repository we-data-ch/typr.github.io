# Getting started

## 1. Why this language

**TypR** is a powerful data-science/software-engineering programming language and a typed version of the R language that introduces an optional static type system, while preserving the flexibility and expressiveness that make R a powerful tool for data analysis and statistics.

Its main goals are:

- **Reduce runtime errors** through early detection (at writing or compilation time).
- **Improve readability and maintainability** of medium- to large-scale R projects.
- **Facilitate teamwork** by making function contracts and data structures explicit.
- **Prepare R code for production use**, without giving up the existing ecosystem.

TypR aims to strike a balance: more rigor when needed, without sacrificing productivity.

You can read more about this topic with its [core philosophy](philosophy/intro.md).

## 2. What TypR is not

### Not a R's replacement
R is a powerful programming language for research, exploration, experimentation and visual production for data analysis and statistics. TypR is there to handle another set of activity going from package production/maintenance to live application scalability in production.

See [working with typr along r](reference/r-typr.md)

### Not a low level R
Even though, in the future types will help building faster code, their goal is more about data modeling and safety.

## Target audience

This language is primarily intended for:

- **Data scientists and statisticians** who use R and want more reliable analyses.
- **Developers** working on complex or mission-critical R projects.
- **Data teams** in organizations seeking to standardize and secure their codebases.
- **Researchers and educators** who want to introduce sound software engineering practices into their work.

It is especially well suited for projects that go beyond simple exploratory scripts.

## 3. Prerequisites

To use TypR, it is recommended to:

- Have a **basic knowledge of the R language** (syntax, functions, data frames).
- Understand fundamental **programming concepts** (functions, variables, modules).

Experience in data science or statistics is a plus, but not strictly required.

## 4. Installation

Check the [installation page](reference/installation.md).

## 5. First program

Here is a simple first example in TypR:

```julia
print("Hello world")
```

You can also store values in typed variables using the `let` keyword and a type annotation. The following example declares a `char` variable and prints it:

```julia
# Hello World in TypR
let message: char <- "Hello, TypR!";

message
```

And here is a more complete version using a typed function to print the message:

```julia
let hello: char <- "Hello world";

let my_print <- fn(msg: char): Empty {
	print(msg)
};

my_print(hello)
```

## Core concepts

### Primitive types

TypR introduces explicit types for basic values. Here is a complete overview of the four primitive types available:

```julia
# Basic type annotations
let x: int <- 42;
print(x);

let pi: num <- 3.14159;
print(pi);

let name: char <- "TypR";
print(name);

let is_valid: bool <- true;
print(is_valid);
```

- `int` -- integers (whole numbers like `42`)
- `num` -- numbers (floating-point values like `3.14159`)
- `bool` -- booleans (`true` or `false`)
- `char` -- character strings (text like `"TypR"`)

These types allow the compiler to check code consistency and catch type mismatches before runtime.

### Typed functions

Functions in TypR can declare the type of their parameters and their return value. This makes developer intent explicit and prevents many classes of errors:

```julia
# Function with type annotations
let add <- fn(a: int, b: int): int {
  a + b
};

# Using the function normally
print(add(5, 3));
```

TypR also supports **pipe syntax** and **method-call syntax**, giving you multiple ways to call the same function:

```julia
# Using pipes
(5) |> add(3)
	|> print();

# Using method calling
(5).add(3)
   .print();
```

All three calling styles are equivalent -- choose whichever reads best in context.

### Untyped functions

To keep a flexible way to interop with raw R code, you can also use R-style untyped functions:

```julia
function(a, b) {
	a + b
}
```

### Data structures

#### Vectors and Arrays

Vectors use the classic `c()` constructor, while arrays use a bracket notation:

```julia
# Creating typed vectors and arrays
let v1 <- c(1, 2, 3, 4, 5);
print(2*v1+3);

let a1 <- [1, 2, 3, 4, 5];
print(2*a1+3);
```

Both support vectorized operations out of the box. See [Vectorization by design](philosophy/vectorization_by_design.md) for more details.

#### Lists

Lists can be created with the standard `list()` constructor or with a more concise object-like notation:

```julia
# Standard notation
list(name = "Anna", age = 56)

# Object-like notation
:{name: "Anna", age: 56}
```

Lists are also compatible with structural subtyping, meaning a function that expects a list with an `age` field will accept any list that contains that field. See the [types reference](reference/types.md) for more details.

## Going further

To deepen your use of TypR, you can:

- Explore **[advanced types](reference/types.md)** (unions, interfaces, aliases, generics)
- Learn about **[signatures](reference/functions.md)** to type existing R functions
- Discover **[integration with the existing R ecosystem](reference/r-typr.md)** (packages, scripts, notebooks)
- Read the **[FAQ](faq.md)** for common questions and comparisons

TypR is designed to evolve alongside its users and their needs.


