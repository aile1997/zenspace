# Hyper-Velocity DX System Check Protocol
# 强制修复 Windows 终端乱码问题
[System.Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

function Assert-Path ($Path, $Description) {
    if (Test-Path $Path) {
        Write-Host "[OK] $Description found." -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Missing: $Path" -ForegroundColor Red
        Write-Host "   -> Action: Please run the setup scripts for this phase." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "`n--- Vibe Coding Architecture: Pre-Flight Check ---`n" -ForegroundColor Cyan

# 1. 检查核心宪法
Assert-Path ".claude/CLAUDE.md" "Constitution (CLAUDE.md)"

# 2. 检查技能包 (Skills)
Assert-Path ".claude/skills/product-spec-builder/SKILL.md" "Skill: Venomous PM"
Assert-Path ".claude/skills/ui-prompt-generator/SKILL.md" "Skill: UI Contract Designer"
Assert-Path ".claude/skills/dev-builder/SKILL.md" "Skill: TDD Executor"

# 3. 检查关键模板 (Templates)
Assert-Path ".claude/skills/product-spec-builder/templates/product-spec-template.md" "Template: PRD"
Assert-Path ".claude/skills/product-spec-builder/templates/changelog-template.md" "Template: Changelog"
Assert-Path ".claude/skills/ui-prompt-generator/templates/ui-prompt-template.md" "Template: UI Spec"

# 4. 检查契约与记忆存储 (Storage)
if (!(Test-Path ".claude/contracts")) { New-Item -ItemType Directory -Force -Path ".claude/contracts" | Out-Null }
Assert-Path ".claude/contracts" "Contract Storage (.claude/contracts)"

Write-Host "`System Verified. Ready for Ignition." -ForegroundColor Cyan
Write-Host "---------------------------------------------------"
Write-Host "Phase 1 (Antigravity): Type '/prd I want to build...'"
Write-Host "Phase 2 (VS Code):     Type '/dev Implement feature...'"
Write-Host "---------------------------------------------------`n"