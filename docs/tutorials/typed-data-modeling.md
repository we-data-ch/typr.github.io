# Model data with TypR types

> Model real data with records, unions, interfaces, and generics by building a small contact-list library.

This tutorial teaches you how to model real-world data using TypR's type
system — records, unions, interfaces, and generics. You will build a small
library for managing a contact list, step by step.

> **Duration:** 15–20 minutes.
>
> This is a tutorial. It teaches you by doing. For the full details, follow the
> links to the [reference](/docs/reference/intro).

## What you will learn

- How to define record types for structured data
- How to use tagged unions for variant data
- How to write functions that operate on your types
- How to use interfaces for polymorphic behavior
- How to work with option types and error handling

## Prerequisites

- Basic knowledge of R and TypR (complete the
  [Getting Started](/docs/intro) tutorial first)
- The `typr` compiler installed

## Step 1: Define your data types

Create a file called `contacts.ty`. Start with the core types:

```typr
# contacts.ty

type Email <- list {
  address: char,
  verified: bool
};

type Phone <- list {
  number: char,
  country: char
};

type Contact <- list {
  name: char,
  email: Email,
  phone: Phone
};
```

These are **record types** — named structures with typed fields. Each field
has a name and a type. The compiler will check that you use them correctly.

## Step 2: Write constructors

Records in TypR are plain lists at runtime. Write constructor functions to
create them:

```typr
# --- setup, from the previous steps ---
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
# --------------------------------------

let new_email <- fn(address: char): Email {
  list(address = address, verified = false)
};

let new_phone <- fn(number: char, country: char): Phone {
  list(number = number, country = country)
};

let new_contact <- fn(name: char, email: Email, phone: Phone): Contact {
  Contact:{ name = name, email = email, phone = phone }
};

let alice <- new_contact("Alice", new_email("alice@example.com"), new_phone("0600000000", "+33"));
print(alice$name);
```

Notice that the return type `Contact` tells the compiler exactly what structure
the function returns. You get type checking on the fields without extra work.

## Step 3: Write functions on your types

Now write functions that operate on contacts:

```typr
# --- setup, from the previous steps ---
@paste: (...values: Any) -> char;
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
let new_phone <- fn(number: char, country: char): Phone { list(number = number, country = country) };
let new_contact <- fn(name: char, email: Email, phone: Phone): Contact { Contact:{ name = name, email = email, phone = phone } };
# --------------------------------------

let is_verified <- fn(c: Contact): bool {
  c$email$verified
};

let display_name <- fn(c: Contact): char {
  c$name
};

let full_info <- fn(c: Contact): char {
  paste(c$name, "<", c$email$address, ">", c$phone$country, c$phone$number)
};

let alice <- new_contact("Alice", new_email("alice@example.com"), new_phone("0600000000", "+33"));
print(full_info(alice));
print(is_verified(alice));
```

Because `c` is typed as `Contact`, the compiler knows that `c$email` is an
`Email` and `c$email$address` is a `char`. Mistakes like `c$email$phone`
fail at compile time.

## Step 4: Use tagged unions for variant data

Not all data fits neatly into a single record. Use **tagged unions** for
values that can be one of several things:

```typr
# --- setup, from the previous steps ---
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
# --------------------------------------

type VerificationStatus <- .Unverified | .Pending | .Verified(char);

type ContactWithStatus <- list {
  name: char,
  email: Email,
  status: VerificationStatus
};

let bob <- ContactWithStatus:{
  name = "Bob",
  email = new_email("bob@example.com"),
  status = .Pending
};
print(bob$name);
```

Each variant is prefixed with a dot (`.`). A tag can carry data —
`.Verified(char)` holds the verification code.

## Step 5: Pattern match on unions

Use `match` to handle each variant:

```typr
# --- setup, from the previous steps ---
@paste: (...values: Any) -> char;
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
type VerificationStatus <- .Unverified | .Pending | .Verified(char);
type ContactWithStatus <- list { name: char, email: Email, status: VerificationStatus };
# --------------------------------------

let get_status_label <- fn(c: ContactWithStatus): char {
  let status <- c$status;
  let label <- match status {
    .Unverified       => "Not verified",
    .Pending          => "Verification in progress",
    .Verified(code)   => paste("Verified with code:", code)
  };
  # each arm carries its own literal type; as__character widens them to `char`
  as__character(label)
};

let bob <- ContactWithStatus:{
  name = "Bob",
  email = new_email("bob@example.com"),
  status = .Verified("abc123")
};
print(get_status_label(bob));
```

`match` is exhaustive — if you forget a variant, the compiler tells you. The
payload is automatically destructured: `code` binds to the `char` inside
`.Verified`.

## Step 6: Use the Option pattern

A common pattern in typed languages is `Option<T>` — a value that might not
exist. TypR does not have a built-in `Option`, but you can define one:

```typr noplayground
type Option<T> <- .Some(T) | .None;

let find_contact <- fn(contacts: [Any, ContactWithStatus], name: char): Option<ContactWithStatus> {
  # Simplified: in real code you would iterate
  .None
};

let greet <- fn(opt: Option<ContactWithStatus>): char {
  match opt {
    .Some(c) => paste("Hello,", c$name),
    .None    => "Contact not found"
  }
};
```

The generic parameter `<T>` makes `Option` reusable for any type. This is
the idiomatic way to handle nullable values in TypR.

## Step 7: Define an interface for polymorphism

Use an **interface** to define a capability that multiple types can share:

```typr
type Displayable <- interface {
  display: (Self) -> char
};
```

Any type that has a `display: (Self) -> char` function automatically
implements `Displayable`. No `impl` keyword needed.

Now write a function that works for any `Displayable`:

```typr
# --- setup, from the previous steps ---
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
type Displayable <- interface { display: (Self) -> char };
# --------------------------------------

let display <- fn(e: Email): char { e$address };

let print_item <- fn(item: Displayable): Empty {
  print(display(item))
};

print_item(new_email("alice@example.com"));
```

## Step 8: Make your types implement the interface

Define `display` for each type:

```typr
# --- setup, from the previous steps ---
@paste: (...values: Any) -> char;
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
type VerificationStatus <- .Unverified | .Pending | .Verified(char);
type ContactWithStatus <- list { name: char, email: Email, status: VerificationStatus };
type Displayable <- interface { display: (Self) -> char };
# --------------------------------------

let display <- fn(e: Email): char {
  e$address
};

let display <- fn(p: Phone): char {
  paste(p$country, p$number)
};

let display <- fn(c: ContactWithStatus): char {
  paste(c$name, "<", display(c$email), ">")
};

let bob <- ContactWithStatus:{
  name = "Bob",
  email = new_email("bob@example.com"),
  status = .Pending
};
print(display(bob));
print(display(Phone:{ number = "0600000000", country = "+33" }));
```

Now `print_item` works with emails, phones, and contacts — the compiler
verifies that each type satisfies the `Displayable` interface.

## Step 9: Build and test

Add a `Test` block to verify your data model:

```typr
# --- setup, from the previous steps ---
@paste: (...values: Any) -> char;
type Email <- list { address: char, verified: bool };
type Phone <- list { number: char, country: char };
type Contact <- list { name: char, email: Email, phone: Phone };
let new_email <- fn(address: char): Email { list(address = address, verified = false) };
let new_phone <- fn(number: char, country: char): Phone { list(number = number, country = country) };
let new_contact <- fn(name: char, email: Email, phone: Phone): Contact { Contact:{ name = name, email = email, phone = phone } };
type VerificationStatus <- .Unverified | .Pending | .Verified(char);
type ContactWithStatus <- list { name: char, email: Email, status: VerificationStatus };
# --------------------------------------

Test {
  test_that("new_email creates an unverified email", {
    let e <- new_email("alice@example.com");
    expect_equal(e$address, "alice@example.com");
    expect_equal(e$verified, false);
  });

  test_that("match handles all variants", {
    let v <- .Verified("abc123");
    let label <- match v {
      .Unverified     => "none",
      .Pending        => "pending",
      .Verified(code) => code
    };
    expect_equal(label, "abc123");
  })
}
```

Run `typr build` and `devtools::test()`.

## Summary of patterns

| Pattern | Use case | Example |
|---------|----------|---------|
| **Record type** | Named, structured data | `type Point <- list { x: int, y: int }` |
| **Tagged union** | Variant data | `type Shape <- .Circle(num) \| .Square(num)` |
| **Option type** | Nullable values | `type Option<T> <- .Some(T) \| .None` |
| **Interface** | Polymorphic behavior | `type Displayable <- interface { display: (Self) -> char }` |
| **Generic function** | Reusable logic | `let id <- fn(x: T): T { x }` |

## Where to go next

- [Create your first TypR package](first-package) — build a complete package
- [Migrate an existing R package](migrate-r-package) — add TypR incrementally
- [Reference: Records & Constructors](/docs/reference/records) — construction,
  spread, named embedding
- [Reference: Unions & Pattern Matching](/docs/reference/unions-patterns) —
  tags, match, exhaustive checks
- [Reference: Interfaces](/docs/reference/interfaces) — structural validation
  and polymorphism
