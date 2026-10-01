# Installation

> Install the TypR compiler with one command on Linux, macOS or Windows, and verify it works.

TypR installs with **one command**. No Rust, no Docker, no manual download —
the script fetches the right binary for your machine, checks its SHA-256
checksum, and puts it in your user folder. It never asks for administrator
rights.

Just want to look around first? [Try the playground](https://we-data-ch.github.io/typr-playground.github.io/)
in your browser — nothing to install.

## 1. Install TypR

### Linux and macOS

Open a terminal and run:

```bash
curl -fsSL https://we-data-ch.github.io/typr.github.io/install/install.sh | sh
```

The binary lands in `~/.local/bin`. On Linux you get a statically linked
(musl) build that starts on Rocky 9, Debian 12, Ubuntu 22.04, Alpine and
anything more recent — no glibc requirement.

### Windows

Open PowerShell (it ships with Windows 10 and later) and run:

```powershell
irm https://we-data-ch.github.io/typr.github.io/install/install.ps1 | iex
```

The binary lands in `%LOCALAPPDATA%\Programs\typr`, which is added to your
user `PATH`. PowerShell may warn that the script is unsigned: check that the
address is the one above, then confirm.

### Prefer a package manager?

| Tool | Command | Systems |
|---|---|---|
| Homebrew | `brew install we-data-ch/typr/typr` | macOS |
| WinGet | `winget install we-data-ch.TypR` | Windows |
| Scoop | `scoop bucket add typr https://github.com/we-data-ch/scoop-bucket``scoop install typr` | Windows |

Updates then go through the same tool (`brew upgrade typr`,
`winget upgrade we-data-ch.TypR`, `scoop update typr`).

## 2. Check that it works

Open a **new** terminal (so the updated `PATH` is picked up) and run:

```bash
typr --version
```

It should print a version number. If it says `typr: command not found`, see
[Troubleshooting](#troubleshooting).

Then head to [Getting started](/docs/intro), or install your
[editor integration](./editor-setup).

## 3. Install R

TypR compiles to R, so you also need a recent version of **R** to run the
result. If you don't have it yet, follow
[this guide](https://rstudio-education.github.io/hopr/starting.html) (it covers
RStudio too).

## Options

Both scripts take the same options.

| Option | Effect |
|---|---|
| `--version vX.Y.Z` | install a specific release instead of the latest |
| `--channel beta` | install the latest prerelease |
| `--dry-run` | print what would happen, download nothing |
| `--gnu` | Linux and macOS only: glibc build instead of musl |
| `--help` | show the script's help |

To pass an option to the shell script, add `-s --` after `sh`:

```bash
curl -fsSL https://we-data-ch.github.io/typr.github.io/install/install.sh | sh -s -- --version vX.Y.Z
```

Substitute the tag you want — the ones published are listed on the
[releases page](https://github.com/we-data-ch/typr/releases). Leaving the option
off installs the latest one, which is what you want unless you have a reason.

On PowerShell the options are spelled `-Version`, `-Channel`, `-DryRun` and
`-Gnu`. They cannot be forwarded through `irm … | iex`, so download the script
first and run it as a file:

```powershell
irm https://we-data-ch.github.io/typr.github.io/install/install.ps1 -OutFile install.ps1
.\install.ps1 -Version vX.Y.Z
```

Two environment variables work with both scripts:

| Variable | Effect |
|---|---|
| `TYPR_INSTALL_DIR` | install into this folder instead of the default |
| `TYPR_INSTALL_VERIFY=0` | skip the SHA-256 check (only to diagnose a network problem) |

## What the script does to your machine

- Downloads the archive for your system from the
  [GitHub release](https://github.com/we-data-ch/typr/releases) and verifies it
  against the release's `checksums.txt`. It stops if the checksum is missing or
  malformed.
- On Linux and macOS, writes **only** `~/.local/bin/typr`. It does not edit
  your shell profile: if `~/.local/bin` is not already on your `PATH`, it
  prints the exact line to add to `~/.profile` or `~/.zshrc`.
- On Windows, writes the binary and adds its folder to your user `PATH` in the
  registry.
- Removes its temporary download folder, on success and on failure.

To uninstall, delete the `typr` binary (and, on Windows, its folder from your
`PATH`), or use your package manager's uninstall command.

## Other ways to install

### Download a release by hand

Binaries for Windows, macOS and Linux (x86_64 and aarch64) are on the
[release page](https://github.com/we-data-ch/typr/releases/latest), next to a
`checksums.txt`. To verify an archive yourself:

```bash
curl -fsSLO https://github.com/we-data-ch/typr/releases/latest/download/checksums.txt
grep "x86_64-unknown-linux-musl.tar.gz" checksums.txt
sha256sum typr-*-x86_64-unknown-linux-musl.tar.gz
```

The two hashes must match.

### With Cargo (Rust)

If you already have Rust:

```bash
cargo install typr
```

### With Docker

```bash
docker pull fabricehategekimana/typr:latest
docker run -it --rm -v $(pwd):/workspace fabricehategekimana/typr:latest
```

## Troubleshooting

**`typr: command not found`** — the install folder is not on the `PATH` of
this terminal. Open a new terminal; on Linux and macOS, if it still fails, add
the line the installer printed to `~/.profile` or `~/.zshrc`. You can always
run `~/.local/bin/typr` directly.

**`GLIBC_2.39 not found`** — you are running an older, glibc-linked build.
Re-run the install command without `--gnu`: the default build is static and has
no glibc requirement.

**The download fails although the network works** — set
`TYPR_INSTALL_VERIFY=0` once to confirm the cause, then remove it. It disables
the only protection against a tampered archive, so don't leave it on.

**PowerShell security warning** — the script is not code-signed. `irm … | iex`
runs downloaded code, which is the usual trade-off of a one-liner. If you would
rather read it first, use the `-OutFile` form above, open `install.ps1`, then
run it.

**Exit codes** — `0` success; `1` environment or verification problem (no
network, release not found, bad checksum); `2` bad command line (unknown
option, missing argument).
