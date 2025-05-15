# Script: add-github-secrets.ps1
# Tu dong them tat ca bien moi truong tu file .env vao GitHub Secrets (Windows PowerShell)
# Yeu cau: Da cai dat GitHub CLI (gh) va da dang nhap bang lenh `gh auth login`
# Su dung: .\bin\add-github-secrets.ps1 <owner>/<repo> (vi du: hynady/ProjectT)

param(
    [Parameter(Mandatory = $true)]
    [string]$Repo
)

# Kiem tra GitHub CLI da duoc cai dat
try {
    $ghVersion = gh --version
    Write-Host "GitHub CLI duoc tim thay: $($ghVersion[0])" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: GitHub CLI (gh) chua duoc cai dat!" -ForegroundColor Red
    Write-Host "Vui long cai dat tu: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Kiem tra da dang nhap chua
try {
    $status = gh auth status
    Write-Host "GitHub authentication OK" -ForegroundColor Green
}
catch {
    Write-Host "ERROR: Ban chua dang nhap vao GitHub!" -ForegroundColor Red
    Write-Host "Vui long dang nhap bang lenh: gh auth login" -ForegroundColor Yellow
    exit 1
}

# Lay duong dan toi thu muc cha cua script (goc du an)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$envFile = Join-Path -Path $rootDir -ChildPath ".env"

if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: Khong tim thay file .env tai $envFile" -ForegroundColor Red
    Write-Host "Vui long chay script tu thu muc goc du an" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nDang them secrets tu $envFile vao GitHub repository $Repo...`n" -ForegroundColor Cyan

$content = Get-Content $envFile
$secretCount = 0

foreach ($line in $content) {
    # Bo qua dong trong va dong comment
    if ($line.Trim() -eq "" -or $line.Trim().StartsWith("#") -or $line.Trim().StartsWith("//")) {
        continue
    }    if ($line -match "=") {
        $parts = $line.Split("=", 2)
        $key = $parts[0].Trim()
        $value = $parts[1].Trim()
        
        # Xu ly ky tu escape trong gia tri mot cach an toan hon
        $value = $value.Replace('\!', '!').Replace('\#', '#').Replace('\)', ')').Replace('\\', '\')

        if (![string]::IsNullOrEmpty($key) -and ![string]::IsNullOrEmpty($value)) {
            Write-Host "Them secret: $key" -ForegroundColor White
            Write-Host "  - Gia tri: $value" -ForegroundColor Gray
            
            try {
                gh secret set $key -b $value -R $Repo
                $secretCount++
                Write-Host "  - OK" -ForegroundColor Green
            }
            catch {
                Write-Host "  - LOI: Khong the them secret $key" -ForegroundColor Red
                Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`nHoan tat! Da them $secretCount secrets vao $Repo" -ForegroundColor Green
