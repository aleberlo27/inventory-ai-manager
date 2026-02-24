# Inventory AI Manager

Full-stack inventory management system with AI-powered chat assistant. Built with Angular, Node.js, PostgreSQL and Claude API.

## Description

Inventory AI Manager is a web application that allows users to manage warehouses and products with real-time stock alerts, and interact with an AI assistant powered by Claude to query inventory data through natural language.

## Stack

### Frontend
- **Angular 20** (standalone components, zoneless)
- **PrimeNG** — UI component library
- **Tailwind CSS** — utility-first styling
- **@ngx-translate** — internationalization (ES/EN)
- **Jest** — unit tests
- **Playwright** — E2E tests

### Backend
- **Node.js + Express** — REST API
- **TypeScript** — type safety
- **Prisma ORM** — database access
- **PostgreSQL** — relational database
- **JWT** — authentication

### AI
- **Anthropic Claude API** — AI chat (called from backend only, API key never exposed to frontend)

## Architecture

```
┌─────────────────────────────────────┐
│           FRONTEND (Angular)        │
│  ┌──────────────┐  ┌─────────────┐  │
│  │  Main App    │  │  AI Chat    │  │
│  │  (routing)   │  │  Sidebar    │  │
│  └──────────────┘  └─────────────┘  │
└────────────────┬────────────────────┘
                 │ HTTP (REST)
┌────────────────▼────────────────────┐
│           BACKEND (Express)         │
│  /auth  /warehouses  /products  /ai │
└────────────────┬────────────────────┘
                 │ Prisma ORM
┌────────────────▼────────────────────┐
│           PostgreSQL                │
│  users  warehouses  products        │
└─────────────────────────────────────┘
```

## Prerequisites

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 14
- **Angular CLI**: `npm install -g @angular/cli`

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/inventory-ai-manager.git
cd inventory-ai-manager
```

### 2. Install root dependencies (Husky, lint-staged)

```bash
npm install
```

### 3. Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

### 4. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

### 5. Configure environment variables

Copy the example file and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/inventory_db"
JWT_SECRET="your-super-secret-jwt-key"
ANTHROPIC_API_KEY="sk-ant-..."
PORT=3000
```

### 6. Set up the database

```bash
cd backend
npm run db:migrate
npm run db:generate
cd ..
```

## Development

### Start both services simultaneously

```bash
npm run dev
```

Or start them separately:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm start
```

- Frontend: http://localhost:4200
- Backend: http://localhost:3000
- API Health: http://localhost:3000/health

## Tests

### Frontend unit tests

```bash
cd frontend
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

### Backend unit tests

```bash
cd backend
npm test                  # run all tests
npm run test:coverage     # with coverage report
```

### E2E tests (Playwright)

Requires frontend and backend running:

```bash
cd frontend
npm run test:e2e
```

## Code Quality

### Lint

```bash
# Frontend
cd frontend && npm run lint

# Backend
cd backend && npm run lint
```

### Typecheck

```bash
# Frontend
cd frontend && npm run typecheck

# Backend
cd backend && npm run typecheck
```

### Full quality check

```bash
# From root — runs lint + typecheck + tests for both projects
npm run verify
```

## Git Hooks (Husky)

- **pre-commit**: formats staged files (Prettier) + lint + typecheck for both projects
- **pre-push**: runs all unit tests + build for both projects

## Project Structure

```
inventory-ai-manager/
├── frontend/                 # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Guards, interceptors
│   │   │   ├── features/     # auth, warehouses, products, ai-chat, profile
│   │   │   ├── layout/       # MainLayout, AuthLayout
│   │   │   └── shared/       # Components, services, types, utils
│   │   ├── environments/     # Dev and prod environment config
│   │   └── main.ts
│   ├── e2e/                  # Playwright E2E tests
│   └── package.json
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── services/         # Business logic
│   │   ├── routes/           # Route definitions
│   │   ├── middleware/       # Auth, error handling
│   │   └── prisma/           # Database schema
│   ├── tests/                # Jest + Supertest tests
│   └── package.json
├── .husky/                   # Git hooks
├── .prettierrc               # Prettier config
├── package.json              # Root scripts
└── README.md
```

## Features

- **Authentication**: JWT-based register/login with token refresh
- **Warehouses**: CRUD operations for warehouse management
- **Products**: CRUD with SKU validation and stock tracking
- **Stock Alerts**: Visual alerts for low stock and empty products
- **AI Chat**: Claude-powered assistant with full inventory context
- **i18n**: Full Spanish/English internationalization
- **Error Handling**: Global 401 auto-logout, connection error toasts

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `ANTHROPIC_API_KEY` | Claude API key | Yes |
| `PORT` | Server port (default: 3000) | No |
