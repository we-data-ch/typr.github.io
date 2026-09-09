---
sidebar_position: 1
title: Types for Beginners
description: "Why types are worth it, explained without jargon: what a type system remembers for you, and when it is overkill."
---

# Types for Beginners, at last I'm understanding types

> **TL;DR**  
> Types exist so you don't have to remember your own rules. The moment you break them, TypR taps you on the shoulder and says "nope".
>
> Think of it like switching from a **manual car to an automatic**. In a stick shift, you're juggling clutch, revs, and gear ratios. In an automatic, the car just… remembers. TypR does that for your code. You write down a rule once (for instance, "this variable is a number") and months later, across thousands of lines and sixteen different files, the system still remembers. When something tries to break that rule, you hear about it immediately, not three hours into a pipeline run.
>
> **Does this matter for everyone?** Honestly, no. One-off scripts and quick exploratory plots? Probably overkill. But if you're building a **package, a Shiny app, or an ETL pipeline** that has to survive a long time, this is the insurance policy you didn't know you needed.

## Who is this actually for?

Scientists writing packages. Data scientists halfway through a Shiny app that's becoming sentient. People who love R, aren't professional software engineers, and genuinely can't see how R's lovely flexibility might one day murder them in their sleep.

If that sounds like you, read on. I'm going to keep the tone friendly and let the examples do the heavy lifting.

## What even is a type?

> It's a declaration of what an object is. You tell the system: "this thing is a number. If it stops being a number, that's a bug, not a feature".

Let's start with the smallest possible example. Same logic, two ways of writing it:

**R**

```r
average_height <- mean(heights)
```

**TypR**

```typr noplayground 
let average_height: num <- mean(heights);
```

*That's it. That's the whole concept.* In R, you hand someone a bucket and say "put whatever inside". R will guess it for you. In TypR, you say "this bucket is for numbers". If someone tries to drop a data frame in there (like R allows you to do), the compiler clears its throat politely and refuses.

*R allows you to do that*

```r
age <- 12

age <- data.frame(a=4, b="cat")
```

*TypR won't*

```typr compile_fail
let age: int <- 12;

age <- data__frame(a=[4], b=["cat"]);
``` 

*dot (`.`) in TypR can't be used as variable or function name. They define methods. So any function that used them should be replaced by double underscores (`__`). See the [Beautiful syntax](/docs/philosophy/beautiful_syntax) section*

The logic is simple: we want predictability so no code can change the meaning of the variable. We avoid unexpected changes. In our example, `age` is always a number, which makes sense. You don't want your colleagues changing it to a character because mathematical operations won't work on it. You will get an error later in the code rather than where the problem started. This is a long explanation, but the examples coming up will make it much clearer. In case you are confused, only the type is fixed. You can still change the value later in TypR:

```typr
let age: Integer <- 26;
#> 26

age <- 31;
#> 31
```

Every language deals with types, but they fall into two camps:

- **Dynamic typing** (R, Python, Ruby): types are figured out while the code is running.
- **Static typing** (C, Rust, TypeScript): types are declared upfront and checked *before* anything runs.

Dynamic typing is really nice. Less boilerplate, automatic conversions, the freedom to build a prototype in twenty minutes. Static typing offers you something different: fewer missing guardrails and less danger as your code grows past what you can hold in your head.

> "But dynamic languages work fine! Why bother writing types?"

Because there's a difference between **scripting** (run it once, low stakes, who cares) and **engineering** (other people depend on it, and it needs to outlive your current employment contract). The former is likely a collection of short scripts; the latter is mainly a full project with a lot of logic and dependencies. Scripting is mostly interactive, so there is no issue if an error appears from time to time. Bigger projects need to run correctly **all the time**, so it is too risky to not get the expected result every time. Don't worry, the examples later will make things clearer.

It's not "good vs. evil." It's **flexibility vs. safety**. R and Rust are both beautiful languages; they just optimize for different things. We call it freedom vs. safety [TypR philosophy docs](/docs/philosophy/intro). TypR sits in the sweet spot. It's a **gradually typed** layer over R, which is a fancy way of saying: add types where they help you, ignore them where they don't. That's the point. It lets you adjust the dial yourself.

Now, looking at how compiled programming languages are mostly typed you may also ask yourself:

> "Wait, do types make my code faster?"

Not necessarily. Types are mainly there for predictability and safety. Many counter-examples exist: 

- **TypeScript** gives you safety but transpiles to plain old JavaScript. No speed boost.
- **Julia** lets you annotate types for multiple dispatch, but its JIT compiler does the heavy optimization lifting underneath. The annotations are mainly for your sanity, not for speed.

In the case of TypR, even though, in the future, types will help build faster code, their goal is more about data modeling and safety.

**Still confused about safety?**
No problem. We will look at four advantages of explicit types through examples. Each one will show errors you can run into with dynamically typed programming languages like R. Then we will see how more predictability can help reduce them. All examples and fixes are presented in pure R first then corrected with packages from the tidyverse. This way it is simple to understand (no new language to keep in mind). Here are the advantages of explicit typing:

1. **Errors you can see** before your code runs (or your user sees them).
2. **Fast feedback loops**: you find out you broke something in seconds, not hours.
3. **Error messages that make sense** and tell you where the problem lives.
4. **Better design habits**, because thinking in types forces you to decide what your code actually does before you write it.

## R examples

*(All of these use familiar tidyverse packages: dplyr, purrr, forcats, rlang.)*

### Tools to keep you safe

Think about your current workflow. Maybe use [**renv**](https://rstudio.github.io/renv/articles/renv.html) or [**uvr**](https://nbafrank.github.io/uvr/) to lock package versions so that updating ggplot2 for `Project A` doesn't nuke `Project B` (if you don't you might consider it for reproductibility). You run [**lintr**](https://lintr.r-lib.org/) or [**jarl**](https://jarl.etiennebacher.com/) so a robot scans your code for dodgy patterns. Maybe you even use [**styler**](https://styler.r-lib.org/) or [**Air**](https://posit-dev.github.io/air/) now to format your code automatically so you stop fighting with your collaborators about indentation.

If you don't know any of these projects, no worries, just take a look. They're amazing! The main idea is that all of these tools make your life easier by doing things for you so you don't need to pay attention to them (managing package dependencies, scanning or formatting code). That frees up a lot of mental space. 

None of that's AI. It's deterministic automation: you write the rules, the machine enforces them. Types are just the next logical step. They lock the *shape* of your data and the *contracts* of your functions so you can't accidentally break them.

### The long feedback loop

Here's a pattern I guarantee you've lived through. You start with a value and you get late an unexpected "NA".

In the example, you start with an integer, make some transformation, got back to another integer... except the code silently return a `NA` because we try to transform a whole sentence back to a number with `as.numeric`. Here it is a silly example that you won't probably ever do, but it generalize to many operation where you start with a type and theoretically ending with an expected type and something happen in the middle (could be a few lines or thousands). The most important thing is that the operation in the middle can take time, like seconds, minutes, hours or more (here represented by `Sys.sleep(6)` that wait 6 seconds). And for operation like that, we want to be sure that the rest of the code will works before running everything, otherwise we will keep losing time. Here's the example:

```r
user_count <- 42

Sys.sleep(6) # The long wait

final_report <- user_count |> 
  paste("Users since 2020:", ...=_) |> # makes it a character
  toupper() |> 
  as.numeric() # returns an NA
```

You wait. And wait. Maybe you make a coffee. Then, at the very end, you discover that `as.numeric()` silently coughed up `NA` and you missed the coercion warning somewhere in a wall of console output. The whole run is wasted, and that's not even the whole issue. Imagine using `final_report` later as a number (since you used `as.numeric()` to convert it). It will still return `NA`. By the time you realize it, you're already several lines further down and you have to go back step by step to find the issue.

The problem isn't just that it failed. It's *when* it failed and *how* it failed (here silently).

### Silent errors: the "quiet children" problem

It might be unexpected to you but, loud errors are your friends. A red message in the console tells you exactly where to look. The thing that should truly terrify you is the **silent error**: code runs, outputs look fine, and the result is completely wrong.

Here's a parenting analogy: noisy kids are annoying, but at least you know where they are and what they're doing. Silent kids are the ones who've figured out how to open the front door.

Silent failures come in two flavors:

1. *It doesn't do what you asked, and you only notice too late.*
2. *It changes something underneath you without telling you.* This is the worst one, and I'll show you why.

### The `ifelse()` trap

Base R's `ifelse()` is a master of quiet sabotage. Watch this:

```r
is_admin  <- c(TRUE, FALSE, TRUE)

label <- ifelse(is_admin, "3", 2)
label
#> [1] "3" "2" "3"
```

Notice that? The number `2` became the character `"2"`. Your vector *looks* okay. Then, three hundred lines later, in a file someone else wrote:

```r
label * 10
#> Error in label * 10: non-numeric argument to binary operator
```

The error message points at this innocent-looking multiplication. But the actual sin was committed way back at the `ifelse()` call, and R never told you. The error looks obvious, but that is only because you are looking at it with fresh eyes in a very short example where you expect an error. In a real setting, it is one of two thousand lines of code your tired eyes are screening through for four hours.

Now there is a better way. Compare that to `dplyr::if_else()` that gives an error:

```r
library(dplyr)

is_admin  <- c(TRUE, FALSE, TRUE)

label <- ifelse(is_admin, "3", 2)
label
#> [1] "3" "2" "3"

label <- if_else(is_admin, "3", 2)
#> Error in `if_else()`:
#> ! Can't combine `true` <character> and `false` <double>.
```

What's the difference between `ifelse` and `if_else`? The first one sees that there is both a character and a number, but since a vector can only be of one type, it decides that everything will be a character without telling you. `if_else` stops there and immediately tells you that you have to fix it instead of guessing. 

Yes, it's annoying that it refuses to run. **That refusal is the feature.** The bug is caught right where it's born, not 50 lines, three files or two weeks later.

### `sapply()` and the mystery return type

`sapply()` is a meta function that allows you to run a function across a list of elements. It is like `lapply()`, but instead of returning a list, it returns a vector (useful)... or a matrix if you are not careful. It's cute until it isn't. It "simplifies" its output, which sounds helpful, except the shape of that simplification depends entirely on your data. 

In the following example, we want to generate random numbers that follow a normal distribution with `rnorm()` (it could be another distribution). In the code, the `n` which decides the number of observations is normally set to `1`, which returns one value per interation that combines into a vector. 

```r
set.seed(7) # To get the same result each time, since it is random

result <- sapply(1:5, function(i) rnorm(n = 1))
#> [1]  2.2872472 -1.1967717 -0.6942925
#> [4] -0.4122930 -0.9706733

sum(abs(result))
#> [1] 5.561278
```

But the moment I make a mistake and put a value of `2` for `n` (a common mistake), then I get a matrix at the end (combinaison of vectors of lenght 2). The code won't tell me anything, and my `sum` is now too big (too many numbers summed).

```r
set.seed(7) # To get the same result each time, since it is random

result <- sapply(1:5, function(i) rnorm(n = 2))
#>            [,1]       [,2]      [,3]
#> [1,] -0.9472799 -0.1169552 2.1899781
#> [2,]  0.7481393  0.1526576 0.3569862
#>          [,4]      [,5]
#> [1,] 2.716752 0.3240205
#> [2,] 2.281452 1.8960671

sum(abs(result))
#> [1] 11.73029
```

Same function call, totally different return type. Code downstream that expected a vector now misbehaves silently.

The purrr package fixes this by making the contract explicit and failing when the shape isn't respected. The `map()` function works like `lapply()`, but you can also specify the type of the output using a variant of the function (e.g., `map_int()`, `map_chr()`, etc.). Here we use `map_dbl()` since `rnorm()` generates floating numbers. It will consider it to be a vector and fail when it is not the case. So we know something is wrong even before running the `sum()` function (that could happen several lines later).

Here it works with `n=1`, like `sapply`:

```r
library(purrr)

set.seed(7) # To get the same result each time, since it is random

map_dbl(1:5, function(i) rnorm(n = 1))
#> [1]  2.2872472 -1.1967717 -0.6942925
#> [4] -0.4122930 -0.9706733
```

When `n=2` it "fails" since it doesn't return the right shape (a vector), but a matrix. Good, it won't surprise us later:

```r
library(purrr)

set.seed(7) # To get the same result each time, since it is random

map_dbl(1:5, function(i) rnorm(n = 2)) 
#> Error in `map_dbl()`:
#>   ℹ In index: 1.
#> Caused by error:
#>   ! Result must be length 1, not 2.
```

That's one type of error, but we could have created a function that returns the wrong type. If you pick the wrong type, `map_dbl()` tells you, contrary to `sapply()`. For instance, imagine we change the result type to character by mistake inside the function using `as.character()`. `sapply()` happily returns a charcter vector:

```r
set.seed(7) # To get the same result each time, since it is random

sapply(1:5, function(i) as.character(rnorm(n = 1)))
#> [1] "2.28724716134052"   "-1.19677168222235" 
#> [3] "-0.694292510435459" "-0.412292951136803"
#> [5] "-0.970673341119483"
```

But `map_dbl()` tell us the wrong type was returned. Good, we can then correct the function:

```r
library(purrr)

set.seed(7) # To get the same result each time, since it is random

map_dbl(1:5, function(i) as.character(rnorm(n = 1)))
# Error in `map_dbl()`:
#   ℹ In index: 1.
# Caused by error:
#   ! Can't coerce from a string to a double.
```

It looks like an obvious mistake, but it can happen in more complex and less obvious ways. To put it bluntly, whenever a function becomes complex you run into this risk. That's why explicit types win here. You don't need to worry about it; the system protects you. The typed variants don't guess. They promise, and they enforce.

### forcats: don't grep into the void

One last example. You have a factor with known levels, and you need to check membership. If you check with a classical text function like `grepl()`, `str_detect()`, or `%in%`, you might be under the impression that it works as well as `fct_match()`, which is specialised for factors. For instance, trying to detect if "medium" is one of the levels:

```r
library(stringr)
library(forcats)

statuses <- factor(c("low", "medium", "high", "low"))
#> [1] low    medium high   low   
#> Levels: high low medium

"medium" %in% statuses
#> [1] TRUE

grepl("medium", statuses) |> any()
#> [1] TRUE

str_detect(statuses, "medium") |> any()
#> [1] TRUE

fct_match(statuses, "medium") |> any() 
#> [1] TRUE
```

However, problems arise when we make a mistake in the search, for instance writing "medum" instead of "medium". All text-based approaches will simply tell us that this level does not exist, which is correct. However, they won't tell us that it's because we wrote it wrong. String functions are happy to search for substrings or exact matches even when your mental model says "only these three values are legal." forcats keeps you inside the factor's declared possibilities. Only `fct_match()` will throw an error message:

```r
library(stringr)
library(forcats)

statuses <- factor(c("low", "medium", "high", "low"))
#> [1] low    medium high   low   
#> Levels: high low medium

"medum" %in% statuses
#> [1] FALSE

grepl("medum", statuses) |> any()
#> [1] FALSE

str_detect(statuses, "medum") |> any()
#> [1] FALSE

fct_match(statuses, "medum") |> any() 
#> Error in `fct_match()`:
#> ! All `lvls` must be present in `f`.
#> ℹ Missing levels: "medum"
```

Just in case you don't understand how it is possible to search for a level that doesn't exist, here is an example where we remove the value "medium" from `statuses`, which doesn't remove the **level** from the variable.

```r
statuses
#> [1] low    medium high   low   
#> Levels: high low medium

statuses[-2]
#> [1] low  high low 
#> Levels: high low medium

fct_match(statuses[-2], "medium") |> any() # the level exists, not the value
#> [1] FALSE
```

## Error messages that don't make you cry

If you are using a recent version of tidyverse for this tutorial or your usual work, you have probably realized that warning and error messages are richer now. This is thanks to the rlang package. Here's what rlang has given us, and it's genuinely great:

```r
library(dplyr)

mtcars$cyl <- NULL
mtcars |> count(cyl)
#> Error in `count()`:
#> ! Must group by variables found in
#>   `.data`.
#> ✖ Column `cyl` is not found.
```

Look at that: **which function failed, which argument, and what you probably meant to do.** Compare it to base R's one-liners, which tell you approximately nothing. rlang (from the tidyverse team) built this infrastructure, and we all benefit. 

Types will lead to even better messages: when the system knows what something *should* be, it can tell you *what it got instead* and *where you made the promise*.

## Better design happens whether you plan it or not

Thinking in types isn't just about catching bugs. It forces you to answer three questions before your fingers hit the keyboard:

- What goes in?
- What comes out?
- Who is going to use this?

That's designing, not just typing. In our [TypR philosophy](/docs/philosophy/intro) we call this "clean data science code by design, not by effort." 

"By effort" means you're holding all the rules in your head, burning mental energy that could go toward the actual science. "By design" means the language holds the rules for you.

## So where does this leave us?

The automatic transmission was always coming to R. You just didn't notice the milestones:

- **renv** locked your dependencies.
- **lintr** and **Air** enforced style without being annoying about it.
- **dplyr**, **purrr**, and **forcats** were letting you offload the rules about data shapes to the machine.

TypR just builds that transmission into the engine itself.

If you're writing packages, Shiny apps, or long pipelines that need to survive the next grant cycle, TypR is your insurance policy against future-you's unreliable memory. And if you're just throwing together a quick exploration in a notebook? Leave the types off. TypR genuinely doesn't mind. You can dial the safety up or down as you need it.
