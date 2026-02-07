# Script para commitar para GitHub
param(
    [string]$RepoPath = "C:\Users\Acer\Clones\IABS-SIP-GUI",
    [string]$RemoteURL = "https://github.com/rbaraldi-crypto/IABS-SIP-GUI-NEW.git"
)

Write-Host "Preparando commit do projeto para GitHub..." -ForegroundColor Cyan

# 1. Navegar até o diretório
Set-Location $RepoPath

# 2. Limpar repositório antigo se existir
if (Test-Path ".git") {
    $backupName = ".git_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Rename-Item .git $backupName
    Write-Host "Backup do .git criado: $backupName" -ForegroundColor Yellow
}

# 3. Inicializar novo repositório
git init
git remote add origin $RemoteURL

# 4. Configurar usuário
git config user.name "rbaraldi-crypto"
git config user.email "rbaraldi@exemplo.com"  # Substitua pelo seu email

# 5. Criar .gitignore se não existir
$gitignoreContent = @"
node_modules/
dist/
build/
.env
.DS_Store
*.log
"@

if (!(Test-Path ".gitignore")) {
    $gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8
    Write-Host ".gitignore criado" -ForegroundColor Green
}

# 6. Adicionar e commitar
git add .
git commit -m "Initial commit: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"

# 7. Fazer push
Write-Host "Fazendo push para o GitHub..." -ForegroundColor Cyan
git branch -M main
git push -u origin main

# 8. Verificar resultado
if ($LASTEXITCODE -eq 0) {
    Write-Host "SUCESSO! Repositório enviado para GitHub." -ForegroundColor Green
    Write-Host "URL: $RemoteURL" -ForegroundColor Cyan
} else {
    Write-Host "Erro ao fazer push. Verifique suas credenciais." -ForegroundColor Red
    Write-Host "Dica: Crie um token em GitHub.com → Settings → Developer settings" -ForegroundColor Yellow
}