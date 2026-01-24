# ZenSpace 前端环境验证脚本 (Monorepo 版)

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
  Write-Host "✅ pnpm 已安装" -ForegroundColor Green
}
else {
  Write-Warning "❌ pnpm 未安装，请先执行 npm install -g pnpm"
}

if (Test-Path "packages/core/package.json") {
  Write-Host "✅ frontend/packages/core 逻辑层已就绪" -ForegroundColor Green
}
else {
  Write-Error "❌ 逻辑层 packages/core 缺失"
}

if (Test-Path "packages/ui/src") {
  Write-Host "✅ frontend/packages/ui 视图层已就绪" -ForegroundColor Green
}
else {
  Write-Error "❌ 视图层 packages/ui 缺失"
}

Write-Host "`n--- 正在准备执行 TDD (Vitest) 循环 ---"
