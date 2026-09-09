server <- function(input, output) {
  team <- reactive(fetch_members(input$team_id))

  output$roster <- renderTable({
    # Which columns does `team()` have?
    # Grep the whole app, or run it and find out.
    team()[team()$active, ]
  })
}
