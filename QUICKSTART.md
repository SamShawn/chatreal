# 快速启动指南

## 🚀 5分钟快速启动

### 1. 安装依赖并启动 Redis

```bash
# 运行启动脚本
./start.sh
```

这个脚本会：
- ✅ 检查 Redis 是否运行
- ✅ 安装前端和后端依赖

### 2. 启动后端服务器

```bash
cd server
npm start
```

你会看到：
```
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║         🚀 ChatReal Server Started Successfully!       ║
║                                                            ║
║         📍 Server running on: http://localhost:3001         ║
║         🔌 WebSocket ready on: ws://localhost:3001         ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

### 3. 启动前端应用

打开新终端窗口：
```bash
cd client
npm start
```

浏览器会自动打开: http://localhost:3000

### 4. 开始聊天！

1. 输入用户名，点击"加入聊天"
2. 在多个浏览器窗口中打开应用，模拟多用户
3. 发送消息，享受实时聊天！

---

## 📝 手动启动（如果脚本失败）

### 安装依赖

```bash
# 后端
cd server
npm install

# 前端
cd ../client
npm install
```

### 启动 Redis

```bash
# macOS
brew services start redis

# 验证 Redis 运行
redis-cli ping  # 应返回 PONG
```

### 启动服务

**终端 1 - 后端：**
```bash
cd server
npm start
```

**终端 2 - 前端：**
```bash
cd client
npm start
```

---

## 🔧 常见问题

### Redis 未运行

```bash
# macOS
brew services start redis

# 或使用 Docker
docker run -d -p 6379:6379 redis:latest
```

### 端口被占用

修改 `server/.env` 中的 PORT：
```env
PORT=3002
```

### 依赖安装失败

```bash
# 清除缓存重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 功能测试

测试清单：

- [ ] 用户登录功能
- [ ] 实时发送和接收消息
- [ ] 多用户同时在线
- [ ] 文件上传（图片/文档）
- [ ] 消息搜索功能
- [ ] 在线用户列表显示
- [ ] 移动端响应式布局

---

## 📱 访问地址

- 前端应用：http://localhost:3000
- 后端 API：http://localhost:3001
- 健康检查：http://localhost:3001/health

---

## 🎉 完成！

现在你拥有一个功能完整的实时协作聊天室应用！

## 📚 更多信息

查看完整文档：[README.md](./README.md)
