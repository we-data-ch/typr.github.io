## Control flow

### if / else

Conditional expressions in TypR behave like in standard R, with additional type safety.

```typr
if (4 == 4) {
	print("It works!")
} 
```


The type system ensures that:

* conditions evaluate to boolean values,
* all branches of a conditional expression are type-compatible when required.

This prevents common errors where different branches return incompatible types.

---

### for / while

Loop constructs such as `for` and `while` follow R semantics, while benefiting from type checking:

* loop variables have well-defined types,
* operations inside loops are checked for consistency.

This makes iterative algorithms more robust without changing their familiar structure.

---

### match expressions

The `match` expression provides exhaustive pattern matching on tagged unions. It is the idiomatic way to handle values that can take one of several forms:

```typr
# Define an Option type with generics
type Option`<T>` <- .Some(T) | .None;

# Create a value of type Option<bool>
let val: Option<bool> <- .None;

# Pattern match to extract or provide a default
let res = match val {
	.Some(a) => a,
	_ => false
};

res
```

Each branch of a `match` expression uses the `=>` arrow to map a pattern to its result. The patterns can:

* **destructure tagged values**: `.Some(a)` binds the inner value to `a`,
* **use wildcards**: `_` matches anything and acts as a default branch.

The `match` expression is especially powerful when combined with [tagged unions and the Option type](types.md), making it easy to handle optional values, error cases, or any discriminated data safely at compile time.

---
