# ChatReal — Enterprise Real-Time Chat

A production-ready real-time chat application with a refined editorial UI, built with React, TypeScript, Socket.IO, Express, and Prisma.

## Tech Stack

### Frontend
- React 18 + TypeScript + Vite
- Tailwind CSS
- Zustand (state management)
- Socket.IO Client
- Axios
- Vitest (testing)

### Backend
- Express + TypeScript
- Socket.IO
- Prisma ORM
- PostgreSQL
- JWT (cookie-based auth)

## Quick Start

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

## Project Structure

```
chatreal/
├── client/src/
│   ├── app/                    # App shell, providers, routing
│   ├── features/               # Feature modules
│   │   ├── auth/               # Login, Register
│   │   ├── chat/               # Chat components, hooks
│   │   └── channels/           # Channel management
│   ├── components/ui/           # Base UI components (design system)
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
    └── socket/                 # WebSocket handlers
```

## Features

### Implemented
- User registration & login (JWT with httpOnly cookies)
- Real-time messaging (Socket.IO)
- Online presence tracking
- Message history with pagination
- Channel creation & management (PUBLIC, PRIVATE, DIRECT)
- Thread panel (reply-in-thread)
- Message search
- Responsive collapsible sidebar layout
- Admin panel
- Modal component system

### In Progress
- Typing indicators
- Read receipts
- Message reactions
- Token refresh mechanism

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
- `auth:login` — Authenticate with JWT
- `message:send` — Send a message
- `presence:update` — Update user status

### Server → Client
- `auth:success` — Authentication successful
- `message:new` — New message received
- `presence:changed` — User presence change

## Available Scripts

### Client
```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm test         # Run tests
```

### Server
```bash
pnpm dev          # Start dev server (tsx watch)
pnpm build        # Compile TypeScript
pnpm start        # Start production server
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
```

## Environment Variables

**Server (`server/.env`)**

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatreal"
JWT_SECRET="your-secret-key"
PORT=3001
```

## License

MIT
