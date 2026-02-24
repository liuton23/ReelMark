# 🎬 ReelMark

> Your personal video store in your pocket

A full-stack movie and TV tracking app with AI-powered recommendations. Built with a nostalgic retro video store aesthetic — warm cream, burnt orange, flickering neon, and now a fully interactive membership card.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)
[![Azure](https://img.shields.io/badge/Azure-0078D4?style=flat&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)

---

## ✨ Features

### 📱 Mobile App (iOS & Android)

- **Multi-User Accounts** 🔐 — Secure login/registration with session-based auth
- **Member Enrollment Flow** 🎴 — Sign-up feels like labeling your personal VHS tape, then receiving your membership card with animated field reveals
- **Interactive Membership Card** 📇 — Tiltable card on profile using DeviceMotion + pan gesture (gravity-aware, springs back on release)
- **Track Your Watches** 🎥 — Log movies and TV shows with personal ratings (1–10) and notes
- **Edit Ratings & Notes** ✏️ — Native header buttons (Edit | Delete) styled to match iOS back button
- **Smart Search** 🔍 — Browse 600K+ movies and TV shows via TMDB multi-search
- **AI Recommendations** 🤖 — Personalized suggestions from Claude AI, saved to your profile
- **Beautiful Stats** 📊 — Dashboard with watch counts, monthly activity, favorite genres
- **Neon UI** 💡 — Flickering neon text headers with realistic vintage signage effect
- **Retro Design** 📼 — Poster-first library grid, warm color palette, custom retro fonts
- **Haptic Feedback** — Tactile response throughout

### 🔧 Backend API

- **Secure Authentication** — Session-based auth with bcrypt password hashing
- **User Scoping** — All content and watch history strictly scoped to authenticated user
- **TMDB Integration** — Automatic content fetching with posters, metadata, genres
- **Persisted Recommendations** — AI suggestions stored in database for retrieval
- **Type Safety** — Full TypeScript with Prisma-generated types
- **Comprehensive Testing** — 125+ tests across unit, integration, and E2E suites
- **Dockerized** — Backend and database fully containerized with Docker Compose
- **Redis Caching** — TMDB search results cached for 5 minutes, content details for 24 hours

---

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Session-based with bcrypt hashing
- **AI**: Anthropic Claude API (claude-sonnet-4-5)
- **External Data**: TMDB API
- **Testing**: Jest + Supertest
- **Containerization**: Docker + Docker Compose
- **Caching**: Redis (ioredis) — TMDB search and content detail caching
- **Cloud**: Azure Container Registry + Azure Container Apps
- **Production DB**: Supabase (PostgreSQL)

### Mobile

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation (Stack + Tabs)
- **Icons**: Phosphor React Native
- **Fonts**: Tilt Neon, Bebas Neue, Righteous, SpaceMono, PatrickHand
- **Animations**: Reanimated 3, React Native Animated, DeviceMotion, Gesture Handler
- **Storage**: Expo SecureStore
- **Networking**: Axios with auth interceptors

---

## 📂 Project Structure

```
ReelMark/
├── docker-compose.yml             # Orchestrates api + db containers
├── server/                        # Backend API
│   ├── Dockerfile                 # Builds the API image
│   ├── .dockerignore
│   ├── .env                       # Secrets (gitignored)
│   ├── src/
│   │   ├── app.ts
│   │   ├── index.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── user.service.ts
│   │   │   ├── content.service.ts
│   │   │   ├── watchEntry.service.ts
│   │   │   ├── tmdb.service.ts
│   │   │   └── recommendation.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   ├── watchEntry.routes.ts
│   │   │   └── recommendation.routes.ts
│   │   └── __tests__/
│   │       ├── unit/
│   │       ├── integration/
│   │       └── e2e/
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
│
└── mobile/                        # React Native app
    ├── .env                       # API URL config (gitignored)
    ├── App.tsx
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── components/
    │   │   ├── MembershipCard.tsx    # ← shared card used in Profile + Login
    │   │   ├── NeonText.tsx
    │   │   ├── WatchCard.tsx
    │   │   ├── SearchResultCard.tsx
    │   │   ├── QuickAddSheet.tsx
    │   │   ├── RecommendationCard.tsx
    │   │   ├── StatCard.tsx
    │   │   └── StarButton.tsx
    │   ├── screens/
    │   │   ├── LoginScreen.tsx       # Tape enrollment + card issue flow
    │   │   ├── HomeScreen.tsx
    │   │   ├── SearchScreen.tsx
    │   │   ├── LibraryScreen.tsx
    │   │   ├── RecommendScreen.tsx
    │   │   ├── ProfileScreen.tsx     # Interactive membership card
    │   │   └── DetailScreen.tsx
    │   ├── navigation/
    │   │   ├── AppNavigator.tsx
    │   │   └── types.ts
    │   ├── services/
    │   │   └── api.ts
    │   ├── theme/
    │   │   └── index.ts
    │   └── utils/
    │       └── haptics.ts
    └── package.json
```

---

## 🐳 Running with Docker (Recommended)

Docker runs the backend API and PostgreSQL database together — no need to install PostgreSQL locally.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Expo Go](https://expo.dev/go) installed on your phone
- [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- [Anthropic API key](https://console.anthropic.com/) (pay-as-you-go)

### 1. Configure environment

Create `server/.env`:

```env
DATABASE_URL=postgresql://postgres:yourPassword@db:5432/reelmark
PORT=3000
POSTGRES_PASSWORD=yourPassword
TMDB_API_KEY=your_tmdb_key
TMDB_BASE_URL=https://api.themoviedb.org/3
ANTHROPIC_API_KEY=your_anthropic_key
```

> ⚠️ Note: The hostname in `DATABASE_URL` must be `db` (not `localhost`) — this is the Docker service name.

### 2. Start the containers

```bash
docker compose up --build
```

This starts the API (port 3000), PostgreSQL (port 5432), and Redis (port 6379).

### 3. Run database migrations

In a new terminal:

```bash
docker compose exec api npx prisma migrate deploy
```

### 4. Mobile

Find your machine's local IP (Windows):

```powershell
ipconfig
# Look for IPv4 Address under your WiFi adapter
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000/api
```

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with your phone's Camera app (iOS) or Expo Go (Android). Your phone and laptop must be on the **same WiFi**.

### Useful Docker commands

```bash
docker compose down           # Stop containers
docker compose down -v        # Stop and wipe the database
docker compose logs api       # View API logs
docker compose logs db        # View database logs
docker compose restart api    # Restart just the API
```

---

## ☁️ Cloud Deployment (Azure)

The backend is deployed to **Azure Container Apps** with **Supabase** as the managed production database.

### Infrastructure

- **Container Registry**: Azure Container Registry (ACR) — stores Docker images
- **Hosting**: Azure Container Apps — runs the containerized API
- **Database**: Supabase — managed PostgreSQL

> ⚠️ **Supabase + Prisma 6**: Use the **connection pooling URL** (port `6543`) for `DATABASE_URL`. Get it from Supabase dashboard → **Connect** → **Prisma**.
>
> ```env
> DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
> ```

### Deploying a new version

**1. Build and push a new image to ACR:**

```bash
az acr login --name reelmarkregistry
docker build -t reelmarkregistry.azurecr.io/reelmark-api:latest ./server
docker push reelmarkregistry.azurecr.io/reelmark-api:latest
```

**2. Restart the Container App to pull the latest image:**

```bash
az containerapp update --name reelmark-api --resource-group reelmark-rg --image reelmarkregistry.azurecr.io/reelmark-api:latest
```

**3. Run migrations against Supabase (if schema changed):**

```powershell
$env:DATABASE_URL="your-supabase-connection-string"; npx prisma migrate deploy
```

---

## 🚀 Running Locally (without Docker)

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- [Expo Go](https://expo.dev/go) installed on your phone
- [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- [Anthropic API key](https://console.anthropic.com/) (pay-as-you-go)

### 1. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/reelmark
PORT=3000
TMDB_API_KEY=your_tmdb_key
TMDB_BASE_URL=https://api.themoviedb.org/3
ANTHROPIC_API_KEY=your_anthropic_key
```

```bash
npx prisma migrate dev
npm run dev
# Backend running at http://localhost:3000
```

### 2. Find your laptop's local IP

```bash
# Mac
ipconfig getifaddr en0
# Windows
ipconfig
# e.g. 192.168.1.42
```

Your phone and laptop must be on the **same WiFi**.

### 3. Mobile

```bash
cd mobile
npm install
```

Create `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000/api
```

```bash
npx expo start
```

Scan the QR code with your phone's Camera app (iOS) or Expo Go (Android). That's it.

---

## 🔑 API Keys & Security

All secret keys live **only on the backend** — they are never shipped in the mobile app bundle.

```
Mobile App  →  Your Express Server  →  TMDB API
                                    →  Anthropic API
```

The mobile app only knows your backend URL. Your backend handles all third-party calls using the keys stored in `.env` (which is gitignored).

---

## 🚀 API Reference

### Authentication

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| `POST` | `/api/auth/register` | Create account               |
| `POST` | `/api/auth/login`    | Login, receive session token |
| `POST` | `/api/auth/logout`   | Invalidate session           |
| `GET`  | `/api/auth/me`       | Get current user             |

### Content

| Method   | Endpoint           | Description         |
| -------- | ------------------ | ------------------- |
| `GET`    | `/api/content`     | Your library        |
| `GET`    | `/api/content/:id` | Content by ID       |
| `POST`   | `/api/content`     | Add to library      |
| `DELETE` | `/api/content/:id` | Remove from library |

### Watch Entries

| Method   | Endpoint                 | Description         |
| -------- | ------------------------ | ------------------- |
| `GET`    | `/api/watch-entries`     | All watch entries   |
| `POST`   | `/api/watch-entries`     | Log a watch         |
| `PUT`    | `/api/watch-entries/:id` | Update rating/notes |
| `DELETE` | `/api/watch-entries/:id` | Delete entry        |

### Recommendations

| Method | Endpoint                       | Description                |
| ------ | ------------------------------ | -------------------------- |
| `POST` | `/api/recommendations`         | Generate AI recommendation |
| `GET`  | `/api/recommendations/history` | Past recommendations       |
| `GET`  | `/api/recommendations/status`  | Check eligibility          |

### Search & Health

| Method | Endpoint                     | Description      |
| ------ | ---------------------------- | ---------------- |
| `GET`  | `/api/search/movies?q=query` | Search TMDB      |
| `GET`  | `/health`                    | API health check |

---

## 🗄️ Database Schema

```prisma
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  email        String?  @unique
  passwordHash String
  displayName  String?
  createdAt    DateTime @default(now())

  watchEntries    WatchEntry[]
  sessions        Session[]
  recommendations Recommendation[]
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Content {
  id               String      @id @default(uuid())
  tmdbId           Int         @unique
  type             ContentType // MOVIE | TV_SHOW
  title            String
  releaseYear      Int?
  posterPath       String?
  genres           String[]
  overview         String?
  numberOfSeasons  Int?
  numberOfEpisodes Int?
  createdAt        DateTime    @default(now())

  watchEntries    WatchEntry[]
  recommendations Recommendation[]
}

model WatchEntry {
  id        String   @id @default(uuid())
  userId    String
  contentId String
  watchedAt DateTime @default(now())
  rating    Int?     // 1–10
  notes     String?

  user    User    @relation(fields: [userId], references: [id])
  content Content @relation(fields: [contentId], references: [id])

  @@unique([userId, contentId])
}

model Recommendation {
  id        String   @id @default(uuid())
  userId    String
  contentId String?
  title     String
  reason    String
  tmdbId    Int?
  createdAt DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content Content? @relation(fields: [contentId], references: [id])
}
```

---

## 🎨 Design System

**Retro video store meets modern mobile UX**

| Token              | Value     | Usage                                       |
| ------------------ | --------- | ------------------------------------------- |
| `primary`          | `#D35400` | Burnt orange — buttons, accents, card bands |
| `background`       | `#FFF6EC` | Warm cream — main background                |
| `surface`          | `#FFF0E0` | Peach cream — cards                         |
| `surfaceVariant`   | `#F5E1CC` | Warm beige — inputs, variants               |
| `onSurface`        | `#2C1810` | Dark brown — primary text                   |
| `onSurfaceVariant` | `#6B4423` | Medium brown — labels, secondary text       |

**Typography**

- `BebasNeue` — all-caps display headers, card store name
- `Righteous` — section headings, button labels
- `SpaceMono` — monospace labels, metadata, typewriter fields
- `PatrickHand` — handwritten fields on membership card and tape
- `Tilt Neon` — animated neon glow headers

**Key Interactions**

- Flickering neon text (realistic random flicker timing)
- Membership card tilts with phone gravity via DeviceMotion
- Pan gesture adds tilt on top of motion, springs back on release
- Sign-up: type username/password on cassette tape label → card animates in field-by-field
- Poster-first 2-column grid in library (video store shelf feel)
- Bouncy star rating animation with haptics
- Toast notifications, no intrusive alerts

---

## 📸 Screenshots

<div align="center">

|                              Register                              |                              Login                              |                              Home                              |                              Profile                              |                              Collection                              |
| :----------------------------------------------------------------: | :-------------------------------------------------------------: | :------------------------------------------------------------: | :---------------------------------------------------------------: | :------------------------------------------------------------------: |
| <img src="mobile/assets/screenshots/01-register.PNG" width="140"/> | <img src="mobile/assets/screenshots/02-login.PNG" width="140"/> | <img src="mobile/assets/screenshots/03-home.PNG" width="140"/> | <img src="mobile/assets/screenshots/04-profile.PNG" width="140"/> | <img src="mobile/assets/screenshots/05-collection.PNG" width="140"/> |

|                              Detail                              |                              Browse                              |                              Add Entry                              |                        Recommendations                         |                                Result                                 |
| :--------------------------------------------------------------: | :--------------------------------------------------------------: | :-----------------------------------------------------------------: | :------------------------------------------------------------: | :-------------------------------------------------------------------: |
| <img src="mobile/assets/screenshots/06-detail.PNG" width="140"/> | <img src="mobile/assets/screenshots/07-browse.PNG" width="140"/> | <img src="mobile/assets/screenshots/08-add-entry.PNG" width="140"/> | <img src="mobile/assets/screenshots/09-recc.PNG" width="140"/> | <img src="mobile/assets/screenshots/10-recc-result.PNG" width="140"/> |

</div>

---

## 🏗️ Architecture

```
Routes (HTTP) → Middleware (Auth) → Services (Business Logic) → Prisma → PostgreSQL
                                                              → Redis (cache)
```

```
Mobile → Axios (with token interceptor) → Express API → TMDB / Anthropic
```

```
Docker (local): [api container] → [db container] (internal Docker network)
```

```
Production: Mobile → Azure Container Apps (API) → Supabase (PostgreSQL)
                                                 → TMDB / Anthropic
```

The mobile app never holds API keys. All third-party calls go through the Express backend.

---

## 🗺️ Roadmap

### ✅ Completed

- [x] Full-stack backend (Express + PostgreSQL + Prisma)
- [x] TMDB integration — search, metadata, posters
- [x] Claude AI recommendations
- [x] 7 mobile screens
- [x] Multi-user auth with session management
- [x] Poster-first library grid
- [x] Stats dashboard
- [x] Neon text with flicker animation
- [x] Phosphor icon library migration
- [x] Interactive membership card (DeviceMotion + gesture tilt)
- [x] Cassette tape sign-up flow with animated card issue
- [x] Native-style header Edit | Delete buttons on Detail screen
- [x] Shared `MembershipCard` component across Profile + Login
- [x] Docker + Docker Compose setup for backend and database
- [x] Azure Container Registry — Docker image hosted in the cloud
- [x] Azure Container Apps — API deployed and publicly accessible
- [x] Supabase — managed production PostgreSQL database
- [x] Redis caching — TMDB search results (5 min TTL) and content details (24hr TTL)

### 🚧 In Progress

- [ ] Frontend tests
- [ ] Entertainment news integration
- [ ] Loading skeletons

### 📅 Planned

- [ ] Social features (friends, shared watchlists)
- [ ] Advanced stats (genre breakdowns, watch streaks, yearly recaps)
- [ ] Export data (CSV, JSON)

---

## 🤔 Challenges & Solutions

**Recommendation Quality** — Simple genre matching felt generic. Integrated Claude AI to analyze watch history holistically, considering ratings, notes, and patterns.

**Membership Card Tilt** — `PanResponder` + `Animated` ran on the JS thread and lagged. Switched to `react-native-reanimated` + `react-native-gesture-handler` for UI-thread animations. Added `DeviceMotion` as a base layer with gesture on top, additively combined.

**Mobile Keyboard** — iOS keyboard hid bottom sheet inputs. Fixed with `KeyboardAvoidingView` + safe area insets.

**TMDB Rate Limits** — Cached content in PostgreSQL after first fetch, debounced search (300ms), added request throttling. Further improved with Redis caching — search results cached for 5 minutes and content details for 24 hours, eliminating redundant TMDB API calls.

**Docker Networking** — Prisma couldn't reach the database using `localhost` inside containers. Resolved by using the Docker Compose service name `db` as the hostname in `DATABASE_URL`.

**Prisma on Alpine Linux** — Prisma 5 requires OpenSSL which Alpine doesn't include by default. Resolved by switching to `node:20-slim` (Debian-based) and installing OpenSSL via `apt-get`.

**Supabase + Prisma 6 Connection** — Prisma 6 requires the connection pooling URL (port `6543` with `?pgbouncer=true`) when connecting to Supabase. Using the standard port `5432` caused connection failures in production.

---

## 🙏 Acknowledgments

- **TMDB** — comprehensive movie/TV database and free API
- **Anthropic** — Claude AI and excellent developer experience
- **Expo** — making React Native development fast and pleasant
- **Prisma** — best TypeScript ORM
- **Docker** — consistent, portable containerized development
- **Azure** — Container Registry and Container Apps for cloud deployment
- **Supabase** — managed PostgreSQL for production database
- **Redis** — fast in-memory caching via ioredis

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details

---

## 👨‍💻 Author

**Tong Liu**  
📧 trevor.liu28@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/trevortongliu/)  
🐙 [GitHub](https://github.com/liuton23)

_Full-stack portfolio project — modern web/mobile development with a retro soul_

---

<div align="center">

**⭐ Star this repo if you find it interesting!**

Made with ☕ and 📼 by Tong

</div>
