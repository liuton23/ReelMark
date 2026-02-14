# ReelMark

A personal movie and TV show tracking app with AI-powered recommendations. Built with Node.js, TypeScript, Express, PostgreSQL, and React Native.

## Features

- **Track What You Watch** - Log movies and TV shows with personal ratings (1-10) and notes
- **AI Recommendations** - Get intelligent suggestions based on your watch history using Claude AI
- **TMDB Integration** - Search and pull movie/TV data from The Movie Database API
- **TV Show Support** - Track individual seasons and episodes
- **RESTful API** - Clean, well-structured backend with full CRUD operations

## Tech Stack

### Backend
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Anthropic Claude API
- **External Data**: TMDB API
- **Testing**: Jest + Supertest (125 tests)

### Mobile (In Progress)
- **Framework**: React Native + Expo
- **Language**: TypeScript

## Project Structure

```
ReelMark/
├── server/
│   ├── src/
│   │   ├── app.ts                    # Express app setup
│   │   ├── index.ts                  # Server entry point
│   │   ├── config/
│   │   │   └── database.ts           # Prisma client
│   │   ├── services/
│   │   │   ├── user.service.ts       # User operations
│   │   │   ├── content.service.ts    # Content CRUD + TMDB sync
│   │   │   ├── watchEntry.service.ts # Watch history operations
│   │   │   ├── tmdb.service.ts       # TMDB API integration
│   │   │   └── recommendation.service.ts  # AI recommendations
│   │   ├── routes/
│   │   │   ├── user.routes.ts
│   │   │   ├── content.routes.ts
│   │   │   ├── watchEntry.routes.ts
│   │   │   └── recommendation.routes.ts
│   │   └── __tests__/
│   │       ├── unit/                 # Service unit tests
│   │       ├── integration/          # Route integration tests
│   │       └── e2e/                  # End-to-end API tests
│   ├── prisma/
│   │   └── schema.prisma
│   ├── jest.config.ts
│   ├── tsconfig.json
│   └── package.json
│
└── mobile/                           # React Native + Expo (in progress)
```

## API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/default` | Get or create default user |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |

### Content
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | Get all content in library |
| GET | `/api/content/:id` | Get content by ID |
| GET | `/api/content/tmdb/:tmdbId` | Look up content by TMDB ID |
| POST | `/api/content/movie` | Save movie from TMDB |
| POST | `/api/content/tv` | Save TV show from TMDB |

### Watch Entries
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/watch-entries` | Create watch entry (auto-fetches from TMDB) |
| GET | `/api/watch-entries/user/:userId` | Get user's watch history |
| GET | `/api/watch-entries/:id` | Get specific entry |
| PATCH | `/api/watch-entries/:id` | Update rating/notes |
| DELETE | `/api/watch-entries/:id` | Delete entry |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recommendations` | Get AI recommendation (requires 5+ watches) |
| GET | `/api/recommendations/status/:userId` | Check recommendation eligibility |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search/movies?q=query` | Search TMDB for movies |
| GET | `/health` | API health check |

## Database Schema

```
User
├── id (uuid)
├── username (unique)
├── email (unique, optional)
└── createdAt

Content
├── id (uuid)
├── tmdbId (unique)
├── type (MOVIE | TV_SHOW)
├── title, releaseYear, posterPath
├── genres (array), overview, runtime
├── TV fields: numberOfSeasons, numberOfEpisodes, episodeRuntime
└── createdAt

WatchEntry
├── id (uuid)
├── userId → User, contentId → Content
├── watchedAt, rating (1-10), notes
├── season, episode (for TV)
└── createdAt, updatedAt
```

## Testing

The backend includes a full test suite with **125 tests** across three tiers:

```bash
npm test                  # Run all tests
npm run test:unit         # Unit tests (mocked Prisma, axios, Anthropic)
npm run test:integration  # Route tests (supertest + mocked services)
npm run test:e2e          # E2E tests (requires test database)
npm run test:coverage     # Run with coverage report
```

- **Unit tests**: All 5 services tested with mocked dependencies
- **Integration tests**: All 4 route files tested via supertest
- **E2E tests**: Full user journey against a real test database

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- [TMDB API key](https://www.themoviedb.org/settings/api)
- [Anthropic API key](https://console.anthropic.com/)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/reelmark.git
   cd reelmark
   ```

2. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then fill in your `.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/reelmark
   PORT=3000
   TMDB_API_KEY=your_tmdb_api_key
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:3000`

## Design Decisions

- **Single user first, multi-user later** - User table in the DB from the start for easy expansion
- **AI recommendations require 5+ entries** - Ensures enough data for quality suggestions
- **One recommendation at a time** - More intentional, less overwhelming
- **TMDB as source of truth** - Content is fetched and cached locally on first use
- **PostgreSQL + Prisma** - Type-safe database access with migration support
- **Layered architecture** - Routes → Services → Database for clean separation of concerns

## Roadmap

- [x] Backend API (CRUD, search, AI recommendations)
- [x] Database schema and migrations
- [x] Test suite (unit, integration, E2E)
- [ ] Mobile app UI (React Native + Expo)
- [ ] Statistics dashboard
- [ ] Multi-user support and authentication
- [ ] App store deployment
