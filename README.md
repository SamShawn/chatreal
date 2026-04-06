# ChatReal - 实时协作聊天室

一个功能完整的实时协作聊天应用，使用 WebSocket 实现多用户在线实时收发消息。

## 功能特性

✨ **核心功能**
- 🔄 实时群组聊天 - 多用户在线实时收发消息，无延迟
- 📁 文件分享 - 支持上传图片/文档，实时发送给所有在线用户
- 🔍 消息搜索 - 支持关键词搜索历史消息
- 👥 用户在线状态 - 显示在线人数、在线用户列表
- 💾 消息持久化 - 使用 Redis 存储聊天记录
- 📱 响应式设计 - 支持移动端和 PC 端

⚡ **性能优化**
- 消息防抖处理
- 图片懒加载
- 避免重复渲染
- WebSocket 连接自动重连

## 技术栈

### 后端
- Node.js + Express - Web 服务器框架
- Socket.io - WebSocket 实时通信
- Redis - 数据存储和缓存
- CORS - 跨域支持

### 前端
- React 18 - UI 框架
- Socket.io-client - WebSocket 客户端
- Lucide React - 图标库
- 原生 CSS - 无第三方 UI 框架

## 项目结构

```
chatreal/
├── server/                 # 后端服务
│   ├── routes/            # 路由
│   ├── socket/            # Socket 处理
│   │   └── handler.js     # Socket.IO 事件处理器
│   ├── utils/             # 工具类
│   │   ├── redisClient.js # Redis 客户端
│   │   └── chatService.js # 聊天数据服务
│   ├── uploads/           # 文件上传目录
│   ├── .env               # 环境变量
│   ├── .env.example       # 环境变量示例
│   ├── package.json       # 依赖配置
│   └── server.js          # 主服务器文件
├── client/                # 前端应用
│   ├── public/            # 静态资源
│   │   └── index.html     # HTML 模板
│   ├── src/
│   │   ├── components/     # React 组件
│   │   │   ├── Login.js   # 登录组件
│   │   │   ├── Chat.js    # 聊天组件
│   │   │   └── MessageList.js # 消息列表组件
│   │   ├── hooks/         # React Hooks
│   │   ├── services/      # 服务层
│   │   │   └── socket.js  # Socket 服务
│   │   ├── styles/        # 样式文件
│   │   │   ├── global.css # 全局样式
│   │   │   └── App.css   # 应用样式
│   │   ├── utils/         # 工具函数
│   │   │   └── format.js  # 格式化函数
│   │   ├── App.js         # 主应用组件
│   │   └── index.js       # 入口文件
│   ├── .env               # 环境变量
│   └── package.json       # 依赖配置
└── README.md              # 项目文档
```

## 快速开始

### 前置要求

- Node.js >= 16.0.0
- Redis >= 6.0
- npm 或 yarn

### 1. 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

### 2. 启动 Redis

```bash
# macOS (使用 Homebrew)
brew services start redis

# 或使用 Docker
docker run -d -p 6379:6379 redis:latest

# 或直接启动 Redis
redis-server
```

### 3. 配置环境变量

后端配置文件 `server/.env`:
```env
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

前端配置文件 `client/.env`:
```env
REACT_APP_SERVER_URL=http://localhost:3001
```

### 4. 启动服务

**启动后端服务器:**
```bash
cd server
npm start

# 或使用开发模式（需要安装 nodemon）
npm run dev
```

**启动前端应用:**
```bash
cd client
npm start
```

### 5. 访问应用

打开浏览器访问: http://localhost:5173

## 使用说明

### 登录
1. 输入用户名（2-20 个字符）
2. 点击"加入聊天"按钮
3. 自动生成用户头像

### 聊天
1. 在输入框中输入消息
2. 按 Enter 键或点击发送按钮
3. 消息实时发送给所有在线用户

### 文件分享
1. 点击附件图标（📎）
2. 选择要上传的文件
3. 支持图片、文档等格式（最大 10MB）

### 消息搜索
1. 在搜索框中输入关键词
2. 自动搜索历史消息
3. 点击 X 清除搜索

### 在线用户
- 左侧边栏显示所有在线用户
- 显示用户名和头像
- 显示在线人数

## API 文档

### HTTP 接口

#### POST /api/upload
上传文件

**请求参数:**
- Content-Type: 文件 MIME 类型
- X-File-Name: 文件名
- Body: 文件二进制数据

**响应:**
```json
{
  "success": true,
  "fileUrl": "http://localhost:3001/uploads/xxx.png",
  "fileName": "xxx.png",
  "fileSize": 1024
}
```

#### GET /health
健康检查

**响应:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "redisConnected": true
}
```

### WebSocket 事件

#### 客户端发送事件

**user:join** - 用户加入
```json
{
  "username": "用户名",
  "avatar": "头像URL"
}
```

**message:send** - 发送消息
```json
{
  "roomId": "房间ID",
  "content": "消息内容",
  "type": "text|image|file",
  "fileUrl": "文件URL",
  "fileName": "文件名",
  "fileSize": 文件大小
}
```

**message:search** - 搜索消息
```json
{
  "roomId": "房间ID",
  "keyword": "搜索关键词"
}
```

**room:join** - 加入房间
```json
{
  "roomId": "房间ID"
}
```

**room:leave** - 离开房间
```json
{
  "roomId": "房间ID"
}
```

**room:history** - 获取历史消息
```json
{
  "roomId": "房间ID",
  "limit": 50
}
```

#### 服务器发送事件

**user:join:success** - 加入成功
**user:joined** - 其他用户加入
**user:left** - 用户离开
**message:new** - 新消息
**message:search:result** - 搜索结果
**room:join:success** - 加入房间成功
**room:leave:success** - 离开房间成功
**room:history:result** - 历史消息
**error** - 错误信息

## 开发说明

### 代码规范

- 使用 ESLint 进行代码检查
- 组件使用函数式组件 + Hooks
- 代码注释完整，逻辑清晰
- 错误处理完善

### 性能优化

1. **消息防抖**: 避免频繁发送消息
2. **图片懒加载**: 使用 loading="lazy"
3. **React 优化**: 使用 useCallback、useMemo
4. **WebSocket 复用**: 单例模式管理连接

### 安全考虑

- 文件上传大小限制
- 用户名长度验证
- Redis 连接错误处理
- CORS 配置

## 故障排查

### Redis 连接失败
```bash
# 检查 Redis 是否运行
redis-cli ping

# 重启 Redis
brew services restart redis
```

### Socket 连接失败
- 检查后端是否启动
- 检查端口是否被占用
- 查看浏览器控制台错误信息

### 文件上传失败
- 检查文件大小是否超过限制
- 检查上传目录权限
- 查看服务器日志

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 作者

ChatReal Team

---

Made with ❤️ using React + Socket.io + Redis
