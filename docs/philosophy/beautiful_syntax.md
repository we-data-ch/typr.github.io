# The beauty of syntax

Even though `TypR` is based on `R`, it has some quirks that make it a bit different from its counterpart. Some may look negative but others are just beautiful (my own perspective).

## The little down side

The `;` is now mandatory so people can have a better syntax. It can look painful at the beginning but people will be able to put it as a reflex like the `.` at the end of a sentence written in human language. 

There is no more `.` in the naming convention.
People could no more use `.` in the name of their types or functions. If you want to reuse existing R function that use `.` you can just replace it with `__`

```typr noplayground
# not allowed
data.frame(...) 

# works and call the native `data.frame`
data__frame(...) 
```

## Booleans!

Now `true` and `false` are admitted boolean notations. Of course `TRUE` and `FALSE` still exist with `T` and `F`.

```typr noplayground
# all valid
TRUE
T
true

# all valid
FALSE
F
false
```

## Better pipelines

I love the fact that R has a pipeline syntax. Unfortunately it's not as elegant as we want. A pipeline within R generally looks like this:

```r
data |> f1() |>
	f2() |>
	f3() |>
	f4() |>
	f5()
```

With TypR the elegance takes place now one can build more beautiful pipelines like this:

```typr noplayground
data 
	|> f1()
	|> f2()
	|> f3()
	|> f4()
	|> f5()
```

It does exactly the same thing. The difference is the elegance and the readability. 

## Array notation

One key point of TypR is its built-in vector orientation. It was an interesting challenge to build a type system that implements this design (see [vectorization by design](/docs/philosophy/vectorization_by_design) for more details).

To build a vector in R, you just have to use:

```r
c(1, 2, 3)
```

With TypR we now have the array notation `[]` to build vectors. 

```typr
[1, 2, 3]
```

Compared to `c()`, one can only put side by side elements of the same type without type coercion. I think it makes things more elegant since we have an expected behavior powered with type checking.

## Uniform function call

For those who have the nostalgia of the OOP notation. We have the uniform function call.

```typr noplayground
data 
	|> f1()
	|> f2()
	|> f3()
	|> f4()
	|> f5()
```

```typr noplayground
data 
	.f1()
	.f2()
	.f3()
	.f4()
	.f5()
```

For some, it's simpler and more ergonomic. It goes along with the philosophy of TypR since each function will become an R S3 method by default (so it is still OOP).

## Beautiful Type Constructor

With TypR, one can have better distinction with the help of constructors.

```r
# classic list constructor in R
list(
	a = 8L, 
	b = 12
)
```

We still keep the original syntax but we had another syntax.

```r
# classic list constructor in TypR
:{
	a = 8L, 
	b = 12
}
```

In R, lists are the equivalent of records in other languages.

One can create some personalized lists within the code with the help of a custom list type. You define an alias that targets a list type and you can use this alias to build other types.

```typr
# Define an alias other a list type
type Person <- list {
	name: char,
	age: int
};
```

```typr
# You can use the alias as a constructor
Person:{ 
	name: "Anna", 
	age: 28
};
```

You can also do the same with union type.

```typr noplayground
# Build an union type
type PersonOrInt <- Person | int;

# You can use the alias to build the 
# elements with their own constructor
# Useful for autocompletion
PersonOrInt.7;
PersonOrInt.Person:{name: "Bob", age: 12};
```

## Partial function application

Currying is one of the most powerful elements of functional programming. Languages like haskell do it well. But to be more practical, it's better to be able to pick which parameter to fix with a defined value.

```typr noplayground
# Create a function
let add <- fn(a: int, b: int): int {
	a + b
};

# Create other function from it
# by fixing some parameters
let add_b <- \add(a: 10);
let add_a <- \add(b: 10);

# All can be used
add(3, 5);
add_b(4);
add_b(2);
```
