# Context Injection
Write-Host "Loading Memory Bank..."
if (Test-Path .claude/memory/project_context.md) { Get-Content .claude/memory/project_context.md }
if (Test-Path .claude/memory/tech_constraints.md) { Get-Content .claude/memory/tech_constraints.md }
echo "Active Tickets:"
ls .claude/tickets/todo
