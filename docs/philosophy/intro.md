# Philosophy

## Freedom vs Safety

![freedom vs safety](/img/freedom_safety2.png)

Freedom and safety each have their own advantages and disadvantages. The fundamental challenge is that we cannot maximize both simultaneously. We experienced this tension during the COVID-19 pandemic with measures like lockdowns, masks, and vaccination requirements.

This same trade-off exists in programming languages. Consider R and Rust, two of my favorite languages that are drastically different. R advocates for freedom and flexibility, while Rust prioritizes safety. Consequently, they excel in different use cases: R shines in experimentation, data exploration, and visualization, while Rust is ideal for software development and high-performance applications. This doesn't mean they can't perform each other's tasks, but they won't be as efficient when doing so.

Between strict and permissive languages lies a category of gradually typed languages. These languages allow developers to add types progressively, defining them only when needed. Python (with type hints) and TypeScript exemplify this flexibility. TypR also possesses this property, giving developers the capacity to adjust the balance between freedom and safety. Of course, this doesn't mean TypR is intended to replace R, but rather to work alongside it.

```typr
# a valid TypR code: strong on safety, weak on freedom
let num1: int <- 3;
let num2: int <- 7;

let my_addition <- fn(a: int, b: int): int {
	a + b
};

my_addition(num1, num2)
```

```typr
# Also a valid TypR code: weak on safety, strong on freedom
let num1 <- 3;
let num2 <- 7;

let my_addition <- function(a, b) {
	a + b
};

my_addition(num1, num2)
```

## Code by design vs code by effort

> Create clean data science code by design, not by effort.

Creating correct code and creating clean code are independent things. A correct code is a code that fulfill it's purpose while clean code make the project maintainable and scalable for the long run.

R is great at making correct code for research purpose. But it doesn't give the set of tools needed to make clean code easely, letting package developper holding the responsibility of doing clean code by effort.

"By effort" also mean there is a mental load taking brain resources that could be used for other things directly related to the goal.

That's why TypR deliver a group of tools to make package and app developpment easier. It also tend to make maintenance and scalability painless. That's why it favor clean code by design. 

## 1. Smart functions by design

Building package for other users can be hard since we need to know how to expose functionalities to them. Fortunately, with TypR, you don't have to worry wich OO System you want (S3, S4, R6, S7) or if you just want to build vanilla code with functions. The main principle is simple:

> All you need are types and functions.

Coding is now about designing your data types and how you manipulate them with function. TypR will handle the rest.

A great example of it's power lies in the capability of simple function to work with vectorized data throug [lifting-based vectorization](https://we-data-ch.github.io/typr.github.io/docs/philosophy/vectorization_by_design).

Another example that show how function work for us is a concept called [uniform function call](https://en.wikipedia.org/wiki/Uniform_function_call_syntax). You will understand it's power through examples.

By using the power of uniform function call, you have different ways to call your functions (classic, piping, method call). This functionality also support single dispatch and transpile to native S3 code.

