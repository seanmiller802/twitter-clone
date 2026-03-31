import { PubSub } from 'graphql-subscriptions';

// In-memory PubSub — suitable for single-instance dev.
// For production, swap with graphql-redis-subscriptions or similar.
export const pubSub = new PubSub();

export const EVENTS = {
  TWEET_CREATED: 'tweetCreated',
  TWEET_LIKED: 'tweetLiked',
};