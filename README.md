# 🎬 ReelMark

> Your personal video store in your pocket

A full-stack movie and TV tracking app with AI-powered recommendations. Built with modern tech and a nostalgic touch—think retro video store vibes meets Gen Z aesthetics. Now with multi-user support and secure authentication.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## ✨ Features

### 📱 Mobile App (iOS & Android)
- **Multi-User Accounts** 🔐 - Secure login/registration so every user has their own private library
- **Track Your Watches** 🎥 - Log movies and TV shows with personal ratings (1-10) and notes
- **Smart Search** 🔍 - Browse 600K+ titles via TMDB integration with real-time search
- **AI Recommendations** 🤖 - Get personalized suggestions from Claude AI, now saved to your profile
- **Beautiful Stats** 📊 - Dashboard with watch counts, monthly activity, favorite genres, and more
- **Retro Design** 📼 - Dark indie video store theme with custom fonts and smooth animations

### 🔧 Backend API
- **Secure Authentication** - Session-based auth with bcrypt password hashing
- **User Scoping** - All content and watch history is strictly scoped to the authenticated user
- **TMDB Integration** - Automatic content fetching with posters, metadata, and genre data
- **Persisted Recommendations** - AI suggestions are stored in the database for easy retrieval
- **Type Safety** - Full TypeScript coverage with Prisma-generated types
- **Comprehensive Testing** - 125+ tests across unit, integration, and E2E suites

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Session-based with Bcrypt hashing
- **AI**: Anthropic Claude API (Sonnet 4)
- **External Data**: The Movie Database (TMDB) API
- **Testing**: Jest + Supertest

### Mobile
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material Design)
- **Navigation**: React Navigation (Stack + Tabs)
- **Storage**: Expo SecureStore (for auth tokens)
- **Networking**: Axios with auth interceptors

---

## 🚀 API Reference

### Authentication (New)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account (username, email, password) |
| `POST` | `/api/auth/login` | Login and receive session token |
| `POST` | `/api/auth/logout` | Invalidate current session |
| `GET`  | `/api/auth/me` | Get current authenticated user details |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/content` | Get **your** library (content you have watched) |
| `GET` | `/api/content/:id` | Get content by ID |
| `GET` | `/api/content/tmdb/:tmdbId` | Look up content by TMDB ID |
| `POST` | `/api/content/movie` | Save movie from TMDB (auto-fetch metadata) |
| `POST` | `/api/content/tv` | Save TV show from TMDB |

### Watch Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/watch-entries` | Create watch entry for **current user** |
| `GET` | `/api/watch-entries` | Get **current user's** watch history |
| `GET` | `/api/watch-entries/stats` | Get **current user's** statistics |
| `GET` | `/api/watch-entries/:id` | Get specific entry |
| `PATCH` | `/api/watch-entries/:id` | Update rating/notes |
| `DELETE` | `/api/watch-entries/:id` | Delete entry |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/recommendations` | Generate & save AI recommendation |
| `GET` | `/api/recommendations` | Get **your** past recommendations |
| `GET` | `/api/recommendations/status` | Check eligibility status |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/search/movies?q=query` | Search TMDB for movies/shows |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check |

---

## 🗄️ Database Schema

```prisma
model User {
  id           String    @id @default(uuid())
  username     String    @unique
  email        String?   @unique
  passwordHash String    // stored as bcrypt hash
  displayName  String?
  avatarUrl    String?
  createdAt    DateTime  @default(now())

  watchEntries   WatchEntry[]
  sessions       Session[]
  recommendations Recommendation[]
}

model Session {
  id           String   @id @default(uuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Recommendation {
  id           String   @id @default(uuid())
  userId       String
  contentId    String?  // Optional link to Content
  title        String
  reason       String
  tmdbId       Int?
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  content      Content? @relation(fields: [contentId], references: [id])
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
  
  // TV-specific
  numberOfSeasons  Int?
  numberOfEpisodes Int?
  
  createdAt        DateTime @default(now())
  watchEntries     WatchEntry[]
  recommendations  Recommendation[]
}

model WatchEntry {
  id         String   @id @default(uuid())
  userId     String
  contentId  String
  watchedAt  DateTime @default(now())
  rating     Int?     // 1-10 scale
  notes      String?
  season     Int?
  episode    Int?
  
  user       User     @relation(...)
  content    Content  @relation(...)
  
  @@unique([userId, contentId, season, episode])
}
```

## 💻 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- iOS device/simulator (for mobile) OR Android device/emulator
- [TMDB API key](https://www.themoviedb.org/settings/api) (free)
- [Anthropic API key](https://console.anthropic.com/) (pay-as-you-go)

### Backend Setup

1. **Clone and install**
   ```bash
   git clone https://github.com/YOUR_USERNAME/reelmark.git
   cd reelmark/server
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/reelmark
   PORT=3000
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. **Set up database**
   ```bash
   npx prisma migrate dev
   ```

4. **Run the server**
   ```bash
   npm run dev
   ```
   
   Backend runs at `http://localhost:3000` 🚀

5. **Run tests** (optional)
   ```bash
   npm test
   ```

### Mobile Setup

1. **Install dependencies**
   ```bash
   cd ../mobile
   npm install
   ```

2. **Configure API endpoint**
   
   Edit `src/services/api.ts`:
   ```typescript
   // Replace with your computer's local IP (find with `ipconfig` or `ifconfig`)
   const API_BASE_URL = 'http://192.168.X.X:3000/api';
   ```

3. **Start Expo**
   ```bash
   npx expo start
   ```

4. **Run on device**
   - **iOS**: Scan QR code with Camera app → Opens in Expo Go
   - **Android**: Scan QR code with Expo Go app
   - **Simulator**: Press `i` (iOS) or `a` (Android) in terminal

---

## 🎨 Design Philosophy

**Retro Video Store meets Modern UX**

- **Visual Theme**: Dark indie video store aesthetic with warm browns, burnt orange accents, and cream text
- **Typography**: 
  - Bebas Neue (headings) - bold, all-caps video store signage
  - VT323 (labels) - retro monospace terminal font
  - System fonts (body) - readable, accessible
- **Interactions**: 
  - Smooth scale animations on press
  - Haptic feedback for tactile feel
  - Toast notifications instead of alerts
  - Bouncy star ratings
- **Terminology**: Subtle nods to video stores ("Your Collection", "Browse Store", "Ask the Clerk")

---

## 🏗️ Architecture Decisions

### Why PostgreSQL?
Relational data (users ↔ entries ↔ content) with complex queries for stats and recommendations. SQL's joins and aggregations are perfect for analytics.

### Why Prisma?
- Type-safe database access with auto-generated TypeScript types
- Migration system for schema evolution
- Excellent DX with Prisma Studio for debugging

### Why React Native + Expo?
- Write once, deploy to iOS and Android
- Fast iteration with hot reload
- Easy testing on real devices via Expo Go
- Large ecosystem of libraries

### Why Claude AI?
- Superior reasoning for nuanced recommendations
- Understands context beyond simple genre matching
- Can explain *why* it recommends something
- Cost-effective for low-traffic personal app (~$0.01-0.02 per recommendation)

### Layered Architecture
```
Routes (HTTP) → Services (Business Logic) → Database (Prisma)
```
Clean separation enables easy testing, swapping implementations, and scaling.

---

## 🗺️ Roadmap

### ✅ Completed
- [x] Backend API with full CRUD operations
- [x] PostgreSQL database with Prisma ORM
- [x] TMDB integration (search, metadata, posters)
- [x] AI-powered recommendations with Claude
- [x] Mobile app UI (6 screens)
- [x] Stats dashboard with monthly activity tracking
- [x] Search with quick-add functionality
- [x] Detail views with ratings and notes
- [x] Animations and haptic feedback
- [x] Light theme with retro design system
- [x] Multi-user support with authentication

### 🚧 In Progress
- [ ] Update Backend Test
- [ ] Add Frontend Test
- [ ] Edit functionality (update rating/notes)
- [ ] Entertainment news integration
- [ ] Loading skeletons for better perceived performance

### 📅 Planned
- [ ] Social features (friends, shared watchlists)
- [ ] Advanced stats (genre breakdowns, watch streaks, yearly recaps)
- [ ] Export data (CSV, JSON)
- [ ] Backend deployment (Railway/Render)
- [ ] App store release (iOS + Android)

---

## 🤔 Challenges & Solutions

### Challenge: Recommendation Quality
**Problem**: Simple genre-based recommendations felt generic  
**Solution**: Integrated Claude AI to analyze watch history holistically, considering ratings, notes, and viewing patterns for nuanced suggestions

### Challenge: Mobile Keyboard Covering Inputs
**Problem**: iOS keyboard hid bottom sheet inputs when typing notes  
**Solution**: Implemented `KeyboardAvoidingView` with dynamic safe area insets for proper spacing across all devices

### Challenge: Performance on Large Watch Histories
**Problem**: Loading 100+ entries caused lag  
**Solution**: Implemented pagination on backend, added indexes on `userId` and `watchedAt`, cached frequently accessed data

### Challenge: TMDB API Rate Limits
**Problem**: Repeated searches could hit rate limits  
**Solution**: Cached content in PostgreSQL after first fetch, debounced search input (300ms), added request throttling

---

## 📸 Screenshots

*Coming soon - app currently in development*

---

## 🙏 Acknowledgments

- **TMDB** for the comprehensive movie/TV database and free API
- **Anthropic** for Claude AI and excellent developer experience
- **Expo** for making React Native development a breeze
- **Prisma** for the best database ORM in TypeScript

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👨‍💻 Author

**[Tong Liu]**  
📧 trevor.liu28@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/trevortongliu/)  
🐙 [GitHub](https://github.com/liuton23)  

*Built as a full-stack portfolio project showcasing modern web/mobile development practices*

---

<div align="center">

**⭐ Star this repo if you find it interesting!**

Made with ☕ and 🎬 by Tong

</div>
