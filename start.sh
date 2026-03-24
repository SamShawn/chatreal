#!/bin/bash

echo "🚀 Chat Pulse - 实时协作聊天室"
echo "================================"
echo ""

# 检查 Redis 是否运行
echo "📦 检查 Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis 已运行"
else
    echo "❌ Redis 未运行，请先启动 Redis"
    echo "   macOS: brew services start redis"
    echo "   Docker: docker run -d -p 6379:6379 redis:latest"
    exit 1
fi

# 安装后端依赖
echo ""
echo "📦 检查后端依赖..."
if [ ! -d "server/node_modules" ]; then
    echo "⬇️ 安装后端依赖..."
    cd server && npm install && cd ..
else
    echo "✅ 后端依赖已安装"
fi

# 安装前端依赖
echo ""
echo "📦 检查前端依赖..."
if [ ! -d "client/node_modules" ]; then
    echo "⬇️ 安装前端依赖..."
    cd client && npm install && cd ..
else
    echo "✅ 前端依赖已安装"
fi

echo ""
echo "🎉 所有依赖已就绪！"
echo ""
echo "请在两个终端中分别运行："
echo ""
echo "终端 1 - 启动后端："
echo "  cd server && npm start"
echo ""
echo "终端 2 - 启动前端："
echo "  cd client && npm start"
echo ""
echo "然后在浏览器访问: http://localhost:3000"
