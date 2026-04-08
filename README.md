# ChatReal - Enterprise Real-Time Chat Application

A production-ready enterprise real-time chat application with award-winning UI/UX design, built with React, TypeScript, Socket.IO, Express, Prisma, and PostgreSQL.

## Status

**Current Progress: ~50% Complete**

See [PLAN.md](./PLAN.md) for the full implementation roadmap.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client
- Axios

### Backend
- Express + TypeScript
- Socket.IO
- Prisma ORM
- PostgreSQL
- Redis (real-time cache)

## Project Structure

```
chatreal/
├── client/src/
│   ├── app/                    # App shell, providers, routing
│   ├── features/               # Feature modules
│   │   ├── auth/               # Login, Register
│   │   ├── chat/               # Chat components, hooks
│   │   ├── channels/           # Channel management
│   │   └── admin/              # Admin panel
│   ├── components/ui/           # Base UI components
│   ├── lib/
│   │   ├── api/                # Axios client
│   │   ├── socket/             # Socket.IO wrapper
│   │   └── utils/
│   ├── store/                  # Zustand stores
│   └── types/                  # TypeScript types
│
└── server/src/
    ├── config/                 # Environment config
    ├── controllers/            # HTTP handlers
    ├── services/               # Business logic
    ├── middleware/             # Auth, validation
    ├── routes/                 # Express routes
    ├── socket/                 # WebSocket handlers
    └── prisma/
        └── schema.prisma       # Database schema
```

## Features

### Implemented
- User registration & login (JWT)
- Real-time messaging (Socket.IO)
- Online presence tracking
- Message history
- Channel creation
- Thread panel
- Message search
- File upload UI
- Admin panel
- Responsive layout

### In Progress
- Token refresh mechanism
- Typing indicators
- Read receipts
- Message reactions
- Message pagination

### Planned
- Dark/light mode toggle
- Desktop notifications
- Rich text editor (@mentions, emojis)
- File upload backend
- Audit logging
- WCAG 2.1 AA accessibility

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Redis
- pnpm (recommended)

### Installation

```bash
# Install dependencies
cd server && pnpm install
cd ../client && pnpm install

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your database credentials

# Initialize database
cd server
pnpm db:generate
pnpm db:push

# Start development servers
pnpm dev        # Backend (port 3001)
cd ../client
pnpm dev        # Frontend (port 5173)
```

Or use the startup script:

```bash
./start.sh
```

### Environment Variables

**Server (`server/.env`)**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatreal"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
PORT=3001
```

## API Endpoints

### Auth
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Channels
```
GET    /api/v1/channels
POST   /api/v1/channels
GET    /api/v1/channels/:id
PATCH  /api/v1/channels/:id
DELETE /api/v1/channels/:id
```

### Messages
```
GET    /api/v1/conversations/:id/messages
POST   /api/v1/conversations/:id/messages
PATCH  /api/v1/messages/:id
DELETE /api/v1/messages/:id
```

## Socket Events

### Client → Server
- `auth:login` - Authenticate with JWT
- `message:send` - Send a message
- `typing:start` / `typing:stop` - Typing indicators
- `presence:update` - Update user status

### Server → Client
- `auth:success` - Authentication successful
- `message:new` - New message received
- `typing:update` - Typing status update
- `presence:changed` - User presence change

## Database Schema

The Prisma schema includes:
- User (with roles: ADMIN, MODERATOR, MEMBER, GUEST)
- Channel (PUBLIC, PRIVATE, DIRECT)
- Membership
- Conversation / ConversationParticipant
- Message (with threading support)
- Reaction
- File
- AuditLog
- Notification

## UI Components

Located in `client/src/components/ui/`:
- Avatar
- Badge
- Button
- Input
- Modal

## Available Scripts

### Client
```bash
pnpm dev      # Start dev server
pnpm build    # Production build
pnpm preview  # Preview production build
pnpm lint     # Run ESLint
```

### Server
```bash
pnpm dev          # Start dev server (tsx watch)
pnpm build        # Compile TypeScript
pnpm start         # Start production server
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database
pnpm db:migrate    # Run migrations
pnpm db:studio     # Open Prisma Studio
```

## Design Direction

- **Visual Style**: Minimalist, high information density
- **Color**: Low-saturation indigo (#6366f1) + cool gray
- **Typography**: Inter, 1.25 Major Third scale
- **Animation**: Fast (100-300ms), subtle ease-out curves
- **Layout**: Collapsible sidebar + thread panel slide-over

## License

MIT
