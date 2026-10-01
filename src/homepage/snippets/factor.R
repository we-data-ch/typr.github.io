scores <- factor(c("1", "2", "3"))

weighted.mean(scores, c(0.2, 0.3, 0.5))
# A warning, then NA: scores looks like
# numbers, but it is not numeric.
