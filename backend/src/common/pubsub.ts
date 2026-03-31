import { PubSub } from 'graphql-subscriptions';
 
export const pubSub = new PubSub();
 
export const EVENTS = {
  TWEET_CREATED: 'tweetCreated',
  TWEET_LIKED: 'tweetLiked',
};