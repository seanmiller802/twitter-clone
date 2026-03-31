# Tweeter — Full-Stack Twitter/X Clone

A full-stack social media application built as a monorepo with a **NestJS GraphQL API** and a **React frontend** styled after X.com. Users can register, post tweets, reply to tweets (threaded comments), and like/unlike posts — all in real time via GraphQL subscriptions.

## Quick Start

### Prerequisites

- **Node.js** 18+

### Setup

```bash
# Clone the repo
git clone https://github.com/seanmiller802/twitter-clone.git
cd twitter-clone

# Install dependencies for both backend and frontend
cd backend && npm install
cd ../frontend && npm install
cd ..
```

The backend `.env` is pre-configured with a hosted Neon PostgreSQL connection string and JWT secret. In a production environment, credentials would never be committed to source control.

### Running

```bash
# Terminal 1 — start the API (runs on :3000)
cd backend && npm run start:dev

# Terminal 2 — start the frontend (runs on :5173)
cd frontend && npm run dev

# (Optional) Seed the database with 1000 sample tweets
cd backend && npm run seed
```

Open **http://localhost:5173** to use the app.
The GraphQL Playground is available at **http://localhost:3000/graphql**.

## Architecture

### Overview

The app follows a clean separation between a GraphQL API backend and a React SPA frontend, connected via HTTP for queries/mutations and WebSocket for real-time subscriptions.

```
┌─────────────────────────────────┐
│         React Frontend          │
│  Apollo Client + Tailwind CSS   │
│  :5173 (dev) / static (prod)   │
└──────────┬──────────┬───────────┘
           │ HTTP     │ WebSocket
           │ /graphql │ /graphql
┌──────────▼──────────▼───────────┐
│        NestJS Backend           │
│  Apollo Server (code-first)     │
│  :3000                          │
├─────────────────────────────────┤
│  Auth Module    │ Tweets Module │
│  Users Module   │ Likes Module  │
└──────────┬──────────────────────┘
           │
┌──────────▼──────────────────────┐
│     PostgreSQL (Neon)           │
│  users, tweets, likes tables    │
└─────────────────────────────────┘
```

### Backend (NestJS)

The backend is organized into four **NestJS modules**, each encapsulating a domain:

- **AuthModule** — JWT-based registration and login. Issues tokens via `register` and `login` mutations. Passwords are hashed with bcrypt (10 salt rounds). The `GqlAuthGuard` and `@CurrentUser()` decorator protect and extract user identity on authenticated resolvers.

- **UsersModule** — User entity and lookup methods. Exposes a `me` query (authenticated) and a public `user(username)` query.

- **TweetsModule** — The core module. Handles creating posts and replies, fetching the feed, and real-time subscriptions. The `createTweet` mutation publishes a `tweetCreated` event via PubSub for real-time delivery.

- **LikesModule** — Toggle-based like system. A single `toggleLike` mutation adds or removes a like. The `isLiked` query checks if the current user has liked a specific tweet.

Each module follows the NestJS pattern:

- **Entity** — TypeORM entity with `@ObjectType()` decorators, serving as both the database schema and the GraphQL type.
- **Service** — Business logic and database queries. Framework-agnostic — no knowledge of GraphQL or HTTP.
- **Resolver** — GraphQL entry points (`@Query`, `@Mutation`, `@Subscription`). Thin layer that delegates to services.
- **Module** — Wires providers together and declares imports/exports.

### Data Model

The key design decision: **posts and comments share the same `tweets` table** using a self-referential foreign key.

```
┌──────────────────────────────────────────┐
│ tweets                                   │
├──────────────────────────────────────────┤
│ id          UUID (PK)                    │
│ content     TEXT                          │
│ authorId    UUID (FK → users.id)         │
│ parentId    UUID (FK → tweets.id, NULL)  │
│ createdAt   TIMESTAMP                    │
│ updatedAt   TIMESTAMP                    │
└──────────────────────────────────────────┘

parentId = NULL  →  top-level post
parentId = <id>  →  reply/comment on that tweet
```

The `likes` table enforces a unique constraint on `(userId, tweetId)` to prevent double-likes at the database level.

Two fields — `likesCount` and `repliesCount` — are virtual. They have `@Field()` decorators but no `@Column()`. They're computed at query time by `@ResolveField()` methods in the resolver.

### Frontend (React)

A single-page app built with:

- **React 18** with TypeScript
- **Apollo Client** for GraphQL queries, mutations, and WebSocket subscriptions
- **React Router** for client-side routing
- **Tailwind CSS** with a custom color system matching X.com's dark theme

The Apollo client uses a **split link**: HTTP for queries/mutations (with JWT in the `Authorization` header) and WebSocket (`graphql-ws`) for subscriptions.

## Project Structure

```
twitter-clone/
├── package.json                    # Root scripts (install:all, backend, frontend, seed)
├── README.md
│
├── backend/
│   ├── package.json
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── .env                        # Pre-configured Neon DB + JWT secret
│   └── src/
│       ├── main.ts                 # App bootstrap, ValidationPipe, CORS
│       ├── app.module.ts           # Root module — DB, GraphQL, feature modules
│       │
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts     # register(), login(), JWT generation
│       │   ├── auth.resolver.ts    # register/login mutations
│       │   ├── dto/auth.dto.ts     # RegisterInput, LoginInput, AuthPayload
│       │   └── guards/
│       │       ├── jwt.strategy.ts # Passport JWT validation
│       │       └── gql-auth.guard.ts
│       │
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.service.ts    # findById, findByEmail, findByUsername
│       │   ├── users.resolver.ts   # me, user queries
│       │   └── entities/user.entity.ts
│       │
│       ├── tweets/
│       │   ├── tweets.module.ts
│       │   ├── tweets.service.ts   # create, getFeed, findById, getReplies, delete
│       │   ├── tweets.resolver.ts  # feed, tweet, createTweet, tweetCreated subscription
│       │   ├── dto/tweet.dto.ts    # CreateTweetInput, PaginatedTweets
│       │   └── entities/tweet.entity.ts  # Self-referential parentId
│       │
│       ├── likes/
│       │   ├── likes.module.ts
│       │   ├── likes.service.ts    # toggleLike, isLikedByUser
│       │   ├── likes.resolver.ts   # toggleLike mutation, isLiked query
│       │   └── entities/like.entity.ts   # Unique(userId, tweetId)
│       │
│       ├── common/
│       │   ├── pubsub.ts           # Shared PubSub instance for subscriptions
│       │   └── decorators/
│       │       └── current-user.decorator.ts
│       │
│       └── database/
│           └── seed.ts             # Generates 1000 tweets, replies, likes
│
└── frontend/
    ├── package.json
    ├── vite.config.ts              # Dev server + proxy (HTTP & WebSocket)
    ├── tailwind.config.js          # X.com color system
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── main.tsx                # React root + ApolloProvider + AuthProvider
        ├── App.tsx                 # Layout, routing, header
        ├── index.css               # Tailwind base + global styles
        │
        ├── graphql/
        │   ├── client.ts           # Apollo Client with HTTP + WS split link
        │   └── operations.ts       # All GQL queries, mutations, subscriptions
        │
        ├── context/
        │   └── AuthContext.tsx      # JWT + user state in React context
        │
        ├── components/
        │   ├── TweetCard.tsx        # Post display with like toggle + isLiked check
        │   └── ComposeTweet.tsx     # Tweet/reply composer with character counter
        │
        └── pages/
            ├── FeedPage.tsx         # Infinite scroll feed + real-time subscription
            ├── TweetPage.tsx        # Single tweet + threaded replies
            └── AuthPage.tsx         # Login and register forms
```

## Features

### Core

- **User authentication** — Register and login with email/password. JWT tokens stored in localStorage and sent as Bearer tokens on all authenticated requests.
- **Create posts** — Authenticated users can compose tweets (max 280 characters) with a character count ring that changes color as you approach the limit.
- **Threaded replies** — Click into any tweet to view and post replies. Replies are stored in the same `tweets` table with a `parentId` foreign key. Deleting a post cascades to its replies.
- **Like/unlike toggle** — Single mutation toggles likes on and off. Unique database constraint prevents double-likes. Heart icon fills pink when liked.

### Enhancements

- **Infinite scroll pagination** — The feed loads 10 tweets at a time. An `IntersectionObserver` on a sentinel element at the bottom triggers `fetchMore` as you scroll, appending results to the Apollo cache without resetting scroll position.

- **Real-time updates via GraphQL subscriptions** — New tweets are broadcast over WebSocket using `graphql-ws`. The frontend subscribes to `tweetCreated` and prepends new posts to the feed cache. Open two browser tabs to see it in action.

- **Optimistic cache updates** — Posting a new tweet updates the Apollo cache directly (via `cache.modify`) instead of refetching the entire feed. Your scroll position is preserved and the new tweet appears instantly at the top.

- **Persisted like state** — Each `TweetCard` queries `isLiked` on mount to check if the current user has liked the tweet, so hearts display correctly across page loads and navigation.

- **Generated avatars** — User avatars are generated via [DiceBear](https://dicebear.com) using the "Notionists" style. Each username produces a unique, consistent illustrated avatar with no setup required.

- **X.com-style URL structure** — Tweet detail pages use the pattern `/:username/status/:id`, matching X.com's URL format.

- **Seed script with realistic data** — The seed generates 10 users, 1000 tweets (from mix-and-match templates), ~300 replies, and ~2500 likes with staggered timestamps spanning ~33 hours.

## GraphQL API Reference

### Queries

| Query | Auth | Description |
|-------|------|-------------|
| `feed(limit, offset)` | No | Paginated top-level posts (parentId is null) |
| `tweet(id)` | No | Single tweet with author, replies, and likes |
| `replies(tweetId, limit, offset)` | No | Paginated replies for a tweet |
| `userTweets(userId, limit, offset)` | No | All tweets by a user |
| `me` | Yes | Current authenticated user |
| `user(username)` | No | User by username |
| `isLiked(tweetId)` | Yes | Whether current user has liked a tweet |
| `tweetLikes(tweetId)` | No | All likes on a tweet |

### Mutations

| Mutation | Auth | Description |
|----------|------|-------------|
| `register(input)` | No | Create account, returns JWT + user |
| `login(input)` | No | Authenticate, returns JWT + user |
| `createTweet(input)` | Yes | Create post or reply (set parentId for reply) |
| `deleteTweet(id)` | Yes | Delete own tweet (cascades to replies) |
| `toggleLike(tweetId)` | Yes | Like or unlike a tweet |

### Subscriptions

| Subscription | Description |
|--------------|-------------|
| `tweetCreated` | Fires when any user creates a new tweet |

## Demo Accounts

After running the seed script (`cd backend && npm run seed`):

| Username | Email | Password |
|----------|-------|----------|
| alice | alice@example.com | password123 |
| bob | bob@example.com | password123 |
| charlie | charlie@example.com | password123 |
| dana | dana@example.com | password123 |
| eve | eve@example.com | password123 |
| frank | frank@example.com | password123 |
| grace | grace@example.com | password123 |
| hank | hank@example.com | password123 |
| iris | iris@example.com | password123 |
| jake | jake@example.com | password123 |

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | NestJS 10 |
| Language | TypeScript 5 |
| API | GraphQL (code-first) via Apollo Server |
| ORM | TypeORM |
| Database | PostgreSQL (Neon) |
| Auth | Passport + JWT + bcrypt |
| Real-time | GraphQL Subscriptions (graphql-ws) |
| Frontend | React 18 |
| Routing | React Router 6 |
| GraphQL Client | Apollo Client 3 |
| Styling | Tailwind CSS 3 |
| Build Tool | Vite 5 |
| Avatars | DiceBear Notionists |