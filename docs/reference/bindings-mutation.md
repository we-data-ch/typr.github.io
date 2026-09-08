# Bindings & Mutation

This page covers how variables are declared, destructured, and reassigned in TypR.

<!-- truncate -->

## Declaration with `let`

```typr
let x <- 42;
let y: int <- 5;
@pub let z <- "hello";             # public + testable
@testable let cache <- state(0);   # private, visible in build --test via M$.test_cache
@export let api <- fn(x: int): int { x };  # @pub + #' @export roxygen2
```

Both `<-` and `=` work as the assignment operator in `let`. However, a single `=` is **never** a binary infix operator in expressions — it is reserved for named fields (`x = 1`), top-level assignment, and default parameter values.

---

## Tuple destructuring

```typr
let :{a, b, c} <- :{1, 2, 3};
let :{a, _, c} <- :{1, 2, 3};   # wildcard: ignore the element
```

Destructuring is desugared into a temporary variable + positional access via dot (`__tuple_tmp__.1`, `.2`, ...).

---

## Reassignment & mutation

```typr noplayground
x <- 10;         # reassign an already-bound variable
x <- x + 1;

# "implicit mutation" sugar: x!; reassigns x to the result of the expression
x |> f() |> g()!;         # ≡  x <- x |> f() |> g();
obj.method()!;            # ≡  obj <- obj.method();
```

The `expr!;` form requires the head of the `.`/`|>` chain to be an assignable variable — `3!;` is rejected at parse time.

---

## Visibility annotations

| Annotation | Effect |
|-----------|--------|
| `@pub` | makes the binding public (visible outside the module) |
| `@testable` | private, but exposed as `M$.test_name` in `build --test` mode |
| `@export` | combines `@pub` with a `#' @export` roxygen2 tag |
