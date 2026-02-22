# Inventory Manager with AI Chat - LLM Instructions

## Stack

### Frontend
Angular + TypeScript + PrimeNG + Tailwind CSS + Jest + Playwright

### Backend
Node.js + Express + TypeScript + Prisma ORM + PostgreSQL

### AI
Anthropic API (Claude) — llamada SIEMPRE desde el backend, nunca exponer la API key en el frontend

---

## Architecture Overview

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

---

## TDD - MANDATORY

1. Write test FIRST → run → MUST FAIL
2. Implement MINIMUM code to pass
3. Refactor keeping tests green

---

## File Organization (Scope Rule)

- `src/app/shared/` → usado por múltiples features
- `src/app/features/X/` → específico de una sola feature
- `backend/src/` → código del servidor

---

## Project Structure

### Frontend
```
src/
├── app/
│   ├── shared/
│   │   ├── types/            # interfaces globales (User, Warehouse, Product)
│   │   ├── utils/            # funciones puras reutilizables
│   │   ├── constants/        # constantes globales
│   │   ├── components/       # componentes reutilizables (ConfirmDialog, etc.)
│   │   └── services/         # AuthService, HttpClient wrappers
│   ├── features/
│   │   ├── auth/             # login, registro, guards
│   │   ├── warehouses/       # lista y detalle de almacenes
│   │   ├── products/         # CRUD productos por almacén
│   │   ├── ai-chat/          # sidebar de chat siempre visible
│   │   └── profile/          # perfil y configuración del usuario
│   ├── core/
│   │   ├── interceptors/     # JWT interceptor, error interceptor
│   │   └── guards/           # auth.guard, warehouse.guard
│   ├── layout/
│   │   ├── main-layout/      # layout con sidebar de chat
│   │   └── auth-layout/      # layout sin sidebar (login/registro)
│   └── app.routes.ts
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
e2e/
├── pages/                    # Page Objects
└── *.spec.ts
```

### Backend
```
backend/
├── src/
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── warehouse.routes.ts
│   │   ├── product.routes.ts
│   │   └── ai.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── warehouse.controller.ts
│   │   ├── product.controller.ts
│   │   └── ai.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── warehouse.service.ts
│   │   ├── product.service.ts
│   │   └── ai.service.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts    # JWT validation
│   │   └── error.middleware.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── app.ts
├── tests/
│   ├── auth.test.ts
│   ├── warehouse.test.ts
│   ├── product.test.ts
│   └── ai.test.ts
├── .env.example
└── package.json
```

---

## Database Schema (Prisma)

```prisma
model User {
  id         String      @id @default(uuid())
  email      String      @unique
  password   String      # bcrypt hash
  name       String
  avatar     String?
  createdAt  DateTime    @default(now())
  warehouses Warehouse[]
}

model Warehouse {
  id          String    @id @default(uuid())
  name        String
  location    String
  description String?
  createdAt   DateTime  @default(now())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  products    Product[]
}

model Product {
  id          String    @id @default(uuid())
  name        String
  sku         String    @unique
  quantity    Int       @default(0)
  unit        String    # unidades, kg, litros...
  category    String?
  minStock    Int       @default(5)  # umbral de stock bajo
  createdAt   DateTime  @default(now())
  warehouseId String
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id])
}
```

---

## Layout: Chat Sidebar

El chat es un **sidebar fijo a la derecha** siempre visible tras el login. El layout principal tiene dos columnas:

```
┌──────────────────────────┬──────────────┐
│                          │              │
│     Main Content         │  AI Chat     │
│     (router-outlet)      │  Sidebar     │
│                          │  (siempre    │
│                          │   visible)   │
│                          │              │
└──────────────────────────┴──────────────┘
```

El chat puede recibir el inventario completo como contexto y navegar al producto usando `Router.navigate()`.

---

## Auth Flow

```
/ → redirect to /auth/login (si no autenticado)
/auth/login → formulario de login
/auth/register → formulario de registro
/app → layout principal (protegido por auth.guard)
  /app/warehouses → lista de almacenes
  /app/warehouses/:id → detalle del almacén + productos
  /app/profile → perfil del usuario
```

JWT guardado en `localStorage`. Interceptor añade `Authorization: Bearer <token>` en cada petición.

---

## AI Chat - Diseño

- El `AiService` del backend recibe el mensaje del usuario y el inventario completo (almacenes + productos con stock)
- Se construye un **system prompt** describiendo el rol del asistente y los datos disponibles
- La respuesta puede incluir un `productLink` con la ruta `/app/warehouses/:warehouseId` para navegar directamente
- El historial de conversación se mantiene en memoria en Angular (Signal o BehaviorSubject)
- **Nunca** se expone la API key de Anthropic al frontend

---

## Critical Configurations

### jest.config.ts (Frontend)
```ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testPathPattern: ['src/.*\\.spec\\.ts$'],
  collectCoverageFrom: ['src/app/**/*.ts', '!src/app/**/*.module.ts'],
};
```

### jest.config.ts (Backend)
```ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
```

### Tailwind + PrimeNG
- Importar tema PrimeNG ANTES de Tailwind base en `styles.scss`
- `tailwind.config.js` con `content: ['src/**/*.{html,ts}']`

### Husky: `git init` ANTES de `husky init`

---

## Scripts

### Frontend
- `npm test` → Jest unit tests
- `npm run test:coverage` → cobertura
- `npm run test:e2e` → Playwright
- `npm run lint` → ESLint
- `npm run quality` → lint + typecheck + test
- `npm run verify` → quality + test:e2e + build

### Backend
- `npm test` → Jest + Supertest
- `npm run dev` → ts-node-dev
- `npm run build` → tsc
- `npm run db:migrate` → prisma migrate dev
- `npm run db:studio` → prisma studio

---

## Development Steps

| Step | Área     | Key Items                                                              |
| ---- | -------- | ---------------------------------------------------------------------- |
| 01   | Setup    | Monorepo, Angular CLI, PrimeNG, Tailwind, Jest, Playwright config      |
| 02   | Setup    | Backend: Express + TypeScript + Prisma + PostgreSQL config             |
| 03   | Shared   | Tipos compartidos: User, Warehouse, Product, ApiResponse               |
| 04   | Backend  | Auth routes + controller + service TDD (register, login, JWT)          |
| 05   | Frontend | AuthService, login/registro forms TDD, auth.guard                      |
| 06   | Frontend | JWT Interceptor + error interceptor TDD                                |
| 07   | Backend  | Warehouse routes + controller + service TDD (CRUD)                     |
| 08   | Frontend | WarehouseService + WarehouseList + WarehouseCard TDD                   |
| 09   | Frontend | WarehouseForm (crear/editar) TDD con PrimeNG                           |
| 10   | Backend  | Product routes + controller + service TDD (CRUD por almacén)           |
| 11   | Frontend | ProductService + ProductList + ProductCard TDD (con alerta stock bajo) |
| 12   | Frontend | ProductForm (crear/editar, validación SKU) TDD                         |
| 13   | Frontend | Layout principal: MainLayout + AuthLayout + routing completo           |
| 14   | Frontend | Profile feature: ver y editar datos del usuario                        |
| 15   | Backend  | AI route: prompt con contexto de inventario, respuesta con links       |
| 16   | Frontend | AiChat sidebar: input, historial, navegación a producto                |
| 17   | E2E      | Playwright: auth flow, warehouses CRUD, products CRUD                  |
| 18   | E2E      | Playwright: AI chat interactions, navegación desde chat                |
| 19   | Quality  | ESLint + SonarJS, Husky pre-commit/pre-push                            |
| 20   | Polish   | Environments, loading states, error handling global, stock alerts      |
| 16   | Deploy   | Railway (backend + PostgreSQL) + Vercel (frontend) + seed datos demo   |

---

## Expected Test Counts

- Frontend Unit/Integration: ~90
- Backend Unit/Integration: ~40
- E2E: ~12

---

## Validation

`npm run verify` debe pasar: 0 errores de lint, 0 errores de tipos, todos los tests en verde, build exitoso.
