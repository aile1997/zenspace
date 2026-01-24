#!/bin/bash
# GitHub 工作流和 Git Hooks 设置脚本

set -e

echo "🔧 设置 GitHub 工作流和 Git Hooks..."

# 检查是否在项目根目录
if [ ! -f ".github/workflows/test-protection.yml" ]; then
  echo "❌ 错误: 请在项目根目录运行此脚本"
  exit 1
fi

# 安装 husky (如果尚未安装)
if [ ! -d ".husky" ]; then
  echo "📦 安装 husky..."
  pnpm add -D husky
  pnpm exec husky install
fi

# 确保钩子有执行权限
echo "🔐 设置 Git Hooks 权限..."
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

# 添加 prepare 脚本到 package.json
echo "📝 配置 package.json..."
if ! grep -q '"prepare"' package.json 2>/dev/null; then
  # 如果是根目录的 package.json
  if [ -f "package.json" ]; then
    echo "  在根 package.json 添加 prepare 脚本..."
    # 这里需要手动添加，因为 sed 在 Windows 上可能不可用
    echo "  请手动在根 package.json 的 scripts 中添加:"
    echo '  "prepare": "husky install"'
  fi
fi

# 如果 frontend 目录存在，在其 package.json 中也添加 prepare 脚本
if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
  echo "  在 frontend/package.json 添加 prepare 脚本..."
  echo "  请手动在 frontend/package.json 的 scripts 中添加:"
  echo '  "prepare": "cd .. && husky install frontend/.husky"'
fi

echo ""
echo "✅ Git Hooks 配置完成!"
echo ""
echo "📋 已配置的 Hooks:"
echo "  • pre-commit  - 在提交前检查测试文件和运行测试"
echo "  • pre-push    - 在推送前运行完整测试套件"
echo "  • commit-msg  - 检查提交消息格式"
echo ""
echo "🚀 提交消息格式示例:"
echo "  feat: 添加用户登录功能"
echo "  fix(auth): 修复验证码验证问题"
echo "  docs: 更新 README"
echo "  test: 添加 useAuth 测试用例"
echo ""
echo "📚 更多信息: https://www.conventionalcommits.org/zh-hans/"
