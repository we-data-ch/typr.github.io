set_alpha <- function(alpha) {
  stopifnot(
    is.numeric(alpha),
    length(alpha) == 1,
    alpha >= 0,
    alpha <= 1
  )
  alpha
}

set_alpha(1.5)
# Four lines of checks, and they only
# fire when this call finally runs.
