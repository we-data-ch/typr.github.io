---
description: "How language changes are decided in TypR: the RFC process, where proposals live, and what makes one convincing."
---

# Design Proposals

> A language is the sum of the decisions taken about it. TypR keeps those
> decisions written down, in the open, next to the compiler — so that "why does
> TypR do it this way?" has an answer six months later, and so that the answer
> can be argued with before it is set in code.

<!-- truncate -->

## Three doors, not one

Not everything needs a proposal. Most changes to TypR are the compiler catching
up with what the documentation already promises, and those are ordinary bug
reports.

| What you have | Where it goes |
|---|---|
| A snippet the compiler mishandles | a [GitHub issue](https://github.com/we-data-ch/typr/issues) |
| An idea that is not precise yet | [Discussions → Ideas](https://github.com/we-data-ch/typr/discussions/categories/ideas) |
| A change to what the language *means* | an **RFC** |

The dividing line is worth stating exactly, because it is the one that decides
which door you take:

> If the answer to **"what does TypR do here?"** changes, it is an RFC.
> If the compiler is catching up with an answer that was already given, it is an
> issue.

New syntax, a new typing rule, a different shape of generated R, a change to the
CLI or the project layout, or removing anything at all — those change the answer.
A crash, a wrong error message, a case the type checker gets backwards — those do
not.

## How a proposal moves

Proposals live in [`rfcs/`](https://github.com/we-data-ch/typr/tree/develop/rfcs)
in the compiler repository, not in this documentation site: they are reviewed
like code, because that is what they become.

1. The idea is floated in **Ideas**. Most objections surface there in a day,
   which is faster than discovering them on the second read of a finished text.
2. The author copies `rfcs/0000-template.md` and opens a pull request. The
   discussion happens **in the pull request**, where comment threads land on the
   actual sentences.
3. The PR carries a label — `rfc-draft` while it is being revised, then
   `rfc-accepted` or `rfc-rejected`.
4. An accepted RFC is renamed with its pull request's number and merged. A
   declined one is closed, and its text and the reasoning stay readable in the
   closed PR — that record is the point of the process, not a by-product of it.

Which means the directory *is* the set of accepted proposals, and nothing has to
be maintained by hand to know where things stand:

- **Accepted** — [the `rfcs/` directory](https://github.com/we-data-ch/typr/tree/develop/rfcs)
- **Under discussion** — [open PRs labelled `rfc-draft`](https://github.com/we-data-ch/typr/pulls?q=is%3Apr+is%3Aopen+label%3Arfc-draft)
- **Declined** — [closed PRs labelled `rfc-rejected`](https://github.com/we-data-ch/typr/pulls?q=is%3Apr+is%3Aclosed+label%3Arfc-rejected)

## Accepted is not shipped

Merging an RFC settles the design, not the schedule. Nobody is assigned by the
merge, and an accepted proposal can sit unimplemented for a long time.

Each accepted RFC carries a header saying where it stands — its pull request, its
tracking issue, and the version it shipped in, or `not yet`. That last field is
the one to read before building on a feature you found in `rfcs/`: the proposal
being merged means the design was agreed, not that the compiler does it.

When it does ship, the documentation lands with it. The example blocks on this
site are compiled against the real `typr` binary in CI, so a page describing a
feature that does not exist yet fails the build — which is the intended order.

## What makes a proposal convincing

TypR's constraints are not a general language's, and a proposal that ignores them
tends to be a proposal for a different language:

- **The output stays plain, readable R.** No runtime, no companion library
  shipped with the generated code, nothing an R user reading `R/` cannot follow.
- **R that already works keeps working.** TypR is a superset. A superset that
  keeps breaking its base is a dialect.
- **Say what happens without annotations.** Typing here is a dial, not a switch,
  so a design has to answer for the unannotated version of the code, not only the
  fully typed one.
- **Error messages are part of the design.** A rule whose violation cannot be
  explained in three lines is usually the wrong rule.
- **Show the generated R.** Two designs that type-check identically can produce
  very different R, and that difference is often the actual decision.

## Where this fits

TypR is developed openly but it is not developed by a committee: it comes out of
a master's thesis and a small team, and a lot of its design reasoning already
exists as working notes. The RFC process is how those notes become public and
arguable, one question at a time — not a gate placed in front of contributors.

If you disagree with something on the [Philosophy](intro.md) pages, that
disagreement is exactly what an RFC is for. Start it in
[Ideas](https://github.com/we-data-ch/typr/discussions/categories/ideas), and see
[`rfcs/README.md`](https://github.com/we-data-ch/typr/blob/develop/rfcs/README.md)
for the full process and the template.
