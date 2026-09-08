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
# --- setup ---
module Math {
    @pub let pi_approx <- 3.14;
    @pub let sin <- fn(x: num): num { x };
};

module Stats {
    @pub let mean_of <- fn(x: num): num { x };
};
# ---------------

use Math::pi_approx;              # import a single member
use Math::{sin as s};             # import several, with an alias
use Stats::*;                     # import all @pub members

print(pi_approx);
```

---

## Module-level imports

```typr noplayground
import Math;                   # import the module itself
import Math as M;              # with an alias
```

---

## Legacy forms

```typr noplayground
mod Utils;                     # historical import form (equivalent to import)
library(dplyr);               # classic R dependency
use("dplyr", c("filter", "select"));   # legacy adapter
```

---

## Module organization

A common pattern is to use `main.ty` as an aggregation entry point and create one file per type or concept:

```typr noplayground
# main.ty
mod person;
mod utils;
```

TypR will look for `person.ty` and `utils.ty`, parse, type-check, and transpile each into a corresponding `.R` file in the `R/` folder. This keeps the codebase clean and modular.
