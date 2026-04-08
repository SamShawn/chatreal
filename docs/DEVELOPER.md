# ChatReal Developer Documentation

## Table of Contents

1. [Architecture](#architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [API Reference](#api-reference)
6. [Socket.IO Events](#socketio-events)
7. [Authentication Flow](#authentication-flow)
8. [State Management](#state-management)
9. [Component Library](#component-library)
10. [Environment Setup](#environment-setup)
11. [Testing](#testing)
12. [Deployment](#deployment)

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│  React 18 + TypeScript + Vite + Tailwind CSS + Zustand      │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼───────────────────────────────────┐
│                         Server                               │
│  Express + TypeScript + Socket.IO + Prisma + PostgreSQL     │
└─────────────────────────┬───────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
        ┌─────▼─────┐         ┌──────▼──────┐
        │ PostgreSQL │         │    Redis    │
        │ (Persist)  │         │  (Real-time) │
        └───────────┘         └─────────────┘
```

### Directory Structure

```
chatreal/
├── client/                     # React frontend
│   ├── src/
│   │   ├── app/               # App shell, providers, routing
│   │   │   └── providers/     # ThemeProvider, AuthProvider, SocketProvider
│   │   ├── features/          # Feature-based modules
│   │   │   ├── auth/
│   │   │   │   └── components/
│   │   │   │       ├── LoginPage.tsx
│   │   │   │       └── RegisterPage.tsx
│   │   │   ├── chat/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ChatLayout.tsx
│   │   │   │   │   ├── MessageList.tsx
│   │   │   │   │   ├── ThreadPanel.tsx
│   │   │   │   │   ├── FileUpload.tsx
│   │   │   │   │   └── SearchMessages.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── usePresence.ts
│   │   │   │   │   ├── useNotifications.ts
│   │   │   │   │   └── useResponsive.ts
│   │   │   │   └── stores/
│   │   │   ├── channels/
│   │   │   │   └── components/
│   │   │   │       └── CreateChannelModal.tsx
│   │   │   └── admin/
│   │   │       └── components/
│   │   │           └── AdminPanel.tsx
│   │   ├── components/ui/     # Base UI components
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── lib/
│   │   │   ├── api/           # Axios client (to be implemented)
│   │   │   ├── socket/        # Socket.IO client wrapper
│   │   │   └── utils/         # Format, validation helpers
│   │   ├── store/             # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   └── chatStore.ts
│   │   ├── styles/
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
└── server/                     # Express backend
    ├── src/
    │   ├── config/            # Environment config loader
    │   ├── controllers/       # HTTP request handlers
    │   ├── services/          # Business logic
    │   │   ├── authService.ts
    │   │   └── chatService.ts
    │   ├── middleware/        # Express middleware
    │   │   ├── auth.ts        # JWT verification
    │   │   ├── errorHandler.ts
    │   │   └── validation.ts
    │   ├── repositories/      # Data access layer (placeholder)
    │   ├── routes/           # Express routes
    │   │   ├── authRoutes.ts
    │   │   ├── chatRoutes.ts
    │   │   └── userRoutes.ts
    │   ├── socket/           # Socket.IO handlers
    │   │   ├── index.ts
    │   │   └── events/       # Event handlers (empty)
    │   ├── types/            # Server TypeScript types
    │   ├── utils/            # Utilities (empty)
    │   └── index.ts          # Server entry point
    ├── prisma/
    │   └── schema.prisma     # Database schema
    └── package.json
```

---

## Frontend Architecture

### State Management

#### Auth Store (`client/src/store/authStore.ts`)

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

Persisted to localStorage with key `chatreal-auth`.

#### Chat Store (`client/src/store/chatStore.ts`)

```typescript
interface ChatStore {
  messages: Message[];
  onlineUsers: User[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  searchResults: Message[];
  showSearchResults: boolean;
  // Actions
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setOnlineUsers: (users: User[]) => void;
  // ... more actions
}
```

### Type Definitions

```typescript
// client/src/types/index.ts

export interface User {
  id: string;
  username: string;
  avatar: string;
  color?: string;
  status?: 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE';
}

export interface Message {
  id: string;
  type: 'text' | 'image' | 'file' | 'system';
  content: string;
  sender: User;
  timestamp: number;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface SocketEvents {
  'socket:connected': () => void;
  'socket:disconnected': () => void;
  'message:new': (message: Message) => void;
  'message:history': (messages: Message[]) => void;
  'user:joined': (user: User) => void;
  'user:left': (user: User) => void;
}
```

### Socket.IO Client

Location: `client/src/lib/socket/` (structure in place, implementation needed)

---

## Backend Architecture

### Server Entry Point

`server/src/index.ts` - Initializes Express, Socket.IO, middleware, and routes.

### Middleware

| Middleware | File | Purpose |
|------------|------|---------|
| Auth | `middleware/auth.ts` | JWT token verification |
| Error Handler | `middleware/errorHandler.ts` | Global error handling |
| Validation | `middleware/validation.ts` | Request validation |

### Services

#### Auth Service (`server/src/services/authService.ts`)

Handles:
- User registration with bcrypt password hashing
- User login with JWT access token generation
- Password validation
- User data retrieval

#### Chat Service (`server/src/services/chatService.ts`)

Handles:
- Message creation and retrieval
- Channel operations
- User presence updates

### Routes

| Route | File | Description |
|-------|------|-------------|
| `/api/v1/auth` | `routes/authRoutes.ts` | Auth endpoints |
| `/api/v1/chat` | `routes/chatRoutes.ts` | Chat endpoints |
| `/api/v1/users` | `routes/userRoutes.ts` | User endpoints |

### Socket.IO Handler

`server/src/socket/index.ts` - Main Socket.IO server setup with event handlers.

---

## Database Schema

### Entity Relationship Diagram

```
User ──── Membership ──── Channel
 │                           │
 │                           │
 └─── ConversationParticipant ──── Conversation
         │
         └─── Message ──── Reaction
                │
                └─── File

User ──── AuditLog
User ──── Notification
```

### Models

#### User

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key (cuid) |
| email | String | Unique email |
| username | String | Unique username |
| passwordHash | String | Bcrypt hash |
| avatar | String? | Profile URL |
| status | UserStatus | ONLINE/AWAY/DND/OFFLINE |
| role | Role | ADMIN/MODERATOR/MEMBER/GUEST |
| bannedAt | DateTime? | Ban timestamp |
| refreshToken | String? | Refresh token |
| refreshTokenExpiry | DateTime? | Refresh expiry |

#### Channel

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| name | String | Channel name |
| description | String? | Channel description |
| type | ChannelType | PUBLIC/PRIVATE/DIRECT |
| ownerId | String | FK to User |

#### Message

| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| content | String | Message text |
| type | MessageType | TEXT/IMAGE/FILE/SYSTEM |
| senderId | String | FK to User |
| channelId | String? | FK to Channel |
| conversationId | String? | FK to Conversation |
| threadId | String? | FK to Message (parent) |
| editedAt | DateTime? | Edit timestamp |
| pinnedAt | DateTime? | Pin timestamp |
| deletedAt | DateTime? | Soft delete |

#### Conversation

Direct message container. Participants stored in `ConversationParticipant`.

---

## API Reference

### Base URL

```
http://localhost:3001/api/v1
```

### Authentication

All protected routes require `Authorization: Bearer <token>` header.

### Endpoints

#### Auth

##### POST /auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "username": "johndoe",
    "avatar": null,
    "status": "OFFLINE",
    "role": "MEMBER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

##### POST /auth/login

Login user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "cuid123",
    "email": "user@example.com",
    "username": "johndoe",
    "avatar": null,
    "status": "ONLINE",
    "role": "MEMBER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

##### GET /auth/me

Get current user.

**Response (200):**
```json
{
  "id": "cuid123",
  "email": "user@example.com",
  "username": "johndoe",
  "avatar": null,
  "status": "ONLINE",
  "role": "MEMBER"
}
```

#### Channels

##### GET /channels

List all channels.

##### POST /channels

Create a channel.

**Request:**
```json
{
  "name": "general",
  "description": "General discussion",
  "type": "PUBLIC"
}
```

##### GET /channels/:id

Get channel by ID.

##### PATCH /channels/:id

Update channel.

##### DELETE /channels/:id

Delete channel.

#### Messages

##### GET /conversations/:id/messages

Get messages for a conversation.

**Query params:**
- `limit` (default: 50)
- `before` (cursor for pagination)

##### POST /conversations/:id/messages

Send a message.

**Request:**
```json
{
  "content": "Hello, world!",
  "type": "TEXT"
}
```

##### PATCH /messages/:id

Edit a message.

##### DELETE /messages/:id

Delete a message (soft delete).

---

## Socket.IO Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `auth:login` | `{ token: string }` | Authenticate connection |
| `message:send` | `{ conversationId, content, type }` | Send message |
| `message:edit` | `{ id, content }` | Edit message |
| `message:delete` | `{ id }` | Delete message |
| `typing:start` | `{ conversationId }` | Start typing |
| `typing:stop` | `{ conversationId }` | Stop typing |
| `presence:update` | `{ status }` | Update presence |
| `conversation:join` | `{ id }` | Join conversation |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `auth:success` | `{ user }` | Auth successful |
| `auth:error` | `{ error }` | Auth failed |
| `message:new` | `{ message }` | New message |
| `message:edited` | `{ id, content, editedAt }` | Message edited |
| `message:deleted` | `{ id }` | Message deleted |
| `typing:update` | `{ conversationId, users }` | Typing users |
| `presence:changed` | `{ userId, status }` | Presence changed |
| `user:joined` | `{ user }` | User joined |
| `user:left` | `{ user }` | User left |

### Event Flow Examples

#### Sending a Message

```
Client                          Server
  │                                │
  │  ──── message:send ──────────► │
  │     { conversationId,         │
  │       content }                │
  │                                │ [Validate & Persist]
  │                                │
  │  ◄──── message:new ─────────── │
  │     { message }                │
  │                                │
```

#### Typing Indicator

```
Client A                        Server                       Client B
   │                               │                             │
   │  ──── typing:start ─────────► │                             │
   │                               │                             │
   │                               │  ──── typing:update ──────► │
   │                               │     { users: [A] }           │
   │                               │                             │
   │  ──── typing:stop ──────────► │                             │
   │                               │                             │
   │                               │  ──── typing:update ──────► │
   │                               │     { users: [] }          │
```

---

## Authentication Flow

### Registration

```
Client                          Server                         Database
   │                               │                               │
   │  POST /auth/register          │                               │
   │  { email, username,           │                               │
   │    password }                 │                               │
   │                               │                               │
   │                               │  ──── Create User ──────────► │
   │                               │                               │
   │                               │  ◄──── User Created ─────── │
   │                               │                               │
   │  ◄──── { user, token } ───── │                               │
   │                               │                               │
```

### Login

```
Client                          Server                         Database
   │                               │                               │
   │  POST /auth/login             │                               │
   │  { email, password }          │                               │
   │                               │                               │
   │                               │  ──── Find User ────────────► │
   │                               │                               │
   │                               │  ◄──── User + Hash ──────── │
   │                               │                               │
   │                               │  [Verify Password]           │
   │                               │                               │
   │                               │  [Generate JWT]             │
   │                               │                               │
   │  ◄──── { user, token } ───── │                               │
   │                               │                               │
```

### WebSocket Authentication

```
Client                          Server
   │                               │
   │  Socket Connection             │
   │  ───────────────────────────► │
   │                               │
   │  auth:login { token }         │
   │  ───────────────────────────► │
   │                               │
   │                               │ [Verify JWT]
   │                               │
   │  ◄──── auth:success { user }  │
   │                               │
```

---

## State Management

### Store Structure

```
stores/
├── authStore.ts          # User authentication state
├── chatStore.ts          # Messages, online users, connection
└── uiStore.ts            # UI state (theme, sidebar, modals)

features/*/stores/         # Feature-specific stores (future)
```

### Persisted State

Only `authStore` is persisted to localStorage. Chat state is ephemeral.

### Store Usage Pattern

```typescript
// In components
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';

function ChatComponent() {
  const { user, logout } = useAuthStore();
  const { messages, addMessage } = useChatStore();

  // ...
}
```

---

## Component Library

### Base Components

Location: `client/src/components/ui/`

#### Avatar

```tsx
<Avatar
  src={user.avatar}
  name={user.username}
  status={user.status}  // 'ONLINE' | 'AWAY' | 'DND' | 'OFFLINE'
  size="md"              // 'sm' | 'md' | 'lg'
/>
```

#### Badge

```tsx
<Badge variant="primary" size="sm">
  New
</Badge>

// Variants: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
```

#### Button

```tsx
<Button
  variant="primary"      // 'primary' | 'secondary' | 'ghost' | 'danger'
  size="md"              // 'sm' | 'md' | 'lg'
  disabled={false}
  loading={false}
  onClick={handleClick}
>
  Click me
</Button>
```

#### Input

```tsx
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={handleChange}
  error="Error message"
/>
```

#### Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Modal Title"
>
  Modal content here
</Modal>
```

---

## Environment Setup

### Required Tools

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL 14+
- Redis 6+

### Environment Variables

Create `server/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/chatreal"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV=development

# CORS
CLIENT_URL="http://localhost:5173"
```

### Database Setup

```bash
cd server

# Generate Prisma client
pnpm db:generate

# Push schema to database (creates tables)
pnpm db:push

# Or run migrations
pnpm db:migrate
```

### Running Development Servers

```bash
# Terminal 1 - Backend
cd server
pnpm dev

# Terminal 2 - Frontend
cd client
pnpm dev
```

---

## Testing

### Manual Testing Checklist

- [ ] User registration creates account
- [ ] User login returns JWT
- [ ] Protected routes reject requests without token
- [ ] Socket connection authenticates with JWT
- [ ] Messages persist across page reloads
- [ ] Online users update in real-time
- [ ] Typing indicators appear within 500ms
- [ ] Theme toggle persists across sessions

### API Testing with curl

```bash
# Register
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"test","password":"password123"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get current user
curl http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Deployment

### Production Build

```bash
# Backend
cd server
pnpm build
pnpm start

# Frontend
cd client
pnpm build
# Serve dist/ with nginx or similar
```

### Docker (Future)

```dockerfile
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: chatreal
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password

  redis:
    image: redis:6

  server:
    build: ./server
    ports:
      - "3001:3001"

  client:
    build: ./client
    ports:
      - "80:80"
```

### Nginx Configuration (Production)

```nginx
server {
    listen 80;
    server_name chatreal.example.com;

    # Frontend
    location / {
        root /var/www/chatreal/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO
    location /socket.io {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Contributing

### Code Style

- Use TypeScript strict mode
- 2-space indentation
- Single quotes for strings
- No semicolons
- ESLint + Prettier for formatting

### Commit Messages

Follow Conventional Commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance

### Pull Request Process

1. Create feature branch from `master`
2. Implement changes
3. Add tests if applicable
4. Update documentation
5. Submit PR for review
