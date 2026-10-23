---
sidebar_position: 5
title: Manage R dependencies with uvr
description: "Declare, install and lock the R packages a TypR project depends on, using typr use and uvr."
---

# How to manage R dependencies with uvr

A TypR project locks its R packages with [uvr](https://github.com/nbafrank/uvr), a fast
single-binary package manager for R. `typr` never installs a package behind your back:
every installation is an explicit command.

## Install uvr

```bash
cargo install --git https://github.com/nbafrank/uvr
```

`typr new` still creates the project if uvr is missing, and tells you to run `uvr init` later.
Use `typr new --no-uvr` to skip uvr on purpose.

## Add a package

```bash
typr use dplyr
```

This writes the package to `DESCRIPTION` (`Imports`) **and** to `uvr.toml`, then installs it in
the project library `.uvr/library/`.

## After a clone

```bash
uvr sync
```

`uvr.toml` and `uvr.lock` are committed; `.uvr/` is not.

## Keep both files in agreement

You may edit `DESCRIPTION` or `uvr.toml` by hand. `typr check` warns when they disagree, or
when `library(x)` is used in TypR code for a package declared nowhere:

```text
warning: `jsonlite` is in DESCRIPTION but not in uvr.toml: run `typr use jsonlite`
```

These are warnings, not errors.

## Run R in the project library

`typr run`, `typr test` and `typr build` already do. For your own script:

```bash
uvr run script.R
```
