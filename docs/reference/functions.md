## Functions

### Typing functions

Functions in Typed R can explicitly declare:

* the type of each parameter,
* the return type.

Typed function signatures act as clear contracts, improving readability and tooling support, and enabling early error detection.

```julia
# Function with type annotations
let add <- fn(a: int, b: int): int {
  a + b
};

# Using the function normally
print(add(5, 3));
```

The `fn` keyword defines a typed function. The parameter types are declared with `: type` after the parameter name, and the return type appears after the closing parenthesis with `: return_type`.

---

### Calling conventions

TypR supports three equivalent ways to call a function, thanks to the **uniform function call** syntax:

```julia
# Classic call
print(add(5, 3));

# Pipe syntax (|>)
(5) |> add(3)
	|> print();

# Method call syntax (.)
(5).add(3)
   .print();
```

All three styles produce the same result. The first argument of the function can be "pulled out" and used as the receiver in the pipe or method-call notation. This makes chaining operations very readable and natural, without needing to define methods on a class.

---

### Signatures: typing existing R functions

By default, most base R functions are untyped in TypR. They accept `Any` and return `Empty`. This means the compiler can't catch type errors when you use them:

```julia
# Working with untyped functions

# By default, most base R functions are untyped
toupper("Hi"); # takes Any, returns Empty

# toupper(7); will return an error at runtime, not compile time
```

The `@` (signature) annotation allows you to declare the type of an existing R function without modifying it. This gives the compiler the information it needs to check your code:

```julia
# Declare the type of toupper
@toupper: (char) -> char;

toupper("Hi"); # now takes char, returns char

# toupper(7); will now return an error at compile time!
```

Signatures are particularly useful for:
- typing base R functions (`paste`, `cat`, `toupper`, etc.),
- typing functions from external packages,
- providing type safety when calling R code from TypR.

---

### Higher-order functions

Typed R fully supports **higher-order functions**, meaning functions can:

* be passed as arguments,
* be returned as values.

The type system tracks function types using the `(T1, T2) -> T3` syntax, ensuring that function composition and callbacks are used correctly.

```julia
# A function type
type Function <- (int) -> bool;

# Using a function as a value
let function0 <- fn(a: int): bool {
	true
};
```

---

### Closures and lambdas

Typed R supports:

* **anonymous functions (lambdas)** for concise functional programming,
* **closures**, where functions capture variables from their surrounding environment.

The type system ensures that captured variables and returned functions remain type-safe, even in advanced functional patterns.

---

### Interfaces: polymorphic functions

Interfaces allow you to write functions that work across multiple types, as long as those types implement a set of required functions. This is TypR's approach to **ad-hoc polymorphism** (similar to type classes in Haskell or traits in Rust):

```julia
# Signature for an existing R function
@paste: (Any, Any) -> char;

# Define an interface
type Viewable <- interface {
	view: (Self) -> char
};

# Create a function for all Viewable types
let double <- fn(a: Viewable): char {
	paste(view(a), view(a))
};
```

To make a type part of an interface, you simply define the required function for it:

```julia
# Include bool in the Viewable interface by implementing 'view'
let view <- fn(a: bool): char {
	"bool"
};

# Now bool inherits the 'double' function
true.double()
```

This pattern is very powerful: you can define interfaces once and extend them to new types without modifying the original code. Combined with method-call syntax, it provides a clean, extensible way to build libraries.

---
