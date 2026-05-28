[CmdletBinding()]
param(
    [string]$FilePath
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$privateKey = Join-Path $env:USERPROFILE '.ssh\gc_2026-04-21.key'
$remote = 'DEPLOY_USER@DEPLOY_HOST'
$stagingPath = '/home/USER'
$publishCommand = '/usr/local/sbin/deploy-weather-file'
$deployableFiles = @('index.html', 'apple-touch-icon.png', 'sw.js')

if (-not (Test-Path -LiteralPath $privateKey)) {
    throw "SSH private key was not found: $privateKey"
}

if ($FilePath) {
    $resolvedFile = (Resolve-Path -LiteralPath $FilePath).Path
    $resolvedParent = Split-Path -Parent $resolvedFile
    $repoRelativePath = Split-Path -Leaf $resolvedFile

    if (($resolvedParent -ne $repoRoot) -or ($repoRelativePath -notin $deployableFiles)) {
        throw "Active file is not a deployable site file: $repoRelativePath"
    }

    $files = @($repoRelativePath)
} else {
    $files = @(
        $deployableFiles |
            Where-Object { Test-Path -LiteralPath (Join-Path $repoRoot $_) }
    )
}

if (-not $files) {
    throw 'No deployable site files were found.'
}

foreach ($file in $files) {
    $localPath = Join-Path $repoRoot $file

    Write-Host "Uploading $file to $stagingPath..."
    & scp.exe -i $privateKey -o BatchMode=yes -o StrictHostKeyChecking=accept-new -- $localPath "${remote}:$stagingPath/$file"
    if ($LASTEXITCODE -ne 0) {
        throw "Upload failed for $file."
    }

    Write-Host "Publishing $file..."
    & ssh.exe -i $privateKey -o BatchMode=yes -o StrictHostKeyChecking=accept-new -- $remote "sudo -n '$publishCommand' '$file'"
    if ($LASTEXITCODE -ne 0) {
        throw "Publish failed for $file. Check that $publishCommand exists and is allowed with sudo NOPASSWD."
    }
}

Write-Host 'Deploy complete.'
