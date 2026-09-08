# Installation

TypR is installed as a complement to R.

General steps:

## 1. Install a recent version of **R**.

You can install R (and RStudio) in this [link](https://rstudio-education.github.io/hopr/starting.html).

## 2. Install the TypR compiler/interpreter 

You can install TypR in 3 different ways:

### With the release page

If you have Windows, Mac or Linux, you can download it with the [release page](https://github.com/we-data-ch/typr/releases/).

### Via DockerHub:

If you have docker you can install TypR with your terminal:
```bash
docker pull fabricehategekimana/typr:latest
```

You can then run it in this way:

```bash
docker run -it --rm -v $(pwd):/workspace fabricehategekimana/typr:latest
```

### With Cargo (Rust)

If you already have Rust in your system, you can download it with Cargo from Rust:

```bash
cargo install TypR
```

## 3. Verify the installation 

To verify your installation, you can use this command:

```bash
> typr --version
typr [actual version]

```

Once installed, TypR can be used:
- from the command line,
- within a compatible IDE — see [Editor Setup](./editor-setup) for VS Code,
  RStudio and Vim/Neovim.
