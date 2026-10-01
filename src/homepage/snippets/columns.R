sales <- data.frame(
  revenue = c(100, 200, 300),
  region  = c("N", "S", "E")
)

vat <- sales$reveneu * 0.21
# `sales$reveneu` is NULL, so vat is
# numeric(0): no error, no warning.
