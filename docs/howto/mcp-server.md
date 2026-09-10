---
sidebar_position: 7
title: Connect an AI assistant via MCP
description: "Give Claude Code, Claude Desktop, Cursor or any MCP client direct access to the TypR compiler, so it checks its own generated code instead of guessing."
---

# Connect an AI assistant via MCP

[FAQ #33](/docs/faq#33-how-do-i-get-an-ai-assistant-to-write-correct-typr) covers
the first step: feed your assistant `llms.txt`/`llms-full.txt` so it knows the
*syntax*. That fixes what the assistant writes. It does not fix what happens
after — an assistant that only reads Markdown still has to guess whether the
code it produced actually compiles, or wait for you to paste an error back.

`typr mcp` closes that loop. It runs the compiler itself as an
[MCP](https://modelcontextprotocol.io) server over stdio, so the assistant can
call `check`/`build` directly and see real diagnostics — the same ones `typr
check` would print — without shelling out or parsing terminal output.

## 1. Make sure `typr` is on your `PATH`

```bash
typr --version
```

If that fails, follow the [installation guide](../reference/installation.md)
first (`cargo install TypR` gets you a `typr` binary on `PATH`).

## 2. Point your MCP client at it

Add a `typr` server to your client's MCP configuration — for Claude Code or
Claude Desktop, that is the `mcpServers` block:

```json
{
  "mcpServers": {
    "typr": {
      "command": "typr",
      "args": ["mcp"]
    }
  }
}
```

Building from a local checkout of the compiler instead of installing it? Point
`command` at the built binary directly, e.g. `target/debug/typr` or
`target/release/typr`.

## 3. What the assistant gets

| Tool | What it does |
|---|---|
| `check` | Type-checks TypR source in-process, returns `{ok, diagnostics[{code, message}]}` with stable `T0xx` (type errors) / `S0xx` (syntax errors) codes |
| `build` | Same as `check`, plus the transpiled R code (`r_code`) — produced even when there are type errors, so the assistant can inspect a best-effort translation while it fixes them |

Both tools run without a filesystem or a project directory: no `.typr_cache`,
nothing written to disk. That also means they only see the source you pass
them — for project-wide context (existing modules, types defined elsewhere)
the assistant still needs the files themselves, the same as any other editing
task.

## Why not just tell it to run `typr check` in a terminal?

You can — nothing above is required. MCP mainly saves the round trip: the
assistant gets structured diagnostics back in the same turn instead of
shelling out and re-parsing text output, which matters most in agentic
workflows that check-and-fix in a loop. If your client does not support MCP,
a terminal-based assistant with `typr check`/`typr build` available works the
same way, just one step slower.

## The two together

`llms.txt` teaches the syntax; `typr mcp` verifies the result. Give an
assistant both and the loop closes: it writes TypR informed by the real
grammar, checks it against the real compiler, and reads back real error
codes instead of inventing plausible-looking ones.
