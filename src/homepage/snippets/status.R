label <- function(customer) {
  switch(customer$status,
    active = "Active",
    closed = "Closed"
  )
}

label(list(status = "pending"))
# No match: returns NULL, invisibly.
