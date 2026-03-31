# Twitter Clone API

A Twitter-like GraphQL API built with NestJS, TypeScript, PostgreSQL, and TypeORM.

Posts and comments share the same `tweets` table — a tweet with no `parentId` is a top-level post, and one with a `parentId` is a reply/comment.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Environment is pre-configured in .env (committed for reviewer convenience)

# 3. Start the dev server (auto-creates tables via synchronize)
npm run start:dev

# 4. (Optional) Seed sample data — 1000 tweets, 10 users, replies, likes
npm run seed
```

Open **http://localhost:3000/graphql** for the GraphQL Playground.

## Database

This project uses [Neon](https://neon.tech) for hosted PostgreSQL. The connection string is pre-configured in `.env`. In a production environment, credentials would never be committed to source control.

## Data Model

| Table   | Purpose |
|---------|---------|
| `users` | User accounts with hashed passwords |
| `tweets`| Posts AND comments (self-referential via `parentId`) |
| `likes` | User↔Tweet join table with unique constraint |

## Example Queries

### Register
```graphql
mutation {
  register(input: { username: "alice", email: "alice@test.com", password: "secret123" }) {
    accessToken
    user { id username }
  }
}
```

### Login
```graphql
mutation {
  login(input: { email: "alice@test.com", password: "secret123" }) {
    accessToken
    user { id username }
  }
}
```

> Set the token in HTTP headers: `{ "Authorization": "Bearer <token>" }`

### Create a Post
```graphql
mutation {
  createTweet(input: { content: "Hello world!" }) {
    id content createdAt
  }
}
```

### Reply to a Post
```graphql
mutation {
  createTweet(input: { content: "Great post!", parentId: "<tweet-id>" }) {
    id content parentId
  }
}
```

### Get Feed (top-level posts only)
```graphql
query {
  feed(limit: 10, offset: 0) {
    items { id content author { username } likesCount repliesCount createdAt }
    total
    hasMore
  }
}
```

### Get a Tweet with Replies
```graphql
query {
  tweet(id: "<tweet-id>") {
    id content author { username }
    likesCount repliesCount
    replies { id content author { username } }
  }
}
```

### Toggle Like
```graphql
mutation {
  toggleLike(tweetId: "<tweet-id>")
}
```

### Subscribe to New Tweets (WebSocket)
```graphql
subscription {
  tweetCreated {
    id content author { username } createdAt
  }
}
```

## Project Structure

```
src/
├── auth/           # JWT auth (register, login, guards)
├── users/          # User entity, service, resolver
├── tweets/         # Tweet entity, service, resolver (posts + comments + subscriptions)
├── likes/          # Like entity, service, resolver (toggle)
├── common/         # Shared decorators (CurrentUser), PubSub for subscriptions
├── database/       # Seed script (1000 tweets, 10 users)
└── app.module.ts   # Root module wiring everything together
```

## Tech Stack
- **NestJS** — framework
- **TypeORM** — ORM with PostgreSQL
- **GraphQL** (code-first) — API layer via Apollo Server
- **GraphQL Subscriptions** — real-time updates via WebSocket (graphql-ws)
- **Passport + JWT** — authentication
- **bcrypt** — password hashing
- **Neon** — hosted PostgreSQL