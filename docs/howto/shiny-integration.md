# Type Shiny apps

> Type reactive values and modules in a Shiny app built with TypR.

# How to type Shiny apps

Shiny's reactive graph — `reactive()`, `input`/`output`/`session`, modules — is
built on non-standard evaluation, the same way dplyr is. This guide applies the
same interop pattern as [Use dplyr/tidyr from TypR](use-dplyr-tidyr): keep the
reactive plumbing in `R {}` blocks, and move the business logic it calls into
typed functions.

## The core pattern: typed logic, untyped glue

A typical Shiny server pulls a reactive value and renders it:

```r
server <- function(input, output) {
  team <- reactive(fetch_members(input$team_id))

  output$roster <- renderTable({
    # Which columns does `team()` have?
    # Grep the whole app, or run it and find out.
    team()[team()$active, ]
  })
}
```

The question in the comment — *what shape is `team()`?* — is exactly what a
type answers. Pull the filtering logic out into a typed function and call it
from inside the `R {}` block that holds the reactive glue:

```typr
type User <- list { id: int, name: char, active: bool };

let active_only <- fn(members: [Any, User]): [Any, User] {
  members.filter(\(u) u$active)
};

let server <- function(input, output) {
  R {
    team <- shiny::reactive(fetch_members(input$team_id))
    output$roster <- shiny::renderTable({
      active_only(team())
    })
  }
};
```

`server` itself stays an untyped `function(...)` — Shiny calls it with
`input`/`output` (and `session`, for modules), which are opaque R objects with
no fixed shape. `active_only` is where the type lives: `[Any, User]` says
exactly what `team()` must hold before you write `u$active`, and the compiler
checks the body against it.

## Typing what a reactive carries

The pattern above hides the reactive's type inside the `R {}` block. When a
reactive's shape needs to flow through more of the program — as a function
argument or return type — declare it with `opaque` and `@extern`:

```typr
type User <- list { id: int, name: char, active: bool };

opaque Reactive<T> <- Any;

@extern shiny::reactive: (() -> [Any, User]) -> Reactive<[Any, User]>;

let team: Reactive<[Any, User]> <- reactive(fn(): [Any, User] { [] });
```

`Reactive<T>` is `opaque` for the same reason `R6Person` is `opaque` in the
[R6/S4 guide](interop-r6-s4) — it is an R closure under the hood, and TypR
does not try to model closures-as-values. What you get instead is a type-level
label: a function that returns `Reactive<[Any, User]>` promises its caller a
reactive over users, without exposing `Any`.

## Reading a reactive's value in typed code

Calling a reactive (`team()`) invokes an R closure — the same situation as
calling an R6 method. Use `extern` with a raw R body, exactly as the R6 guide
does for `p$greet()`:

```typr
# --- setup, from the previous block ---
type User <- list { id: int, name: char, active: bool };
opaque Reactive<T> <- Any;
@extern shiny::reactive: (() -> [Any, User]) -> Reactive<[Any, User]>;
let team: Reactive<[Any, User]> <- reactive(fn(): [Any, User] { [] });
# ---------------

let read_reactive <- extern (r: Reactive<[Any, User]>) -> [Any, User] r#"r()"#;

let active_only <- fn(members: [Any, User]): [Any, User] {
  members.filter(\(u) u$active)
};

let roster <- fn(): [Any, User] {
  active_only(read_reactive(team))
};
```

`read_reactive` is checked at the boundary — its signature says a `Reactive<[Any, User]>`
goes in and a `[Any, User]` comes out — while the call itself (`r()`) is
emitted verbatim, since "invoke this closure" is not something TypR's type
system represents directly.

## Typing Shiny modules

A Shiny module is a pair of functions — a UI function and a server function —
conventionally sharing an `id`. Keep their internals in `R {}` blocks (module
UI is built from `tagList`/`NS`, both NSE-heavy), and type only the boundary:
the `id` going in, and the reactive the server function hands back to its
caller.

```typr
type User <- list { id: int, name: char, active: bool };

opaque Reactive<T> <- Any;

let user_module_ui <- fn(id: char): Foreign<Any> {
  R {
    ns <- shiny::NS(id)
    shiny::tagList(
      shiny::textInput(ns("name"), "Name"),
      shiny::actionButton(ns("submit"), "Add")
    )
  }
};

let user_module_server <- fn(id: char): Reactive<[Any, User]> {
  R {
    shiny::moduleServer(id, function(input, output, session) {
      shiny::reactive({
        list(list(id = 1L, name = input$name, active = TRUE))
      })
    })
  }
};
```

Callers of `user_module_server` now get a checked return type instead of an
opaque list result — `user_module_server("users")` is a
`Reactive<[Any, User]>`, and `read_reactive` (above) is what turns it into
data.

## Best practices

1. **Type the logic, not the plumbing** — `input`, `output`, `session`, and
   `reactive()`'s returned closures are NSE by design. Keep them in `R {}`
   blocks and move filtering/computing/validating logic into typed functions.

2. **Use `opaque Reactive<T>`, not `Foreign<Any>`, once a reactive crosses a
   function boundary** — a return type of `Reactive<[Any, User]>` tells a
   caller what the reactive holds; `Foreign<Any>` does not.

3. **Use `extern` to invoke, `@extern` to declare** — `@extern shiny::reactive: ...`
   describes an existing R function's signature; `extern (...) -> T r#"..."#`
   wraps a small raw-R expression (like calling a reactive) with a checked
   type.

4. **Keep module boundaries small** — type the `id` parameter and the
   reactive a module server returns; leave `tagList`/`moduleServer` wiring
   inside `R {}`, the same way the R6 guide leaves R6 construction inside
   `extern`/`R {}`.

## Where to go next

- [Use dplyr/tidyr from TypR](use-dplyr-tidyr) — the same `R {}` / `@extern` pattern applied to the tidyverse
- [Interop with R6/S4/RC](interop-r6-s4) — `opaque` wrappers and `extern` for method calls, the same idiom used here for reactives
- [Escape Hatches](/docs/reference/escape-hatches) — `R {}`, `extern`, `Foreign<T>` reference
