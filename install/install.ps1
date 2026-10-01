#requires -Version 5.1
<#
.SYNOPSIS
    TypR - one-command installation (Windows).

.DESCRIPTION
    powershell -c "irm https://we-data-ch.github.io/typr.github.io/install/install.ps1 | iex"

    The format is .zip rather than .tar.gz: Expand-Archive is the only
    extraction tool present on a Windows box with nothing installed, whereas
    tar.exe would be needed (shipped starting with Windows 10 1803, absent
    from Windows 7/8.1 and Windows Server 2012).

    Target is %LOCALAPPDATA%\Programs\typr: modern per-user convention, no
    administrator rights required. The user PATH is updated through the
    registry, so it only takes effect in the next terminal - the script says
    so, and also updates $env:Path for the current session so that
    `typr --version` works immediately.

    The binary is not signed. A file extracted by Expand-Archive does not carry
    the Mark-of-the-Web attribute (only browsers and zips downloaded with it do):
    no SmartScreen, unlike an executable that was downloaded then double-clicked.

.PARAMETER Version
    Tag to install (e.g. v0.5.12). Defaults to the latest stable release.

.PARAMETER Channel
    stable (default) or beta.

.PARAMETER DryRun
    Shows what would be done, downloads nothing.

.PARAMETER Gnu
    No effect on Windows; accepted so the same command line works with both
    scripts.

.NOTES
    Nothing is written outside %LOCALAPPDATA% and no administrator privilege
    is required.
#>

[CmdletBinding()]
param(
    [string] $Version,
    [ValidateSet('stable', 'beta')]
    [string] $Channel = 'stable',
    [switch] $DryRun,
    [switch] $Gnu
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# On Windows PowerShell 5.1, the System.Net.Http assembly is not loaded by
# default (it is on PowerShell 7): without this Add-Type, the first use of
# [System.Net.Http.HttpClient] fails with "type not found".
Add-Type -AssemblyName System.Net.Http

# ---------------------------------------------------------------------------
# Configuration
#
# The environment variables below are overridden by the tests, which serve a
# local release: without this, testing the rejection of a forged SHA would
# require forging a real published release.
# ---------------------------------------------------------------------------
$Repo  = if ($env:TYPR_INSTALL_REPO)  { $env:TYPR_INSTALL_REPO }  else { 'we-data-ch/typr' }
$Origin = if ($env:TYPR_INSTALL_ORIGIN) { $env:TYPR_INSTALL_ORIGIN } else { 'https://github.com' }
$Docs  = if ($env:TYPR_INSTALL_DOCS)  { $env:TYPR_INSTALL_DOCS }  else { 'https://we-data-ch.github.io/typr.github.io' }

$DownloadBase = "$Origin/$Repo/releases/download"
$LatestUrl    = "$Origin/$Repo/releases/latest"
$ReleasesFeed = "$Origin/$Repo/releases.atom"

$Verify = if ($env:TYPR_INSTALL_VERIFY) { $env:TYPR_INSTALL_VERIFY } else { '1' }
if ($Verify -notin @('0', '1')) {
    Write-Error "TYPR_INSTALL_VERIFY must be 0 or 1 (got: '$Verify')."
    exit 2
}

$script:TempDir = $null

# `exit` does not go through the `trap`, which only sees errors: the temporary
# directory must therefore be cleaned up explicitly here. Without this, every
# failure left a half-downloaded archive in %TEMP%.
function Stop-Install {
    param([string] $Message, [int] $Code = 1)
    Remove-TempDir
    Write-Host "typr-install : $Message" -ForegroundColor Red
    exit $Code
}

function Step { param([string] $Message) Write-Host "-> $Message" }
function Note { param([string] $Message) Write-Host "  $Message" }
function Warn {
    param([string] $Message)
    Write-Host "typr-install : warning: $Message" -ForegroundColor Yellow
}

function Remove-TempDir {
    if ($script:TempDir -and (Test-Path -LiteralPath $script:TempDir)) {
        Remove-Item -LiteralPath $script:TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# Cleanup of the temporary directory on error, with a non-zero return code:
# under `irm | iex`, an `exit 0` would make a failed install look successful.
trap {
    Remove-TempDir
    Write-Error $_
    exit 1
}

# ---------------------------------------------------------------------------
# HTTP
#
# `HttpClient` rather than `Invoke-WebRequest`: the .NET Framework class is
# present identically in Windows PowerShell 5.1 and PowerShell 7, whereas the
# cmdlet parameters diverged between the two - `-UseBasicParsing` does not
# mean the same thing everywhere, and `-MaximumRedirection 0` behaves
# differently, or does not exist. Here there is no flag to get wrong.
function New-Client {
    param([bool] $AllowRedirect = $true)
    $handler = [System.Net.Http.HttpClientHandler]::new()
    $handler.AllowAutoRedirect = $AllowRedirect
    $client = [System.Net.Http.HttpClient]::new($handler)
    $client.DefaultRequestHeaders.UserAgent.ParseAdd('typr-install')
    return $client
}

function Get-RedirectLocation {
    param([string] $Url)

    # We want the redirect header, not the destination: that is what carries
    # the tag, and `/releases/latest` excludes prereleases - exactly the
    # stable-channel semantics, without depending on jq or the GitHub API.
    $client = New-Client -AllowRedirect $false
    try {
        $request = [System.Net.Http.HttpRequestMessage]::new(
            [System.Net.Http.HttpMethod]::Head, $Url)
        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        if ($null -ne $response.Headers.Location) {
            return $response.Headers.Location.ToString()
        }
        return $null
    }
    catch {
        return $null
    }
    finally {
        $client.Dispose()
    }
}

function Get-String {
    param([string] $Url)

    $client = New-Client
    try {
        $response = $client.GetAsync($Url).GetAwaiter().GetResult()
        $response.EnsureSuccessStatusCode() | Out-Null
        return $response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    }
    finally {
        $client.Dispose()
    }
}

# Returns $false instead of calling Stop-Install: it is up to each caller to
# say what the absence of the file means.
function Try-Save-File {
    param([string] $Url, [string] $Path)

    # We write to a temporary file then rename: if the download is
    # interrupted, no file is left half-written under the final name - the
    # archive is verified before being installed anyway.
    $partial = "$Path.part"
    $client = New-Client
    try {
        $response = $client.GetAsync($Url).GetAwaiter().GetResult()
        $response.EnsureSuccessStatusCode() | Out-Null

        # `$source` and not `$input`: the latter is a PowerShell automatic
        # variable (the old `$input` of the pipeline), which can be rewritten
        # by third-party code loaded before us - or by us, which would make
        # CopyTo read a $null and mask the download as a "failure".
        $source = $response.Content.ReadAsStreamAsync().GetAwaiter().GetResult()
        $target = [System.IO.File]::Create($partial)
        try { $source.CopyTo($target) }
        finally { $target.Dispose(); $source.Dispose() }

        if (Test-Path -LiteralPath $Path) { Remove-Item -LiteralPath $Path -Force }
        Move-Item -LiteralPath $partial -Destination $Path -Force

        # Explicit, not implicit: a PowerShell function returns whatever its
        # `try` emits, and a successful download emits nothing. Without this
        # `return`, Try-Save-File would return $null - hence falsy - and the
        # caller would read a success as a failure.
        return $true
    }
    catch {
        if (Test-Path -LiteralPath $partial) {
            Remove-Item -LiteralPath $partial -Force -ErrorAction SilentlyContinue
        }
        return $false
    }
    finally {
        $client.Dispose()
    }
}

function Save-File {
    param([string] $Url, [string] $Path)

    if (-not (Try-Save-File $Url $Path)) {
        Stop-Install "download failed: $Url`n  Check the network, or retry with -Version vX.Y.Z."
    }
}

# ---------------------------------------------------------------------------
# Version
# ---------------------------------------------------------------------------
function Resolve-Version {
    if ($Version) {
        $tag = $Version -replace '^v', ''
        return "v$tag"
    }

    if ($Channel -eq 'stable') {
        $location = Get-RedirectLocation $LatestUrl
        if ($location -and $location -match '/tag/(v[^/?#]+)') { return $Matches[1] }
        Stop-Install "cannot determine the latest stable version.`n  URL queried: $LatestUrl`n  To pin a version: -Version vX.Y.Z"
    }

    # The beta channel must list the releases and filter. The Atom feed lists
    # the last ten of them, prereleases included, and can be parsed without a
    # dependency. The suffixes are those that release.yml marks `prerelease`.
    $xml = Get-String $ReleasesFeed
    $tags = [regex]::Matches($xml, 'Repository/\d+/(v[^<]+)') |
            ForEach-Object { $_.Groups[1].Value }
    $prerelease = $tags | Where-Object { $_ -match '-(alpha|beta|rc)[.0-9]' } | Select-Object -First 1
    if (-not $prerelease) {
        Stop-Install "no prerelease found on $ReleasesFeed.`n  The Atom feed only lists the last ten releases: if the last`n  prerelease is older, pin it with -Channel beta -Version vX.Y.Z"
    }
    return $prerelease
}

function Assert-Tag {
    param([string] $Tag)
    if ($Tag -notmatch '^v[0-9]') {
        Stop-Install "unreadable tag: '$Tag' (expected: vX.Y.Z)." 2
    }
}

function Resolve-Target {
    # Test override. `PROCESSOR_ARCHITECTURE` only exists on Windows, so
    # without this variable the download -> SHA -> extraction -> PATH path can
    # only be exercised on a Windows runner. install.sh does not have the same
    # need: `uname -m` exists everywhere the Unix script runs.
    if ($env:TYPR_INSTALL_TARGET) { return $env:TYPR_INSTALL_TARGET }

    # Under WOW64 (32-bit PowerShell on 64-bit Windows), PROCESSOR_ARCHITECTURE
    # is x86 and PROCESSOR_ARCHITEW6432 carries the real value. On ARM64, we
    # take the ARM binary: Windows emulates it anyway if it cannot run it.
    $arch = $env:PROCESSOR_ARCHITECTURE
    if ($arch -eq 'x86' -and $env:PROCESSOR_ARCHITEW6432) { $arch = $env:PROCESSOR_ARCHITEW6432 }

    switch ($arch) {
        'AMD64' { return 'x86_64-pc-windows-msvc' }
        'ARM64' { return 'aarch64-pc-windows-msvc' }
        'x86'   {
            Stop-Install "TypR does not publish a 32-bit binary (x86).`n  A 64-bit Windows normally has PROCESSOR_ARCHITECTURE=AMD64: if not,`n  the open PowerShell is 32-bit - close it and reopen it."
        }
        default {
            Stop-Install "unsupported architecture: '$arch'.`n  TypR publishes x86_64 and aarch64 binaries for Windows."
        }
    }
}

function Get-OsName {
    if ($env:OS) { return $env:OS }
    # `$env:OS` only exists on Windows; under PowerShell 7 on Linux/macOS
    # (where the script is tested), we fall back on the .NET description.
    if ([System.Runtime.InteropServices.RuntimeInformation]) {
        return [System.Runtime.InteropServices.RuntimeInformation]::OSDescription
    }
    return 'Windows'
}

function Resolve-InstallDir {
    if ($env:TYPR_INSTALL_DIR) { return $env:TYPR_INSTALL_DIR }
    if ($env:LOCALAPPDATA)    { return (Join-Path $env:LOCALAPPDATA 'Programs\typr') }
    Stop-Install "LOCALAPPDATA is not defined: cannot determine where to install.`n  Set TYPR_INSTALL_DIR."
}

# ---------------------------------------------------------------------------
# SHA-256
# ---------------------------------------------------------------------------
# `Get-FileHash` is available since PowerShell 4.0: no module to load, unlike
# `certutil -hashfile` which is not guaranteed on a minimal server image.
#
# We isolate the only checksums.txt line concerning our archive, then compare
# the digests. `sha256sum -c` would fail here - the Windows equivalent would
# try to verify the seven other archives of the release, not downloaded, and
# exit with an error although ours is valid.
function Test-Checksum {
    param([string] $Path, [string] $Name)

    Step 'SHA-256 verification'

    $sumsPath = Join-Path $script:TempDir 'checksums.txt'
    $sumsUrl = "$DownloadBase/$script:Tag/checksums.txt"
    # `Save-File` would say "download failed", which does not say *what* is
    # missing. Here the answer is always the same - checksums.txt is missing
    # or the network is down - and the user needs the second sentence to
    # distinguish a badly published release from a firewall.
    if (-not (Try-Save-File $sumsUrl $sumsPath)) {
        Stop-Install "checksums.txt not found for $($script:Tag).`n  URL: $sumsUrl`n  The file lists the eight archives of the release; its absence means`n  the release is incomplete. Also check the network."
    }

    # We filter on the NAME, not on the SHA + name pair. Filtering on both
    # would confuse two very different diagnoses: "this file does not mention
    # our archive" and "the line exists but its digest is unreadable". The
    # second is a corrupted file, the first a badly published release.
    # install.sh proceeds in the same order, so that both scripts name the
    # same cause in the same way.
    $line = Get-Content -LiteralPath $sumsPath |
            Where-Object { $_ -match ('\s+\*?' + [regex]::Escape($Name) + '$') } |
            Select-Object -First 1

    if (-not $line) {
        $received = (Get-Content -LiteralPath $sumsPath) -join "`n"
        Stop-Install "checksums.txt of $($script:Tag) contains no line for $Name.`n  File received:`n$received"
    }

    $expected = ($line.Trim() -split '\s+')[0]
    if ($expected -notmatch '^[0-9a-f]{64}$') {
        Stop-Install "malformed line in checksums.txt for ${Name}:`n  $line`n  A SHA-256 is 64 hexadecimal characters; found '$expected'."
    }

    $actual = (Get-FileHash -LiteralPath $Path -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($expected -ne $actual) {
        Stop-Install "forged SHA-256 for $Name.`n  expected $expected`n  got      $actual`n  The archive was deleted; nothing was installed."
    }

    Note "SHA-256 correct ($actual)"
}

# ---------------------------------------------------------------------------
# PATH
# ---------------------------------------------------------------------------
function Test-OnPath {
    param([string] $Dir)

    $full = [System.IO.Path]::GetFullPath($Dir).TrimEnd('\')
    $separator = [System.IO.Path]::PathSeparator
    foreach ($entry in ($env:Path -split [regex]::Escape($separator))) {
        if (-not $entry) { continue }
        $normalized = [System.IO.Path]::GetFullPath($entry.Trim('"')).TrimEnd('\')
        if ($normalized -ieq $full) { return $true }
    }
    return $false
}

# The user PATH is written to the registry: it will only be taken into account
# at the next terminal start, which must be said explicitly. We also update
# $env:Path of the current session so that `typr --version` works right away.
function Add-ToUserPath {
    param([string] $Dir)

    $current = [Environment]::GetEnvironmentVariable('Path', 'User')
    if ($null -eq $current) { $current = '' }
    $separator = [System.IO.Path]::PathSeparator

    foreach ($entry in ($current -split [regex]::Escape($separator))) {
        if (-not $entry) { continue }
        if ([System.IO.Path]::GetFullPath($entry.Trim('"')).TrimEnd('\') -ieq $Dir.TrimEnd('\')) {
            return $false
        }
    }

    $new = if ([string]::IsNullOrWhiteSpace($current)) { $Dir } else { "$current$separator$Dir" }
    try {
        [Environment]::SetEnvironmentVariable('Path', $new, 'User')
    }
    catch {
        # A PATH locked by a group policy refuses the write. This is not
        # fatal: the binary is installed, only its automated access is missing.
        Warn "the user PATH could not be written: $($_.Exception.Message)"
        Warn "add it manually: `$env:Path += ';' + '$Dir'"
        return $false
    }
    return $true
}

function Test-BinaryStart {
    param([string] $Path)

    Step 'Installation check'
    $output = & $Path '--version' 2>&1
    if ($LASTEXITCODE -eq 0) {
        $output | ForEach-Object { Note "$_" }
        return
    }

    # The case measured in September 2026: the installation ends without
    # error, then `typr --version` fails. Saying it here is better than a
    # support ticket.
    Write-Host ''
    Warn 'the binary is installed but does not start.'
    Note "Binary message: $output"
    Note 'If it mentions a missing DLL (VCRUNTIME140.dll, ucrtbase.dll),'
    Note "the artifact was not statically linked: read $Docs/install for troubleshooting."
    exit 1
}

# ---------------------------------------------------------------------------
# Sequence
# ---------------------------------------------------------------------------
$script:Tag = Resolve-Version
Assert-Tag $script:Tag
$target = Resolve-Target
$installDir = Resolve-InstallDir

$artifact = "typr-$($script:Tag)-$target.zip"
$url = "$DownloadBase/$($script:Tag)/$artifact"

Step "TypR $($script:Tag)"
Note "system    : $(Get-OsName) ($env:PROCESSOR_ARCHITECTURE)"
Note "target    : $target"
Note "directory : $installDir"

if ($Verify -eq '0') { Warn 'SHA-256 verification disabled (TYPR_INSTALL_VERIFY=0).' }

if ($DryRun) {
    Step 'Dry run - nothing will be downloaded or written'
    Note "artifact  : $artifact"
    Note "url       : $url"
    Note "sha256    : $DownloadBase/$($script:Tag)/checksums.txt"
    exit 0
}

if (-not (Test-Path -LiteralPath $installDir)) {
    New-Item -ItemType Directory -Path $installDir -Force | Out-Null
}
if (-not (Test-Path -LiteralPath $installDir)) {
    Stop-Install "cannot create $installDir."
}

$script:TempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("typr-install-" + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $script:TempDir -Force | Out-Null

Step 'Download'
$archivePath = Join-Path $script:TempDir $artifact
Save-File $url $archivePath

if ($Verify -ne '0') {
    Test-Checksum $archivePath $artifact
}
else {
    Step 'SHA-256 verification'
    Note 'skipped.'
}

Step 'Extraction'
$extractDir = Join-Path $script:TempDir 'extract'
New-Item -ItemType Directory -Path $extractDir -Force | Out-Null
try {
    Expand-Archive -LiteralPath $archivePath -DestinationPath $extractDir -Force
}
catch {
    Stop-Install "unreadable archive: $artifact`n  $($_.Exception.Message)"
}

$exePath = Join-Path $extractDir 'typr.exe'
if (-not (Test-Path -LiteralPath $exePath)) {
    Stop-Install "the archive $artifact contains no 'typr.exe' binary."
}

$targetExe = Join-Path $installDir 'typr.exe'
# Remove-Item then Copy-Item rather than Move-Item: a running binary on
# Windows cannot be overwritten, and the failure would be confused with a
# write problem. The operation remains idempotent.
if (Test-Path -LiteralPath $targetExe) {
    Remove-Item -LiteralPath $targetExe -Force
}
Copy-Item -LiteralPath $exePath -Destination $targetExe -Force

Write-Host ''
Step "TypR $($script:Tag) installed in $installDir"

if (Test-OnPath $installDir) {
    Test-BinaryStart $targetExe
}
else {
    if (Add-ToUserPath $installDir) {
        $env:Path = "$installDir$([System.IO.Path]::PathSeparator)$env:Path"
        Warn "$installDir was added to the user PATH."
        Note 'It will only be taken into account at the next terminal start.'
        Note 'This one is up to date: `typr --version` works right away.'
    }
    Write-Host ''
    Note "Try first: $targetExe --version"
}

Remove-TempDir

Write-Host ''
Note "Documentation: $Docs"
