# Context Pruning Strategy
When context > 80%:
1. Summarize current task status to '.claude/memory/short_term.md'.
2. Delete chat history.
3. Reload 'short_term.md'.
