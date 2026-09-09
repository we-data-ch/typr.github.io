report <- function(sales) {
  sales |>
    lapply(function(s) s$amount) |>
    unlist() |>
    sum()
}

# `amount` came out of a CSV, so it is character.
# This returns NA, silently, at run time.
