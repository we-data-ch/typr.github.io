# Modules & Imports

This page covers how to organize code into modules and import symbols in TypR.

<!-- truncate -->

## Defining a module

```typr
module Math {
    let pi <- 3.14159;
    @pub let pi_approx <- 3.14;
    @pub opaque Radians <- num;
};
```

A module compiles to an R environment. Members without `@pub` remain invisible from outside (except in `build --test` mode via `@testable`, where they are exposed as `M$.test_name`).

---

## Importing from modules

```typr
use Math::pi_approx;           # import a single member
use Math::{pi_approx, sin as s};  # import multiple, with alias
use Math::*;                   # import all @pub members
```

---

## Module-level imports

```typr
import Math;                   # import the module itself
import Math as M;              # with an alias
```

---

## Legacy forms

```typr
mod Utils;                     # historical import form (equivalent to import)
library(dplyr);               # classic R dependency
use("dplyr", c("filter", "select"));   # legacy adapter
```

---

## Module organization

A common pattern is to use `main.ty` as an aggregation entry point and create one file per type or concept:

```typr
# main.ty
mod person;
mod utils;
```

TypR will look for `person.ty` and `utils.ty`, parse, type-check, and transpile each into a corresponding `.R` file in the `R/` folder. This keeps the codebase clean and modular.
