---
description: "Set up TypR in VS Code, RStudio, Positron, or Vim/Neovim, all driven by the typr CLI and the typr lsp language server."
---

# Editor Setup

TypR ships first-class integrations for three editors: **VS Code** (and
Positron), **RStudio** (and Positron), and **Vim / Neovim**. All three talk to
the same [`typr` CLI](./installation) and the same language server
(`typr lsp`) — install the compiler first, then pick your editor below.

## VS Code / Positron

### Install

Search **TypR** in the Extensions view (`Ctrl+Shift+X`) and install it — the
extension is published on the [VS Code
Marketplace](https://marketplace.visualstudio.com/vscode).

Positron, VSCodium and Cursor don't have access to the Marketplace; install
from [Open VSX](https://open-vsx.org/) instead (same extension, same
version).

If you'd rather install manually, download the `.vsix` file attached to the
[latest release](https://github.com/we-data-ch/typr/releases/latest), then in
VS Code: Command Palette (`Ctrl+Shift+P`) → **Extensions: Install from
VSIX...**.

### Features

- Syntax highlighting for `.ty` files
- Language server: hover, go-to-definition, autocompletion
- Commands: **typR: Check/Build/Run Project**, plus current-file variants,
  bound to `Ctrl+Shift+C` / `Ctrl+Shift+B` / `F5`

### Requirements

The `typr` binary must be on your `PATH`. If it isn't, set the
`typr.path` setting to its full path. Verify with `typr --version` in a
terminal, or check the **typR** channel in VS Code's Output panel if the
language server doesn't start.

## RStudio / Positron

### Install

Download `typr.runner_*.tar.gz` from the [latest
release](https://github.com/we-data-ch/typr/releases/latest), then install it
as a local source package:

```r
install.packages("typr.runner_0.5.10.tar.gz", repos = NULL, type = "source")
```

(adjust the filename to the version you downloaded). This installs the
**typr.runner** package and registers its RStudio addins.

### Usage

Every action is available both as an RStudio addin and as an R function:

| Addin | Function |
|---|---|
| Run TypR project | `typr.runner::run()` |
| Build TypR project | `typr.runner::build()` |
| Check TypR project | `typr.runner::check()` |
| Test TypR project | `typr.runner::test()` |

Scaffold a new project with:

```r
typr.runner::new("/path/of/your/project/folder/project_name")
```

then open the generated folder as a normal RStudio project.

### Requirements

The `typr` binary must be installed and on your `PATH` — see
[Installation](./installation).

## Vim / Neovim

### Install

The plugin lives at `editors/vim` in the [TypR
repository](https://github.com/we-data-ch/typr) and follows the standard Vim
plugin layout, so any plugin manager works. There's no central plugin
registry for Vim, so point your manager at the repo (or a subdirectory of
it) rather than searching a marketplace.

**lazy.nvim** (Neovim):
```lua
{
  "we-data-ch/typr",
  dir = "editors/vim",
  ft = "typr",
  config = function()
    require("typr").setup()
  end,
}
```

**vim-plug**:
```vim
Plug 'we-data-ch/typr', { 'rtp': 'editors/vim', 'for': 'typr' }
" :PlugInstall
```

**packer.nvim** (Neovim):
```lua
use { "we-data-ch/typr", rtp = "editors/vim", ft = "typr" }
```

**Native packages** (Vim or Neovim), from a local clone of the repository:
```bash
ln -s "$(pwd)/editors/vim" ~/.local/share/nvim/site/pack/typr/start/typr
# or for Vim:
ln -s "$(pwd)/editors/vim" ~/.vim/pack/typr/start/typr
```

Alternatively, download `typr-vim-*.tar.gz` from the [latest
release](https://github.com/we-data-ch/typr/releases/latest) and extract it
directly into your plugin manager's install directory.

### Features

- Syntax highlighting, filetype detection (`.ty`, legacy `.typr` / `.tyr`)
  and indentation
- `#` comments, `# region` / `# endregion` folding
- CLI integration: `:TyprCheck` / `:TyprBuild` / `:TyprRun` / `:TyprTest` /
  `:TyprRepl`, plus current-file variants (`:TyprCheckFile`, ...), with
  tab-completion of CLI flags
- Language server:
  - **Neovim** — starts automatically via the built-in LSP client
  - **Vim** — one-line setup with `coc.nvim` or `vim-lsp` (below)

### Language server

Neovim needs no configuration: the plugin starts `typr lsp` automatically for
`.ty` files when `typr` is on `PATH`. Check its status with
`:TyprLspStatus`, or opt out entirely with `vim.g.typr_lsp_enabled = false`
before the plugin loads.

Vim has no built-in LSP client, so wire it through your client of choice:

**coc.nvim** (`:CocConfig`):
```json
{
  "languageserver": {
    "typr": {
      "command": "typr",
      "args": ["lsp"],
      "filetypes": ["typr"]
    }
  }
}
```

**vim-lsp**:
```vim
au User lsp_setup call lsp#register_server({
      \ 'name': 'typr',
      \ 'cmd': {server_info->['typr', 'lsp']},
      \ 'whitelist': ['typr'],
      \ })
autocmd FileType typr setlocal omnifunc=lsp#complete
```

### Requirements

The `typr` binary must be installed and expose the LSP subcommand
(`typr lsp --help`). If it isn't on `PATH`, set `g:typr_path` to its full
path (works for both Vim and Neovim). Full command reference: `:help typr`
once the plugin is installed.
