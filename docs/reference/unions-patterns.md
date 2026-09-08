# Unions, Tags & Pattern Matching

This page covers tagged union types and the `match` expression in TypR.

<!-- truncate -->

## Defining tagged unions

```typr
type Shape <- .Circle(num) | .Square(num);
let s <- .Circle(3.14);
let n <- .None;                              # tag without payload
```

Each variant is prefixed with a dot (`.`) to distinguish it from regular type names.

---

## The `match` expression

```typr noplayground
match s {
    .Circle(r) => r * 2.0,
    .Square(side) => side,
}
```

### Available patterns

| Pattern | Example | Description |
|---------|---------|-------------|
| Tag with binding | `.Some(a) => a` | destructures and binds the payload |
| Tag without binding | `.None => 0` | matches a zero-payload tag |
| Type pattern | `x as int => x + 1` | type cast/refinement |
| Record pattern | `:{nom: n, age: a} => a` | destructures a record |
| Tuple pattern | `:{a, b} => a` | destructures a tuple |
| Wildcard | `_ => default` | matches anything |
| Variable | `v => v` | binds and returns |

---

## Qualified union constructors

```typr noplayground
type Color <- .Red | .Blue;
Color.Red                       # qualified reference to a tag (bare, no :{...})

type Rgb <- list { r: int, g: int, b: int };
type Palette <- .Red | .Blue | Rgb;
Palette.Rgb:{ r = 10, g = 20, b = 30 }   # Rgb is a record alias used as a union member
```

**Important**: `Union.Variant:{ field = val }` syntax **only** works when `Variant` is a record alias used directly as a union member — never for a real tag `.Variant(...)`. To construct a tag, use `.Variant(value)`, and `.Variant(:{ ... })` when the payload is itself a record.

---

## Generic tagged unions

Tagged unions work with generics for reusable patterns:

```typr noplayground
type Option`<T>` <- .Some(T) | .None;

let val: Option<int> <- .Some(42);
let empty: Option<int> <- .None;

match val {
    .Some(n) => n,
    .None => 0,
}
```
