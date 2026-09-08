# Getting started

This is a tutorial. You will learn TypR by writing and running small programs,
step by step. It takes about ten minutes.

> This page is not a reference — it does not list every construct or all types.
> When you want the details, follow the links to the [reference](/docs/reference/intro)
> at the end of each section.

TypR is a typed version of R that transpiles into plain `.R` files. It is aimed
at developers who write R code that must survive in production: packages,
libraries, and applications. You write code that looks almost identical to R,
a compiler checks your types, and the output is ordinary R.

## Before you begin

You need:

- **A basic knowledge of R** — syntax, functions, the `<-` assignment.
- **A recent version of R** installed.
- **The `typr` compiler.** Head to the [installation guide](reference/installation.md)
  and come back once `typr --version` prints a version number.

Everything else — IDE, editor, RStudio — is optional.

## 1. Say hello

Create a file called `hello.ty` in an empty folder:

```typr
# hello.ty
print("Hello, TypR!");
```

Note that you need to put a ";" at the end of each expression. It looks like a regression compared to R but it is a way to help the transpiler let us build more elegant code (you can see [beautiful syntax](/docs/philosophy/beautiful_syntax) section).

Transpile it from the terminal:

```bash
typr build hello.ty
```

TypR generates plain R code. If you look at the files produced, you will see
an ordinary `hello.R` file — nothing exotic. That generated code is what runs, anywhere
R runs.

## 2. Store a value

In TypR, you declare a name with `let` and assign it with `<-`, like in R. A
type annotation, written `name: type`, tells the compiler what the value should be:

```typr
let message: char <- "Hello, TypR!";
print(message);
```

The compiler now checks that `message` is always used as a character string.

The four primitive types are `int`, `num`, `bool`, and `char`. See the
[types reference](reference/types.md) for the full type table.

## 3. Write a typed function

A typed function declares the type of each parameter and of its return value.
The compiler uses these declarations to catch mistakes before the code runs:

```typr
let add <- fn(a: int, b: int): int {
  a + b
};

print(add(5, 3));
```

You did not have to annotate `add` itself: the compiler infers it. You only
annotate what matters for clarity or safety. For example, swapping `b` for a
string would now fail at compile time instead of at runtime.

## 4. Call the same function three ways

TypR functions are first-class values, and their first argument can become a
"receiver". Thanks to uniform function call syntax, the three calls below are
strictly equivalent:

```typr
add(5, 3);        # classic call
(5) |> add(3);    # pipe
(5).add(3);       # method-call style
```

Pick whichever reads best. See the [functions reference](reference/functions.md)
for more on function types and higher-order functions.

## 5. Model your data

To work with structured data, define a type and a constructor for it:

```typr
type Person <- list {
  name: char,
  age: int
};

let new_person <- fn(name: char, age: int): Person {
  list(name = name, age = age)
};
```

Because TypR uses structural types, a function that needs only the `age` field
accepts *any* value that has one — including data frames and lists with extra
fields. See the [types reference](reference/types.md) for structural subtyping.

## 6. Write a function on your type

```typr
let is_adult <- fn(p: Person): bool {
  p$age >= 18
};

let alice <- new_person("Alice", 25);

alice.is_adult();   # true
```

Note the method-call style: `alice.is_adult()` is `is_adult(alice)`. Because
`alice` is a `Person`, and `is_adult` expects a `Person`, the compiler knows the
types all the way through.

## 7. Add a test right next to the code

With an inline `Test` block, logic and tests stay side by side. During
transpilation the block is extracted into a standard testthat file:

```typr
Test {
  test_that("is_adult works", {
    let alice <- new_person("Alice", 25);
    let bob <- new_person("Bob", 15);
    expect_true(alice.is_adult());
    expect_false(bob.is_adult());
  })
}
```

To R, devtools, testthat, and CRAN, the result is just a regular R package.

## 8. From script to package

A TypR package is a normal R package with one extra `TypR/` folder. Put your
`.ty` files there, run `typr build`, and TypR generates the R code into `R/`.

You can migrate any existing R package gradually: file by file, function by
function. TypR never forces an all-or-nothing choice.

See [Working with R and TypR](reference/r-typr.md) for the full walkthrough.

## Where to go next

- **[FAQ](faq.md)** — common questions, comparisons, and practical answers
- **[Reference](/docs/reference/intro)** — types, functions, control flow
- **[Philosophy](philosophy/intro.md)** — why TypR is designed this way
- **[Blog](/blog)** — R and TypR, vectorization, testing, OOP
