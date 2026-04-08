# Enterprise Chat Application - Implementation Plan

## Context

Transform the existing `chatreal` prototype into a production-ready enterprise real-time chat application with award-winning UI/UX design. The current codebase is a functional MVP with basic chat, but lacks enterprise features (auth, permissions, channels, persistence) and needs design modernization.

**Why this matters**: A chat platform for enterprise teams needs to feel premium, performant, and trustworthy—mirroring the quality of Slack, Teams, or Discord while being more refined aesthetically.

---

## Design Direction (Award-Winning UI/UX)

- **Visual Style**: Minimalist, high information density without clutter, inspired by iF/Red Dot award-winning SaaS products
- **Color System**: Low-saturation primary (#6366f1 indigo) + cool gray neutral scale
- **Typography**: Inter font, 1.25 Major Third scale, generous line-height (1.5-1.625)
- **Animation**: Fast (100-300ms), subtle ease-out curves, no bounce
- **Layout**: Collapsible sidebar, thread panel slide-over, responsive 3-tier layout

---

## Architecture Overview

### Technology Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + TypeScript + Vite | Existing, upgrade to TypeScript strict |
| Styling | Tailwind CSS + CSS Variables | Design system foundation |
| State | Zustand (slices pattern) | Keep existing, enhance with middleware |
| Real-time | Socket.IO (TypeScript) | Existing, needs refactor |
| Backend | Express + TypeScript | Migrate from JavaScript |
| Database | Redis (cache) + PostgreSQL (persistent) | Dual-store, Redis for real-time |
| ORM | Prisma | Type-safe, clean schema |
| Auth | JWT (access) + HTTP-only cookie (refresh) | Secure, stateless |

### Project Structure

```
chatreal/
├── client/src/
│   ├── app/                    # App shell, providers, routing
│   ├── features/               # Feature modules (auth, chat, channels, admin)
│   │   ├── auth/{components, hooks, stores, api, types}
│   │   ├── chat/{components, hooks, stores, api, types}
│   │   ├── channels/{...}
│   │   ├── users/{...}
│   │   └── admin/{...}
│   ├── components/
│   │   └── ui/                 # Base UI (Button, Input, Avatar, Modal, etc.)
│   ├── lib/
│   │   ├── api/                # Axios client + typed endpoints
│   │   ├── socket/             # Socket.IO client wrapper
│   │   └── utils/              # Format, validation helpers
│   ├── stores/                 # Global Zustand stores
│   └── types/                  # Shared TypeScript types
│
└── server/src/
    ├── config/                 # Environment, database config
    ├── controllers/             # HTTP handlers
    ├── services/               # Business logic
    ├── middleware/             # Auth, RBAC, validation
    ├── repositories/           # Data access layer
    ├── socket/                 # WebSocket handlers
    ├── routes/                 # Express routes
    └── types/                  # Server TypeScript types
```

---

## Implementation Phases

### Phase 1: Foundation & Auth
**Files to create/modify:**
1. Set up server TypeScript (`server/tsconfig.json`, migrate `.js` to `.ts`)
2. Configure Prisma with PostgreSQL schema
3. Implement JWT auth middleware + auth routes
4. Create API client (`lib/api/client.ts`) with interceptors
5. Build login/register UI with validation

**Deliverables:**
- User registration/login with JWT
- Protected API routes
- Client auth store with token refresh

### Phase 2: Core Chat Architecture
**Files to create/modify:**
1. Refactor Socket.IO with TypeScript events
2. Create conversation/channel stores
3. Build message list with virtualization (react-virtual)
4. Implement message CRUD via REST + real-time sync
5. Add presence system (online/away/dnd)

**Deliverables:**
- Real-time messaging with reliable delivery
- Message history pagination
- Typing indicators, read receipts
- Online presence tracking

### Phase 3: UI/UX Modernization
**Files to create/modify:**
1. Design system: CSS variables, Tailwind config
2. Base UI components (Button, Input, Avatar, Badge, Modal)
3. Chat layout: Sidebar + Main + Thread panel
4. Dark/light mode with system preference detection
5. Responsive breakpoints

**Deliverables:**
- Premium look and feel matching award-winning aesthetics
- Smooth 60fps animations
- Mobile-responsive layout

### Phase 4: Enterprise Features
**Files to create/modify:**
1. Channel management (create, invite, settings)
2. Direct messages
3. Message reactions
4. Thread replies
5. File upload with preview
6. Message search

**Deliverables:**
- Full Slack/Teams feature parity
- Rich message interactions
- File sharing

### Phase 5: Admin & Polish
**Files to create/modify:**
1. Admin panel (user management, bans)
2. Audit logging
3. Desktop notifications
4. Performance optimization
5. Accessibility audit (WCAG 2.1 AA)

**Deliverables:**
- Production-ready system

---

## Critical Files Summary

### Client - First Priority
| File | Purpose |
|------|---------|
| `client/src/app/providers/` | ThemeProvider, AuthProvider, SocketProvider |
| `client/src/lib/api/client.ts` | Axios instance with interceptors |
| `client/src/lib/socket/client.ts` | Typed Socket.IO wrapper |
| `client/src/stores/authStore.ts` | Enhanced auth with JWT handling |
| `client/src/types/index.ts` | Comprehensive shared types |

### Server - First Priority
| File | Purpose |
|------|---------|
| `server/src/config/index.ts` | TypeScript config loader |
| `server/prisma/schema.prisma` | Database schema |
| `server/src/middleware/auth.ts` | JWT verification middleware |
| `server/src/services/authService.ts` | Auth business logic |
| `server/src/socket/index.ts` | Typed Socket.IO setup |

---

## Socket Event Design

```typescript
// Client → Server
'auth:login'      → { token }
'presence:update' → { status }
'message:send'    → { conversationId, content, type }
'message:edit'    → { id, content }
'message:delete'  → { id }
'typing:start'    → { conversationId }
'typing:stop'     → { conversationId }
'conversation:join' → { id }

// Server → Client
'auth:success'       → { user }
'message:new'        → { message }
'message:edited'     → { id, content, editedAt }
'message:deleted'    → { id }
'typing:update'      → { conversationId, users }
'presence:changed'   → { userId, status }
```

---

## API Endpoints

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

GET    /api/v1/users
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id

GET    /api/v1/channels
POST   /api/v1/channels
GET    /api/v1/channels/:id
PATCH  /api/v1/channels/:id
DELETE /api/v1/channels/:id

GET    /api/v1/conversations
POST   /api/v1/conversations
GET    /api/v1/conversations/:id

GET    /api/v1/conversations/:id/messages
POST   /api/v1/conversations/:id/messages
PATCH  /api/v1/messages/:id
DELETE /api/v1/messages/:id
POST   /api/v1/messages/:id/reactions

POST   /api/v1/files/upload
```

---

## Verification

1. **Run client**: `cd client && pnpm dev` → Login page renders
2. **Run server**: `cd server && pnpm dev` → Server starts on port 3001
3. **Login flow**: Register → Login → JWT stored → Redirect to chat
4. **Send message**: Type message → Socket emit → Server persists → Broadcast → UI updates
5. **Dark mode**: Toggle theme → CSS variables switch → No flash on reload
6. **Responsive**: Resize browser → Layout adapts at 768px, 480px breakpoints
7. **Real-time**: Open two browsers → Send message → Appears instantly in other

---

## Confirmed Implementation Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | Redis + PostgreSQL | Production-ready from day one |
| Features | Full implementation | All 12 enterprise features |
| UI Components | Custom + Radix UI | Full design control + accessible |

---

## Scope: All 12 Enterprise Features

1. ✅ User authentication & permissions (RBAC with JWT)
2. ✅ Single chat, group chat, channels (DMs + public/private channels)
3. ✅ Real-time WebSocket messaging (Socket.IO with Redis adapter)
4. ✅ Rich text, emojis, @mentions, replies, quotes (TipTap or custom)
5. ✅ File upload preview (images/docs/video)
6. ✅ Message edit, delete, pin, search history
7. ✅ Online status, read receipts, typing indicators
8. ✅ Desktop notifications, badge counts
9. ✅ Dark/light mode toggle
10. ✅ Responsive layout (PC/tablet/mobile)
11. ✅ Admin panel: users, channels, logs, bans
12. ✅ Data persistence, reliable message delivery
