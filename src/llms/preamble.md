TypR is a statically typed language that compiles to plain R. Programs are
checked before they run — types, records, sum types, interfaces, modules — and
the compiler emits ordinary, readable `.R` files that depend on no runtime
library.

If you are an assistant writing TypR: TypR is **not** R, and it is not Julia,
even though it borrows from both. Guessing produces code that does not compile.
Treat the documentation as the authority, and when it does not answer a
question, say so rather than inventing syntax.

Code fences follow the conventions of the documentation site:

- a `typr` fence is a complete program, checked in CI against the real compiler
  (`typr check`) — it compiles;
- `typr compile_fail` marks a deliberate counter-example; CI checks that the
  compiler *rejects* it. Never present it as valid TypR;
- `typr noplayground` marks a fragment, a syntax table or a multi-file project:
  not a complete program, and not compiler-checked;
- an `r` fence is plain R, shown for comparison or as transpiler output.

Examples are self-contained: when a snippet needs definitions introduced earlier
on the page, they are repeated in a leading `# --- setup, ... ---` preamble.

Pages are ordered by Diátaxis genre — getting started and FAQ, then tutorials
(learning by doing), how-to guides (task recipes), reference (the authoritative
description of the language), then philosophy and deep dives (why the language
is the way it is).

The compiler is the last word: <https://github.com/we-data-ch/typr>. The syntax
map at <https://github.com/we-data-ch/typr.github.io/blob/main/syntaxe.md> wins
over any page below if the two ever disagree.
