# Vectorization by design
 
## Introduction
Vectorization is one of the greatest tools for data manipulation I know and I am happy that R got this system out of the box. It makes computation simple and simplifies translation from formula to code.

Unfortunately I have encountered one limitation: R's vectors are not very compatible with functional programming or object-oriented programming, two paradigms I like when building libraries or applications. This is what TypR's vectorization is improving with the mechanism of `lifting-based vectorization`.

<!-- truncate -->

### Quick start: vectors and arrays in TypR

Before diving into the details, here is a quick look at how vectors and arrays work in TypR. Both support vectorized arithmetic out of the box:

```typr
# Creating typed vectors and arrays
let v1 <- c(1, 2, 3, 4, 5);
print(2*v1+3);

let a1 <- [1, 2, 3, 4, 5];
print(2*a1+3);
```

The `c()` constructor creates a classic R vector, while the bracket notation `[...]` creates a TypR array. Both support element-wise operations like `2*v1+3`, which multiplies each element by 2 and adds 3. The difference becomes more apparent with custom types, as we will see below.

---

## A complete example: the Point type

Throughout this section, we will construct a concept of a 2D geometric point. A point is a mathematical object that has x and y coordinates. We will use the S3 system from R for illustration and then use TypR's type system.

## Vectorization with R

As I said, R makes it pretty easy to vectorize primitive types like integers or characters. 

```r
# building a vector
v <- c(1, 2, 3, 4)

# Now we can multiply with a number or add a number
3*v + 4
#[1]  7 10 13 16
```

### Point construction
But what happens if we define a Point type?

```r
# Point type creation with S3 (without validation for simplicity)
Point <- function(x, y) {
  structure(
    list(x = x, y = y),
    class = "Point"
  )
}
```

We will also define a print method to make a point easier to visualize.

```r
print.Point <- function(p, ...) {
  cat("Point<", p$x, ",", p$y, ">\n", sep="")
  invisible(p)
}
```

So we have our Point type!

```r
Point(3, 4)
#Point<3,4>
```

And we will define a `scale` method to scale a point with a number. It will multiply each coordinate with this number.

```r
scale.Point <- function(p, n) {
	Point(p$x*n, p$y*n)
}
```

It's now functional!

```r
# we can use it this way
scale(Point(3, 4), 2)
#Point<6,8>

# or this way
Point(3, 4) |> scale(2)
#Point<6,8>
```

A little bonus: we will also supercharge the `*` operator for the Point class so scaling can be done using right multiplication with a number.

```r
# Definition of the multiplication operator for Point 
`*.Point` <- function(p, n) {
	scale(p, n)
}

# Now this works
Point(3, 4) * 2
#Point<6,8>

# But the other way around doesn't work
2 * Point(3, 4)
#Error
```

### Point vectorization
But what if we want a vector of Point?

```r
points <- c(Point(1, 2), 
			Point(3, 4), 
			Point(5, 6))

points

#$x
#[1] 1
#
#$y
#[1] 2
#
#$x
#[1] 3
#
#$y
#[1] 4
#
#$x
#[1] 5
#
#$y
#[1] 6
```

The vector of points loses its structure! We can't access it as expected:

```
points$x
#[1] 1

points$y
#[1] 2

points[1]
#$x
#[1] 1
```

To make a vector of points, we have to store them in a list. In R, a list is a vector of pointers so one can save any structure with them.

```r

points <- list(Point(1, 2), 
			Point(3, 4), 
			Point(5, 6))


points
#[[1]]
#Point<1,2>
#
#[[2]]
#Point<3,4>
#
#[[3]]
#Point<5,6>
```

But we aren't keeping the capability of using native vectorial operations anymore.

```r
# works well
points[[1]]
#Point<1,2>

scale(points, 2)
#Error

points$x
#NULL

points$y
#NULL
```

It's better to directly use vectors inside an S3 object but you have to do some gymnastics for that.
Because of that, developers should keep in mind they should manually apply vectorization while building functions for objects or functions (which is a mental load by itself).

## What about TypR?

I'm glad you asked!

TypR uses its own vectorization system named `lifting-based vectorization`. This concept exploits the type system of TypR to infer when to apply vectorization.

> The best way to use vectorization is not to think about vectorization.

The developer just has to write their functions for scalar values and TypR will decide when to lift the parameters and the function into a vectorial computation based on how the function is used. It's also compatible with more complex types like named lists or functions. 

### Point construction
Let's build our `Point` type and a constructor with TypR:

```typr
# Type definition
type Point <- {
	x: int,
	y: int
};

# Constructor for the Point type
let new_point <- fn(x: int, y: int): Point {
	list(x = x, y = y)
};
```

We will also define a `print` function for points:

```typr
# print function
let print <- fn(p: Point): Empty {
  cat("Point<", p$x, ",", p$y, ">", sep="");
  invisible(p);
};
```

Now we can build a point like before:

```typr
new_point(3, 4)
#Point<3,4>
```

We won't forget to implement the `scale` function.

```typr
let scale <- fn(p: Point, n: int): Point {
	new_point(p$x * n, p$y * n)
};

new_point(3, 4) 
	|> scale(2)
#Point<6,8>
```

Of course, we also have the capability of implementing the `*` operator:

```typr
let `*` <- fn(p: Point, n: int): Point {
	scale(p, n)
};

new_point(3, 4) * 2
#Point<6,8>
```

### Point vectorization
Now what about vectors? TypR has its own way to deal with them. For better understanding, let's make a vector of points:

```typr
# creating a vector of points in TypR
let points <- [new_point(1, 2), 
			new_point(3, 4), 
			new_point(5, 6)];

points
#typed_vec [3]
#[1] Point<1,2>
#[2] Point<3,4>
#[3] Point<5,6>
```

We have an array notation syntax like other programming languages. This kind of array automatically exploits the print function for its members.

What's the best part? *TypR's arrays are vectorized by default*! So these operations work:

```typr
# scaling a group of point with one number
scale(points, 2)
#typed_vec [3]
#[1] Point<2,4>
#[2] Point<6,8>
#[3] Point<10,12>

# same but with pipe
points 
	|> scale([1, 2, 3])
#typed_vec [3]
#[1] Point<1,2>
#[2] Point<6,8>
#[3] Point<15,18>

# same but with the "*" operator
points * 3
#typed_vec [3]
#[1] Point<3,6>
#[2] Point<9,12>
#[3] Point<15,18>
```

We also have the possibility to work with types by themselves. Let's define the `+` operator that will help adding two points by adding their respective fields.

```typr
# Definition of the "+" operator
let `+` <- fn(p1: Point, p2: Point): Point {
	new_point(p1$x + p2$x, p1$y + p2$y)
};

# adding a group of point with a scalar
points + new_point(1, 1)
#typed_vec [3]
#[1] Point<2,3>
#[2] Point<4,5>
#[3] Point<6,7>

# adding two group of point of the same type
points + points
#typed_vec [3]
#[1] Point<2,4>
#[2] Point<6,8>
#[3] Point<10,12>
```

And what about reduction functions? One can use the `reduce` function to reduce the elements of the array.

```typr
# will add all the points
reduce(points, `+`<Point>)
#Point<9,12>
```

We specify the type \<Point\> for the `+` operator because TypR's type system isn't doing this kind of inference yet. But as you can see, it summed all elements of points. One can also use a shortcut by using the `sum` function:

```typr
points
	|> sum()
#Point<9,12>
```

It automatically uses the `+` operator underneath. If your type implements it, `sum` will work on the vector.

And for functions? We can also do function composition powered by vectors. I won't present examples there but later in another publication.

## Future works

### Type specific applications
I would like to create vectorized field accessors to make it easier to work with a vector of named lists:

```typr
# will give all the values contained in the x field of each point
points$x
# will give all the values contained in the y field of each point
points$y
```

It would also be cool to be able to call similar functions with the same parameters. 
```typr
# vector of functions
let functions <- [`+`, `*`];

functions(3, 4)
# could return:
#typed_vec [3]
#[1] 7
#[2] 12
```

It could help with applying a set of statistical models to a specific set of data.

### Compatibility with other systems

Underneath, TypR's arrays use a custom S3 object for data storage and vectorization. This doesn't invalidate native vectors or data.frames from R, which are faster and more efficient. I want to create a bridge that will help convert them back into native types.

```typr
# In the future, Array -> Vector for performances
let arr <- [1, 2, 3, 4];
let vec <- arr |> to_vec();

# In the future, Array -> dataframe for performances
let df <- points |> to_df();
```

## Conclusion

Even though lifting-based vectorization looks like reinventing the wheel, I truly believe it's a true conceptual heir of the classic way of doing vectorization and a logical continuation of it if R was a typed language.

Now the responsibility of vectorizing functions is no more in the hands of the developer who can now focus on solving the problem. TypR offers a flexible interface to works with vectors.
