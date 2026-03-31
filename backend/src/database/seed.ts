import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tweet } from '../tweets/entities/tweet.entity';
import { Like } from '../likes/entities/like.entity';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Tweet, Like],
  synchronize: true,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  await AppDataSource.initialize();
  console.log('Connected to database');

  const userRepo = AppDataSource.getRepository(User);
  const tweetRepo = AppDataSource.getRepository(Tweet);
  const likeRepo = AppDataSource.getRepository(Like);

  // Clear existing data
  await AppDataSource.query('TRUNCATE TABLE likes, tweets, users CASCADE');

  // Create 10 users
  const password = await bcrypt.hash('password123', 10);
  const usernames = [
    'alice', 'bob', 'charlie', 'dana', 'eve',
    'frank', 'grace', 'hank', 'iris', 'jake',
  ];

  const users = [];
  for (const name of usernames) {
    const user = await userRepo.save(
      userRepo.create({ username: name, email: `${name}@example.com`, password }),
    );
    users.push(user);
  }
  console.log(`Created ${users.length} users (password: password123)`);

  // --- Generate 1000 unique tweets from mix-and-match templates ---

  const openers = [
    "Hot take:", "Unpopular opinion:", "Just realized", "TIL", "Reminder:",
    "PSA:", "Controversial:", "Hear me out:", "No one talks about", "Honestly,",
    "After 5 years of coding,", "Day 100 of learning to code:", "New blog post:",
    "Showerthought:", "I will die on this hill:", "This might be obvious but",
    "Can we normalize", "Why does nobody talk about", "Am I the only one who thinks",
    "Finally understand why", "Hot take incoming:", "Just shipped", "Broke prod because",
    "3am thought:", "Friendly reminder:", "Just discovered", "Pro tip:",
    "Storytime:", "Been thinking about", "Just finished reading about",
  ];

  const topics = [
    "TypeScript generics are actually not that hard once you practice them.",
    "GraphQL is overhyped for simple CRUD apps but perfect for complex ones.",
    "PostgreSQL should be everyone's default database choice in 2026.",
    "NestJS has the best developer experience of any Node.js framework.",
    "writing tests saves more time than it costs. Every single time.",
    "most technical interviews test the wrong skills entirely.",
    "you don't need microservices. A well-structured monolith is fine.",
    "the best code is code that's easy to delete, not easy to extend.",
    "Docker changed my life. No more dependency hell.",
    "REST vs GraphQL isn't about which is better. It's about which fits your use case.",
    "junior devs should read more code than they write.",
    "code reviews are the highest-leverage activity on any engineering team.",
    "your git history tells a story. Make it a good one.",
    "the best debugging technique is explaining the problem to someone else.",
    "serverless is amazing until you need a WebSocket connection.",
    "Tailwind CSS is the fastest way to build a decent-looking UI.",
    "React hooks were a paradigm shift and we take them for granted now.",
    "Postgres JSONB columns eliminate 80% of NoSQL use cases.",
    "CI/CD isn't optional anymore. It's table stakes.",
    "the gap between knowing syntax and building systems is enormous.",
    "monorepos make dependency management so much simpler.",
    "connection pooling is the #1 thing people forget about in production.",
    "soft deletes save you from so many customer support tickets.",
    "rate limiting your API should be step one, not an afterthought.",
    "database migrations should be part of your deployment pipeline.",
    "caching is just lying about the present to be faster.",
    "error handling is what separates hobby projects from production code.",
    "TypeORM relations are powerful but the docs could be better.",
    "you learn more from debugging a gnarly prod issue than any course.",
    "pair programming works when both people are engaged. Otherwise it's a waste.",
    "Vite made webpack feel like a relic from another era.",
    "the best architecture is the simplest one that works.",
    "naming things is genuinely the hardest part of programming.",
    "dark mode should be the default everywhere.",
    "CORS errors have collectively wasted millions of developer hours.",
    "writing documentation is an act of kindness to future-you.",
    "index your foreign keys. I shouldn't have to say this but here we are.",
    "JWT auth is straightforward once you stop overthinking it.",
    "the terminal is more powerful than most developers realize.",
    "state management is only hard when you're managing too much state.",
  ];

  const reactions = [
    "Change my mind.", "No, I will not elaborate.", "And I'm tired of pretending otherwise.",
    "This is non-negotiable.", "Fight me.", "I said what I said.",
    "Reply if you disagree.", "Thoughts?", "Am I wrong?", "RT if you agree.",
    "The data backs this up.", "I've seen too many projects fail because of this.",
    "Save this tweet.", "Thread coming soon.", "This took me years to learn.",
    "Who else has experienced this?", "Genuinely curious what others think.",
    "This should be taught in every bootcamp.", "Bookmark this.",
    "", "", "", "", "", "", // empty ones so not every tweet has a reaction
  ];

  function generateTweet(index: number): string {
    const useOpener = Math.random() > 0.4;
    const useReaction = Math.random() > 0.5;
    const opener = useOpener ? openers[index % openers.length] + ' ' : '';
    const topic = topics[(index * 7 + Math.floor(index / 3)) % topics.length];
    const reaction = useReaction ? ' ' + reactions[(index * 3) % reactions.length] : '';
    const result = (opener + topic + reaction).trim();
    return result.length > 280 ? result.slice(0, 277) + '...' : result;
  }

  // Batch insert tweets for speed
  const BATCH_SIZE = 50;
  const TOTAL_TWEETS = 1000;
  const tweets: Tweet[] = [];
  const now = Date.now();

  for (let batch = 0; batch < TOTAL_TWEETS; batch += BATCH_SIZE) {
    const tweetBatch = [];
    for (let i = batch; i < Math.min(batch + BATCH_SIZE, TOTAL_TWEETS); i++) {
      const author = users[i % users.length];
      const minutesAgo = (TOTAL_TWEETS - i) * 2; // spread over ~33 hours
      const tweet = tweetRepo.create({
        content: generateTweet(i),
        authorId: author.id,
      });
      tweet.createdAt = new Date(now - minutesAgo * 60 * 1000);
      tweetBatch.push(tweet);
    }
    const saved = await tweetRepo.save(tweetBatch);
    tweets.push(...saved);
    if ((batch + BATCH_SIZE) % 200 === 0) {
      console.log(`  ...created ${Math.min(batch + BATCH_SIZE, TOTAL_TWEETS)} tweets`);
    }
  }
  console.log(`Created ${tweets.length} tweets`);

  // Add replies to ~30% of tweets
  const replyContents = [
    "Couldn't agree more!", "This is the way.", "Interesting take!",
    "I had the exact same experience.", "Bookmarking this for later.",
    "Hard disagree but I respect the opinion.", "This needs more likes.",
    "Saving this thread.", "You're speaking facts.", "100% this.",
    "Learned something new today, thanks!", "Underrated post right here.",
    "Wish I could upvote this twice.", "Finally someone said it.",
    "Adding this to my notes.", "Great point, hadn't thought of it that way.",
    "This should be pinned.", "Printing this out and hanging it on my wall.",
    "Just sent this to my whole team.", "I literally just hit this issue today.",
  ];

  let replyCount = 0;
  const replyBatch = [];
  for (const tweet of tweets) {
    if (Math.random() > 0.3) continue; // skip ~70%
    const numReplies = Math.floor(Math.random() * 3) + 1;
    for (let r = 0; r < numReplies; r++) {
      const replier = users[Math.floor(Math.random() * users.length)];
      const replyText = replyContents[Math.floor(Math.random() * replyContents.length)];
      replyBatch.push(
        tweetRepo.create({ content: replyText, authorId: replier.id, parentId: tweet.id }),
      );
      replyCount++;
    }
    if (replyBatch.length >= 50) {
      await tweetRepo.save(replyBatch.splice(0));
    }
  }
  if (replyBatch.length > 0) await tweetRepo.save(replyBatch);
  console.log(`Created ${replyCount} replies`);

  // Batch insert likes
  let likeCount = 0;
  const likeBatch = [];
  const seenLikes = new Set<string>();
  for (const tweet of tweets) {
    const numLikes = Math.floor(Math.random() * 6);
    const shuffled = [...users].sort(() => Math.random() - 0.5);
    for (let l = 0; l < numLikes; l++) {
      const key = `${shuffled[l].id}-${tweet.id}`;
      if (seenLikes.has(key)) continue;
      seenLikes.add(key);
      likeBatch.push(likeRepo.create({ userId: shuffled[l].id, tweetId: tweet.id }));
      likeCount++;
    }
    if (likeBatch.length >= 100) {
      await likeRepo.save(likeBatch.splice(0));
    }
  }
  if (likeBatch.length > 0) await likeRepo.save(likeBatch);
  console.log(`Created ${likeCount} likes`);

  console.log('Done!');
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
