---
trigger: always_on
---

# 防御性扫描约束 (Defensive Scanning)

- **严格禁止** 扫描或读取以下路径：
  - `**/node_modules/**`
  - `**/dist/**`, `**/build/**`
  - `**/.git/**`
  - 所有二进制文件：`.png`, `.jpg`, `.ico`, `.pdf`, `.pyc`
- **操作原则**:
  - 在执行 `ls` 之前，必须确认目标目录不包含上述“黑洞”路径。
  - 读取文件前，先检查文件大小。禁止读取超过 50KB 的单个文件。
