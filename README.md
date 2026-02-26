# WillowPrints Backend (WP-BE)

NestJS API with TypeScript, **Supabase (PostgreSQL)**, and Prisma. JWT auth, roles (user/admin), Products and Orders CRUD. No Docker—ready for local development and free-tier deployment (e.g. Render). Connects to WP-FE (Next.js) at `http://localhost:3001`.

---

## 1. Supabase database

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. Go to **Project Settings → Database**.
3. Under **Connection string**, copy the **URI** (use **Direct connection** or **Session** mode).
4. Replace `[YOUR-PASSWORD]` with your database password (same page). Replace `[PROJECT-REF]` with your project reference if not already in the URL.

Example format:

```text
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxx.supabase.co:5432/postgres
```

**If you get `P1001: Can't reach database server`:**

- **Project paused (free tier):** Supabase pauses inactive projects. Open your project in the [Supabase Dashboard](https://supabase.com/dashboard), wait for it to resume (green status), then run the migration again.
- **Session pooler:** Try the **Session** connection string (port **6543**) from Project Settings → Database → Connection string → URI (Session mode). Use that as `DATABASE_URL` and run `npx prisma migrate dev` again.
- **Password:** If your database password contains `@`, `#`, `%`, or `?`, [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) those characters in the connection string.

---

## 2. Local setup

### Environment

```bash
cp .env.example .env
```

Edit `.env`:

- **DATABASE_URL** – Supabase connection string from step 1.
- **JWT_SECRET** – Any long random string (e.g. `openssl rand -base64 32`).
- **PORT** – Optional; default `4000`.

### Install and Prisma

Install deps (scripts are skipped via `.npmrc` to avoid Prisma preinstall issues in some environments). Then generate the client and run migrations:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Seed (optional)

Seeds sample products and an admin user (`admin@willowprints.test` / `admin123`):

```bash
npm run prisma:seed
```

Or:

```bash
npx prisma db seed
```

### Run the API

```bash
npm run start:dev
```

API runs at **http://localhost:4000**. CORS is enabled for **http://localhost:3001** (WP-FE).

---

## 3. API overview

### Auth (public)

| Method | Endpoint         | Body                          | Description            |
|--------|------------------|-------------------------------|------------------------|
| POST   | `/auth/register` | `{ email, password, name? }`   | Register; returns JWT + user |
| POST   | `/auth/login`    | `{ email, password }`         | Login; returns JWT + user   |

### Users (JWT required)

| Method | Endpoint    | Description              |
|--------|-------------|--------------------------|
| GET    | `/users/me` | Current user info        |
| GET    | `/users`    | **Admin only:** list all users |

### Products

| Method | Endpoint          | Description                |
|--------|-------------------|----------------------------|
| GET    | `/products`       | **Public:** list all       |
| GET    | `/products/:id`   | **Public:** product by id  |
| POST   | `/products`       | **Admin:** create          |
| PATCH  | `/products/:id`   | **Admin:** update          |
| DELETE | `/products/:id`  | **Admin:** delete          |

### Orders (JWT required)

| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| POST   | `/orders`              | Create order; body: `{ items: [{ productId, quantity }] }` |
| GET    | `/orders/me`           | Current user's orders     |
| GET    | `/orders`              | **Admin:** list all orders |
| PATCH  | `/orders/:id/status`   | **Admin:** set status (`pending` \| `completed` \| `cancelled`) |

---

## 4. Deploy (e.g. Render free tier)

1. Push the repo to GitHub.
2. On [Render](https://render.com): **New → Web Service**, connect the repo, root directory `WP-BE` (or wherever the backend lives).
3. **Build command:** `npm install && npx prisma generate && npm run build`
4. **Start command:** `npx prisma migrate deploy && node dist/main.js`
5. **Environment variables:** Add `DATABASE_URL` (same Supabase URL) and `JWT_SECRET`. Set `PORT` if Render provides one (e.g. `PORT=10000`).
6. Deploy. Then in WP-FE set `NEXT_PUBLIC_API_URL` to the Render URL (e.g. `https://your-app.onrender.com`). For CORS, you may need to allow that frontend origin in the backend (see below).

**CORS for production:** If your frontend is on another domain (e.g. Vercel), update `src/main.ts` to allow that origin, or set `origin: true` / a list of allowed origins.

---

## 5. Project structure

```text
src/
├── main.ts                 # Bootstrap, ValidationPipe, CORS
├── app.module.ts
├── common/
│   ├── decorators/         # @CurrentUser(), @Roles()
│   └── guards/             # RolesGuard
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                   # JWT, register, login, bcrypt
├── users/                  # me, admin list
├── products/               # CRUD, admin-only CUD
└── orders/                 # create, list mine, admin list/update status
prisma/
├── schema.prisma           # User, Product, Order, OrderItem
├── seed.ts                 # Sample products + admin user
└── migrations/
```

---

## 6. Database schema (summary)

- **User:** id (uuid), name, email, passwordHash, role (user | admin), timestamps
- **Product:** id (uuid), name, description, price, images (string[]), timestamps
- **Order:** id (uuid), userId, total, status (pending | completed | cancelled), timestamps
- **OrderItem:** orderId, productId, quantity, priceAtOrder (join table with price snapshot)

---

## 7. Scripts

| Command                   | Description              |
|---------------------------|--------------------------|
| `npm run start:dev`      | Start API (watch mode)   |
| `npm run build`          | Production build         |
| `npx prisma generate`    | Generate Prisma client   |
| `npx prisma migrate dev` | Run migrations (dev)     |
| `npx prisma studio`      | Open Prisma Studio       |
| `npm run prisma:seed`    | Run seed script          |

---

## 8. Frontend (WP-FE) integration

1. In WP-FE `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000` (or your deployed API URL).
2. After login, send the JWT in the header: `Authorization: Bearer <access_token>`.
3. Use `/products`, `/products/:id`, `/orders`, `/orders/me` as needed.
