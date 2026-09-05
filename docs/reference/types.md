### Syntax and types

Typed R keeps a syntax that is deliberately close to standard R. Type annotations are added in a lightweight and readable way, designed to integrate naturally with existing R code.

Types can appear:

* in variable declarations,
* in function parameters,
* in function return types,
* in structured data definitions.

The design principle is that **typed code should still look like R**, with minimal syntactic overhead.

---

### Basic types

Typed R provides explicit basic (primitive) types, which form the foundation of the type system:

| Type   | Description                  | Example          |
|--------|------------------------------|------------------|
| `int`  | Integer numbers              | `42`             |
| `num`  | Floating-point numbers       | `3.14159`        |
| `bool` | Boolean values               | `true`, `false`  |
| `char` | Character strings            | `"Hello"`        |

These types allow the compiler to detect invalid operations early, such as applying numeric operations to non-numeric values.

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

Each variable is annotated with its type using the `variable: type` syntax after the `let` keyword. The compiler will raise an error if you try to assign a value that doesn't match the declared type.

---

### Composite types

In addition to basic types, Typed R supports composite types to model more complex data.

#### Vectors

Vectors combine values of the same type into a sequence. They use the familiar `c()` constructor from R:

```julia
# Typed vector definition
type Vector <- Vector[3, int];

# Has a default constructor
let vector <- c(1, 2, 3);
```

You can specify the length and element type when defining a vector type. Vectorized operations work naturally on these values.

#### Arrays

Arrays are an alternative notation for typed sequences, using bracket syntax:

```julia
# Array type definition
type Array <- [4, bool];

# Has a default constructor
let array <- [true, false, false, true];
```

Arrays and vectors both support vectorized operations. The bracket notation (`[...]`) provides a more concise way to create sequences, similar to arrays in other programming languages.

#### Lists

Lists combine values of potentially different types into a named collection. They are the primary way to model structured data in TypR:

```julia
# List type definition
type List <- list {
	a: int,
	b: bool
};

# Has a default constructor
let list0 <- list(a = 3, b = false);
```

Lists can also be created using the object-like notation for a more concise syntax:

```julia
# Standard notation
let list1 <- list(name = "Anna", age = 45);

# Object-like notation
let list2 <- :{name: "Anna", age: 45};
```

An important feature of lists is **structural subtyping**: a function that expects a list with certain fields will accept any list that contains those fields (and possibly more). This enables a form of function inheritance:

```julia
# This function accepts any list that has an 'age' field of type int
let is_minor <- fn(p: {age: int}): bool {
	p$age < 18
};

# Works with any list that has the right structure
list2.is_minor().print()
```

#### Functions as types

Functions are first-class values in TypR and have their own type syntax:

```julia
# Function type definition
type Function <- (int) -> bool;

# Has a default constructor
let function0 <- fn(a: int): bool {
	true
};
```

The `(parameters) -> return_type` syntax describes the shape of a function. This is useful when passing functions as arguments to other functions, or when storing them in data structures.

---

### Interfaces

Interfaces describe a set of related functions that a type must implement. They allow you to write generic code that works with any type satisfying a given contract:

```julia
# Interface definition
type Viewable <- interface {
	view: (Self) -> char
};
```

The `Self` keyword refers to the type that implements the interface. To include a type in an interface, you simply define the required function for that type:

```julia
# Include bool in the Viewable interface
let view <- fn(a: bool): char {
	"bool"
};
```

Once a type implements an interface, it inherits all functions defined for that interface:

```julia
@paste: (Any, Any) -> char;

# A function for all Viewable types
let double <- fn(a: Viewable): char {
	paste(view(a), view(a))
};

# Because bool implements Viewable, it inherits 'double'
true.double()
```

Interfaces are particularly powerful for building extensible libraries where users can plug in their own types.

---

### Union types and Tags

Union types allow you to express that a value can be one of several types. They are especially useful for modeling optional values or variant data:

```julia
# Union types (coming soon for raw unions)
type Union <- int | bool;
```

#### Tagged unions

Tagged unions combine union types with discriminated tags, enabling safe pattern matching. Each variant is prefixed with a dot (`.`) to distinguish it:

```julia
# Option type: either Some(value) or None
type Option<T> <- .Some(T) | .None;

let val: Option<bool> <- .None;

let res = match val {
	.Some(a) => a,
	_ => false
};

res
```

The `match` expression lets you handle each variant of a tagged union exhaustively. The wildcard `_` acts as a default branch.

Note that `Option` uses a **generic parameter** `<T>`, which makes it work with any inner type. You can have `Option<int>`, `Option<char>`, etc.

---

### Type aliases

Type aliases let you give a name to an existing type. This is useful for reducing verbosity and improving readability when dealing with complex types:

```julia
# Type definition by alias
type Person = list {
	name: char,
	age: int
};

new_person <- fn(name: char, age: int): Person {
	list(name = name, age = age)
};

is_minor <- fn(p: Person): bool {
	p$age < 18
};

alice <- new_person("Alice", 35);

alice.is_minor()
```

With an alias, `Person` and `list { name: char, age: int }` are interchangeable. The alias simply provides a shorter, more meaningful name. This is different from `type Person <- ...` which creates a distinct new type.

---

### Type inference

Typed R features **type inference**, meaning that explicit type annotations are not always required.

When possible, the compiler automatically infers types based on:

* literal values,
* expressions,
* function bodies,
* usage context.

This allows developers to write concise code while still benefiting from static type checking. Explicit types can be added incrementally where clarity or safety is critical.

---

### Summary of type constructors

| Kind       | Syntax                          | Example                            |
|------------|---------------------------------|------------------------------------|
| Vector     | `Vector[n, T]`                  | `c(1, 2, 3)`                      |
| Array      | `[n, T]`                        | `[true, false, true]`             |
| List       | `list { field: T, ... }`        | `list(a = 3, b = false)`          |
| Function   | `(T1, T2) -> T3`               | `fn(a: int): bool { true }`       |
| Interface  | `interface { f: (T) -> T, ... }`| no default constructor             |
| Union      | `T1 \| T2`                     | no default constructor             |
| Tagged     | `.Tag(T) \| .Tag2`             | `.Some(42)`, `.None`               |
| Alias      | `type Name = T`                 | `type Person = list { ... }`       |
