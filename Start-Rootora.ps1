$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host ''
Write-Host 'ROOTORA AI - secure local starter' -ForegroundColor Green
Write-Host 'Your API key is requested privately and is not saved in these files.'
Write-Host 'An OpenAI API key and API billing/credits are required for real AI.'
Write-Host 'If you do not have a key yet, press Enter to start the website without AI.'
$secure = Read-Host 'Paste OpenAI API key (input hidden)' -AsSecureString
if ($secure.Length -gt 0) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try { $env:OPENAI_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) }
  finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }
} else {
  Remove-Item Env:OPENAI_API_KEY -ErrorAction SilentlyContinue
}
if (-not $env:OPENAI_MODEL) { $env:OPENAI_MODEL = 'gpt-4.1-mini' }
Write-Host ''
Write-Host 'Starting Rootora. Keep this window open.' -ForegroundColor Cyan
Write-Host 'When the server says it is running, open http://localhost:3000 in your browser.'
Write-Host ''
node server.mjs
Write-Host ''
Write-Host 'Rootora stopped. Press Enter to close.'
Read-Host | Out-Null
