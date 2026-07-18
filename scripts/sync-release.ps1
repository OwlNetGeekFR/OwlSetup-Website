param(
    [string]$OutputPath = (Join-Path $PSScriptRoot "..\release.json")
)

$ErrorActionPreference = "Stop"
$repository = "OwlNetGeekFR/OwlSetup"
$headers = @{
    Accept = "application/vnd.github+json"
    "User-Agent" = "OwlSetup-Website-Release-Sync"
    "X-GitHub-Api-Version" = "2022-11-28"
}
if ($env:GITHUB_TOKEN) {
    $headers.Authorization = "Bearer $env:GITHUB_TOKEN"
}

$release = Invoke-RestMethod -Uri "https://api.github.com/repos/$repository/releases/latest" -Headers $headers
if ($release.draft -or $release.prerelease) {
    throw "La dernière Release doit être stable et publiée."
}
$version = [string]$release.tag_name -replace '^v', ''
if ($version -notmatch '^\d+\.\d+\.\d+$') {
    throw "Tag de Release invalide : $($release.tag_name)"
}

$required = @("OwlSetup-Setup.exe", "OwlSetup.exe", "PC-Setup.exe", "SHA256.txt")
$assets = @{}
foreach ($name in $required) {
    $asset = $release.assets | Where-Object name -eq $name | Select-Object -First 1
    if (-not $asset) { throw "Fichier absent de la Release : $name" }
    $assets[$name] = $asset
}

$shaContent = Invoke-RestMethod -Uri $assets["SHA256.txt"].browser_download_url -Headers @{ "User-Agent" = "OwlSetup-Website-Release-Sync" }
$shaText = if ($shaContent -is [byte[]]) {
    [Text.Encoding]::UTF8.GetString($shaContent)
} else {
    [string]$shaContent
}
$hashes = @{}
foreach ($line in ($shaText -split "`r?`n")) {
    if ($line -match '^(?<hash>[A-Fa-f0-9]{64})\s+(?<name>.+)$') {
        $hashes[$Matches.name.Trim()] = $Matches.hash.ToUpperInvariant()
    }
}
foreach ($name in @("OwlSetup-Setup.exe", "OwlSetup.exe", "PC-Setup.exe")) {
    if (-not $hashes.ContainsKey($name)) { throw "Empreinte SHA-256 absente pour $name" }
}

$assetManifest = [ordered]@{}
foreach ($name in $required) {
    $asset = $assets[$name]
    $assetManifest[$name] = [ordered]@{
        url = [string]$asset.browser_download_url
        size = [long]$asset.size
        sha256 = if ($hashes.ContainsKey($name)) { $hashes[$name] } else { $null }
    }
}
$manifest = [ordered]@{
    schemaVersion = 1
    version = $version
    tag = [string]$release.tag_name
    publishedAt = ([DateTimeOffset]$release.published_at).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    releaseUrl = [string]$release.html_url
    assets = $assetManifest
}

$output = [IO.Path]::GetFullPath($OutputPath)
$json = $manifest | ConvertTo-Json -Depth 6
[IO.File]::WriteAllText($output, "$json`n", [Text.UTF8Encoding]::new($false))
Write-Host "Release $($release.tag_name) synchronisée dans $output" -ForegroundColor Green
