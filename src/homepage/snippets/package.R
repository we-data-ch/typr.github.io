summarise_sales <- function(sales, region) {
  # What is `sales`? A list? A data.frame?
  # What comes back? A number? A vector?
  # Only the body knows, and only at run time.
  sum(sales$amount[sales$region == region])
}
