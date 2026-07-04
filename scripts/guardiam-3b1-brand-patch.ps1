$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Write-Host "GUARDIAM 3B.1 - Patch de textos visíveis e navegação segura" -ForegroundColor Cyan

$patches = [ordered]@{
  'app\_layout.tsx' = [ordered]@{
    "Contatos de confiança" = "Contatos de segurança"
    "Criar viagem segura"   = "Ativar proteção"
    "Viagem ativa"          = "Modo Proteção"
  }

  'app\(auth)\login.tsx' = [ordered]@{
    "XGuardiam Ride" = "GUARDIAM"
    "XGuardiam"      = "GUARDIAM"
    "Entre para acompanhar viagens seguras, contatos de confiança e alertas silenciosos." = "Entre para manter sua proteção pessoal sempre pronta."
    "viagens seguras"       = "proteção pessoal"
    "contatos de confiança" = "contatos de segurança"
    "alertas silenciosos"   = "alertas de segurança"
  }

  'app\(auth)\register.tsx' = [ordered]@{
    "XGuardiam Ride" = "GUARDIAM"
    "XGuardiam"      = "GUARDIAM"
    "viagens seguras"       = "proteção pessoal"
    "contatos de confiança" = "contatos de segurança"
    "alertas silenciosos"   = "alertas de segurança"
  }

  'app\(app)\home.tsx' = [ordered]@{
    "XGuardiam Ride" = "GUARDIAM"
    "XGuardiam"      = "GUARDIAM"

    "Viagem segura" = "Modo Proteção"
    "Iniciar viagem segura" = "Ativar Modo Proteção"
    "Crie uma rota protegida e habilite localização, alerta silencioso e evidências." = "Ative sua proteção pessoal e deixe localização e alerta prontos para uso."

    "Contatos de confiança" = "Contatos de segurança"
    "Gerencie quem pode receber alertas em caso de risco." = "Gerencie quem poderá ser avisado em caso de alerta."

    "Ver viagem ativa" = "Ver Modo Proteção"
  }

  'app\(app)\trusted-contacts.tsx' = [ordered]@{
    "Contatos de confiança" = "Contatos de segurança"
    "Pessoas que podem receber notificações internas quando um alerta silencioso for acionado." = "Pessoas que poderão ser avisadas quando você acionar um alerta no GUARDIAM."

    "contatos de confiança" = "contatos de segurança"
    "alerta silencioso"     = "alerta de segurança"
    "Alerta silencioso"     = "Alerta de segurança"
  }
}

foreach ($relativePath in $patches.Keys) {
  $path = Join-Path (Get-Location) $relativePath

  if (-not (Test-Path -LiteralPath $path)) {
    Write-Host "Arquivo não encontrado, ignorando: $relativePath" -ForegroundColor Yellow
    continue
  }

  $content = Get-Content -LiteralPath $path -Raw
  $originalContent = $content

  foreach ($replacement in $patches[$relativePath].GetEnumerator()) {
    $content = $content.Replace($replacement.Key, $replacement.Value)
  }

  if ($content -ne $originalContent) {
    $backupPath = "$path.bak-3b1"

    if (-not (Test-Path -LiteralPath $backupPath)) {
      Copy-Item -LiteralPath $path -Destination $backupPath
      Write-Host "Backup criado: $relativePath.bak-3b1" -ForegroundColor DarkGray
    }

    Set-Content -LiteralPath $path -Value $content -Encoding UTF8
    Write-Host "Atualizado: $relativePath" -ForegroundColor Green
  }
  else {
    Write-Host "Sem alterações: $relativePath" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "Patch 3B.1 concluído." -ForegroundColor Cyan
Write-Host "Agora rode: npm run typecheck" -ForegroundColor Cyan