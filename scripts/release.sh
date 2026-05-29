#!/bin/bash

# 发布脚本

set -e

echo "====================================="
echo "  AI Agent Desktop 发布脚本"
echo "====================================="

# 读取当前版本
VERSION=$(node -p "require('./package.json').version")
echo "当前版本: $VERSION"

# 询问版本类型
echo ""
echo "选择版本类型:"
echo "  1) patch (1.0.0 -> 1.0.1)"
echo "  2) minor (1.0.0 -> 1.1.0)"
echo "  3) major (1.0.0 -> 2.0.0)"
echo "  4) 自定义"
read -p "请选择 [1-4]: " choice

case $choice in
  1) npm version patch ;;
  2) npm version minor ;;
  3) npm version major ;;
  4)
    read -p "输入新版本: " NEW_VERSION
    npm version $NEW_VERSION --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    git tag v$NEW_VERSION
    ;;
  *)
    echo "无效选择"
    exit 1
    ;;
esac

# 获取新版本
NEW_VERSION=$(node -p "require('./package.json').version")
echo "新版本: $NEW_VERSION"

# 提交并推送
echo ""
echo "提交代码..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

echo "推送到 GitHub..."
git push
git push origin v$NEW_VERSION

echo ""
echo "✅ 发布完成!"
echo "📦 Release 将在 GitHub Actions 构建完成后自动发布"
echo "🔗 查看构建状态: https://github.com/dctongsheng/my-first-electron-app/actions"
