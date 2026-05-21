<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white" alt="AWS EC2" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/SendGrid-1A82E2?style=for-the-badge&logo=minutemailer&logoColor=white" alt="SendGrid" />
</p>

<h1 align="center">⚡ Minify API</h1>

<p align="center">
  A production-grade REST API for <strong>URL shortening</strong>, <strong>click analytics</strong>, and <strong>bio page management</strong> — deployed on AWS EC2 with Docker.<br/>
  Built with NestJS, TypeScript, and MongoDB.
</p>

<p align="center">
  <a href="https://minifyapp.vercel.app"><img src="https://img.shields.io/badge/Live_Demo-▶_Try_It-00C853?style=for-the-badge" alt="Live Demo" /></a>
  &nbsp;
  <a href="https://github.com/Mahmoud142/minify-web"><img src="https://img.shields.io/badge/Frontend_Repo-minify--web-6C47FF?style=for-the-badge&logo=github" alt="Frontend Repo" /></a>
</p>

---

## Highlights

<table>
<tr>
<td width="50%">

**🔗 URL Shortener** — Public & authenticated short link creation with custom vanity codes, expiration support, and 302 redirect handling.

**📊 Analytics Engine** — Per-click event tracking with GeoIP resolution (country/city), browser breakdown, referrer capture, and dashboard-level aggregation.

**🌳 Bio Pages** — Linktree-style public profiles with custom usernames, editable bios, and link management.

</td>
<td width="50%">

**🔐 Auth System** — JWT + Passport with bcrypt hashing, CSPRNG reset tokens, SHA-256 token storage, and timing-attack mitigation.

**👤 Role-Based Access** — `USER` and `ADMIN` roles with guard-based enforcement via custom `@Roles()` decorator.

**☁️ Cloud-Native** — Dockerized on AWS EC2, multi-stage builds, environment-driven config, CORS-whitelisted Vercel frontend.

</td>
</tr>
</table>

---

## Engineering Decisions

> This section explains **why** things are built the way they are — not just what they do.

| Decision | Rationale |
| --- | --- |
| **Global exception filter + response interceptor** | Every response — success or error — follows the same `{ status, message, data }` envelope. Frontend never has to guess the shape. |
| **Optional JWT guard on URL shortening** | Anonymous users can shorten links (lower friction), but authenticated users get ownership and custom codes. One endpoint, two experiences. |
| **SHA-256 hashed reset tokens in DB** | Even if the database is compromised, reset tokens can't be reversed. Combined with 10-minute expiry and CSPRNG generation. |
| **Async email dispatch (fire-and-forget)** | `forgotPassword` returns instantly regardless of whether the email is found. Prevents timing attacks that leak user existence. |
| **Reserved short code set** | Words like `admin`, `auth`, `dashboard`, `api` are blocked from being used as short codes — prevents route collisions without complex routing. |
| **GeoIP on redirect, not on creation** | Click analytics capture the *visitor's* location, not the link creator's. This gives meaningful geographic engagement data. |
| **Multi-stage Docker build** | Builder stage compiles TS + prunes devDeps. Runner stage gets only `dist/`, `node_modules/`, and `package.json` — minimal attack surface, ~80% smaller image. |
| **`trust proxy` enabled** | Behind AWS load balancers and reverse proxies, `req.ip` would return the proxy's IP. This ensures GeoIP and rate limiting work on real visitor IPs. |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Vercel (Frontend SPA)                        │
│              github.com/Mahmoud142/minify-web                    │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────┐
│                       AWS EC2 Instance                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              Docker Container (Node 20 Alpine)             │  │
│  │                                                            │  │
│  │   Morgan ─▶ Throttler ─▶ ValidationPipe ─▶ Auth Guards    │  │
│  │                            │                               │  │
│  │         ┌──────────────────▼───────────────────┐           │  │
│  │         │           NestJS Modules              │           │  │
│  │         │                                       │           │  │
│  │         │  Auth · URL · User · Linktree · Mail  │           │  │
│  │         │                                       │           │  │
│  │         └──────────────────┬───────────────────┘           │  │
│  │                            │                               │  │
│  │   ResponseInterceptor ◀───┘───▶ AllExceptionsFilter       │  │
│  └────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │      MongoDB Atlas       │
                │  Users · URLs · Clicks   │
                │  Linktrees               │
                └─────────────────────────┘
```

### Request Lifecycle

```
Request ─▶ Morgan Logger ─▶ ThrottlerGuard ─▶ ValidationPipe ─▶ Auth Guard
                                                                      │
  Response ◀── ResponseInterceptor ◀── Service ◀── Controller ◀───────┘
       │
  (on error)
       └──▶ AllExceptionsFilter ──▶ Standardized error response
```

---

## Tech Stack

| Layer              | Technology                                            |
| ------------------ | ----------------------------------------------------- |
| **Runtime**        | Node.js 20 (Alpine)                                   |
| **Framework**      | NestJS 11                                             |
| **Language**       | TypeScript 5 (ES2023, strict null checks)             |
| **Database**       | MongoDB + Mongoose 9                                  |
| **Auth**           | Passport JWT · bcrypt · crypto (CSPRNG)               |
| **Validation**     | class-validator · class-transformer                   |
| **Email**          | SendGrid                                              |
| **Analytics**      | geoip-lite (IP → country/city)                        |
| **Rate Limiting**  | @nestjs/throttler (60 req/min global, 20/min redirect)|
| **Logging**        | Morgan                                                |
| **Testing**        | Jest · Supertest (unit + e2e)                         |
| **Cloud**          | AWS EC2 (API) · Vercel (Frontend)                     |
| **Containerization** | Docker (multi-stage) · Docker Compose               |
| **Code Quality**   | ESLint 9 · Prettier                                   |

---

## API Reference

### Auth — `POST /auth/*`

| Endpoint                 | Description                           |
| ------------------------ | ------------------------------------- |
| `/auth/signup`           | Register a new account                |
| `/auth/login`            | Authenticate and receive JWT          |
| `/auth/forgot-password`  | Request 6-digit reset code via email  |
| `/auth/verify-reset-code`| Validate the reset code               |
| `/auth/reset-password`   | Set new password with verified code   |

### URLs — `/url/*`

| Method | Endpoint           | Auth     | Description                             |
| ------ | ------------------ | -------- | --------------------------------------- |
| POST   | `/url/shorten`     | Optional | Shorten a URL (auth = custom codes)     |
| GET    | `/url/my-urls`     | ✅       | List your shortened URLs                |
| GET    | `/url/analytics`   | ✅       | Aggregate analytics across all your URLs|
| GET    | `/url/:id/stats`   | ✅       | Detailed stats for a specific URL       |
| DELETE | `/url/:id`         | ✅       | Delete URL + its click events           |
| GET    | `/url/:shortCode`  | ❌       | Redirect to original URL (public)       |

### Users — `/user/*`

| Method | Endpoint        | Auth       | Description                        |
| ------ | --------------- | ---------- | ---------------------------------- |
| GET    | `/user/profile` | ✅         | Get your profile                   |
| PATCH  | `/user/:id`     | ✅         | Update own profile (or admin: any) |
| GET    | `/user`         | ✅ Admin   | List all users                     |
| GET    | `/user/:id`     | ✅ Admin   | Get user by ID                     |
| DELETE | `/user/:id`     | ✅ Admin   | Delete a user                      |

### Bio Pages — `/minf/*`

| Method | Endpoint              | Auth | Description                        |
| ------ | --------------------- | ---- | ---------------------------------- |
| GET    | `/minf`               | ✅   | Get your bio page (auto-created)   |
| GET    | `/minf/:username`     | ❌   | View public bio page               |
| PATCH  | `/minf/username`      | ✅   | Update username, bio, link titles  |
| POST   | `/minf/links`         | ✅   | Add a link                         |
| DELETE | `/minf/links/:linkId` | ✅   | Remove a link                      |

### Response Contract

Every response follows the same envelope — frontend never guesses:

```json
// Success
{
  "status": "success",
  "message": "URL shortened successfully",
  "data": { ... }
}

// Error
{
  "status": "error",
  "statusCode": 404,
  "message": "URL not found or inactive"
}
```

---

## Security

| Layer                      | Implementation                                                     |
| -------------------------- | ------------------------------------------------------------------ |
| **Password storage**       | bcrypt, 10 salt rounds                                             |
| **Reset tokens**           | `crypto.randomInt()` (CSPRNG) → SHA-256 hashed → stored in DB     |
| **Token expiry**           | 10-minute TTL on reset codes                                       |
| **Timing attack defense**  | Async email dispatch — response time doesn't reveal user existence |
| **Enumeration defense**    | Generic errors: `"Code is invalid or has expired"`                 |
| **Input sanitization**     | `whitelist: true` + `forbidNonWhitelisted: true` on all DTOs       |
| **CORS**                   | Environment-driven origin whitelist                                |
| **Proxy awareness**        | `trust proxy` for real IP behind AWS load balancers                |
| **Route collision guard**  | Reserved set blocks `admin`, `auth`, `dashboard`, etc. as short codes |
| **Rate limiting**          | Global 60/min + redirect-specific 20/min via `@nestjs/throttler`   |

---

## Project Structure

```
src/
├── main.ts                         # Bootstrap — CORS, pipes, guards, filters
├── app.module.ts                   # Root module — wires all feature modules
├── app.controller.ts               # Health check
│
├── auth/                           # 🔐 Authentication & Authorization
│   ├── auth.controller.ts          #    signup, login, forgot/verify/reset password
│   ├── auth.service.ts             #    JWT signing, bcrypt, CSPRNG tokens
│   ├── strategies/                 #    Passport JWT strategy
│   ├── guards/                     #    JwtAuthGuard, OptionalJwtAuthGuard, RolesGuard
│   ├── decorators/                 #    @GetUser(), @Roles()
│   ├── enums/                      #    Role.USER, Role.ADMIN
│   ├── dto/                        #    SignupDto, LoginDto, ForgotPasswordDto, etc.
│   └── interfaces/                 #    JwtPayload, AuthResponse types
│
├── url/                            # 🔗 URL Shortening & Analytics
│   ├── url.controller.ts           #    shorten, my-urls, analytics, stats, redirect
│   ├── url.service.ts              #    Short code gen, GeoIP tracking, aggregation
│   ├── dto/                        #    CreateUrlDto
│   └── schemas/                    #    Url schema, ClickEvent schema
│
├── user/                           # 👤 User Management
│   ├── user.controller.ts          #    profile, update, admin CRUD
│   ├── user.service.ts             #    find, create, update, delete
│   ├── dto/                        #    UpdateUserDto
│   ├── schemas/                    #    User schema
│   └── interfaces/                 #    UserResponse types
│
├── linktree/                       # 🌳 Bio Pages
│   ├── linktree.controller.ts      #    bio page + link CRUD
│   ├── linktree.service.ts         #    username management, public view
│   ├── dto/                        #    AddLinkDto, UpdateUsernameDto
│   └── schemas/                    #    Linktree schema
│
├── mail/                           # 📧 Transactional Email
│   ├── mail.service.ts             #    SendGrid: reset + confirmation templates
│   └── mail.module.ts
│
└── common/                         # 🛠️ Shared Infrastructure
    ├── interceptors/
    │   └── response.interceptor.ts #    Wraps all success responses
    └── filters/
        └── all-exceptions.filter.ts #   Catches & standardizes all errors
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- MongoDB (local or Atlas)
- SendGrid API key

### Quick Start

```bash
# Clone
git clone https://github.com/Mahmoud142/minify-api.git
cd minify-api

# Install
npm install

# Configure
cp .env.example .env   # then fill in your values

# Run
npm run start:dev       # http://localhost:3000
```

### Environment Variables

| Variable       | Description                          | Required |
| -------------- | ------------------------------------ | -------- |
| `DB_URI`       | MongoDB connection string            | ✅       |
| `JWT_SECRET`   | Secret for signing JWT tokens        | ✅       |
| `SENDGRID_KEY` | SendGrid API key                     | ✅       |
| `FRONTEND_URL` | Frontend origin (CORS + email links) | ✅       |
| `CORS_ORIGIN`  | Comma-separated allowed origins      | Optional |
| `PORT`         | Server port (default: `3000`)        | Optional |

### Scripts

| Command               | Description                           |
| --------------------- | ------------------------------------- |
| `npm run start:dev`   | Dev server with hot reload            |
| `npm run start:debug` | Dev server with debugger              |
| `npm run build`       | Compile TypeScript → `dist/`          |
| `npm run start:prod`  | Run production build                  |
| `npm run test`        | Unit tests                            |
| `npm run test:e2e`    | End-to-end tests                      |
| `npm run test:cov`    | Tests with coverage                   |
| `npm run lint`        | ESLint with auto-fix                  |

---

## Deployment

### Production — AWS EC2

```
Vercel (Frontend)  ──HTTPS──▶  AWS EC2 (Docker → NestJS API)  ──▶  MongoDB Atlas
```

- Dockerized NestJS on EC2 with `docker compose up --build -d`
- `trust proxy` enabled for real IP resolution behind load balancers
- Environment-driven CORS whitelist for the Vercel frontend
- Frontend source: [**Mahmoud142/minify-web**](https://github.com/Mahmoud142/minify-web)

### Docker

Multi-stage build for minimal production images:

```bash
# With Docker Compose (recommended)
docker compose up --build -d

# Or standalone
docker build -t minify-api .
docker run -p 3000:3000 --env-file .env minify-api
```

**Stage 1 (Builder):** Install all deps → compile TypeScript → prune devDependencies<br/>
**Stage 2 (Runner):** Copy only `dist/`, `node_modules/`, `package.json` into clean Alpine image

---

## Related Repositories

| Repository | Description | Stack |
| --- | --- | --- |
| [**minify-api**](https://github.com/Mahmoud142/minify-api) | Backend REST API (this repo) | NestJS · TypeScript · MongoDB · AWS EC2 |
| [**minify-web**](https://github.com/Mahmoud142/minify-web) | Frontend dashboard | Deployed on Vercel |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional messages: `feat(url): add link expiration`
4. Push and open a Pull Request

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Mahmoud142"><strong>Mahmoud Abdellah</strong></a>
</p>
