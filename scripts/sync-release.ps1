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
$json = $manifest | ConvertTo-Json -Depth 6 -Compress
[IO.File]::WriteAllText($output, "$json`n", [Text.UTF8Encoding]::new($false))

# Synchronise également les valeurs de secours rendues avant le chargement de
# release.json, ainsi que la version structurée lue par les moteurs de recherche.
$culture = [Globalization.CultureInfo]::GetCultureInfo("fr-FR")
$published = ([DateTimeOffset]$release.published_at).ToString("d MMMM yyyy", $culture)
$installer = $assetManifest["OwlSetup-Setup.exe"]
$portable = $assetManifest["OwlSetup.exe"]
$installerSize = ([double]$installer.size / 1MB).ToString("0.0", $culture)
$portableSize = ([double]$portable.size / 1MB).ToString("0.0", $culture)
$installerHash = [string]$installer.sha256
$shortHash = "$($installerHash.Substring(0, 8))…$($installerHash.Substring($installerHash.Length - 8))"
$indexPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\index.html"))
$index = [IO.File]::ReadAllText($indexPath)

$index = [regex]::Replace($index, '"softwareVersion":"[^"]+"', "`"softwareVersion`":`"$version`"")
$index = [regex]::Replace($index, 'data-release-version>[^<]+<', { param($match) "data-release-version>$version<" })
$index = [regex]::Replace($index, '(<small id="releaseMeta">)[^<]*(</small>)', { param($match) "$($match.Groups[1].Value)Publiée le $published · Installateur $installerSize Mo$($match.Groups[2].Value)" })
$index = [regex]::Replace($index, '(<small id="portableMeta">)[^<]*(</small>)', { param($match) "$($match.Groups[1].Value)Aucune installation · $portableSize Mo$($match.Groups[2].Value)" })
$index = [regex]::Replace($index, '(<code id="installerHash">)[^<]*(</code>)', { param($match) "$($match.Groups[1].Value)$shortHash$($match.Groups[2].Value)" })
$index = [regex]::Replace($index, 'data-copy-hash="[A-Fa-f0-9]{64}"', "data-copy-hash=`"$installerHash`"")
$index = [regex]::Replace($index, '(<a[^>]+data-release-label="Installer \{version\}"[^>]*>)Installer [^<]+(</a>)', { param($match) "$($match.Groups[1].Value)Installer $version$($match.Groups[2].Value)" })

[IO.File]::WriteAllText($indexPath, $index, [Text.UTF8Encoding]::new($false))
Write-Host "Release $($release.tag_name) synchronisée dans release.json et index.html" -ForegroundColor Green
