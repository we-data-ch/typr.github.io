rescale <- function(data) {
  data / c(1, 2, 4)
}

rescale(c(5, 4, 8))   # 5.0  2.0  2.00
rescale(c(5, 2))      # 5.0  1.0  1.25
# A third value from nowhere, and only a
# warning that is easy to miss.
