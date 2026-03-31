import {
  Resolver,
  Query,
  Mutation,
  Subscription,
  Args,
  Int,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Tweet } from './entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { CreateTweetInput, PaginatedTweets } from './dto/tweet.dto';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { pubSub, EVENTS } from '../common/pubsub';

@Resolver(() => Tweet)
export class TweetsResolver {
  constructor(private tweetsService: TweetsService) {}

  // ---- Queries ----

  @Query(() => PaginatedTweets)
  async feed(
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedTweets> {
    return this.tweetsService.getFeed(limit, offset);
  }

  @Query(() => Tweet, { nullable: true })
  async tweet(@Args('id') id: string): Promise<Tweet | null> {
    return this.tweetsService.findById(id);
  }

  @Query(() => PaginatedTweets)
  async replies(
    @Args('tweetId') tweetId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedTweets> {
    return this.tweetsService.getReplies(tweetId, limit, offset);
  }

  @Query(() => PaginatedTweets)
  async userTweets(
    @Args('userId') userId: string,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number,
  ): Promise<PaginatedTweets> {
    return this.tweetsService.getUserTweets(userId, limit, offset);
  }

  // ---- Mutations ----

  @Mutation(() => Tweet)
  @UseGuards(GqlAuthGuard)
  async createTweet(
    @Args('input') input: CreateTweetInput,
    @CurrentUser() user: User,
  ): Promise<Tweet> {
    const tweet = await this.tweetsService.create(user.id, input.content, input.parentId);
    // Reload with relations so subscriptions get full data
    const full = await this.tweetsService.findById(tweet.id);
    await pubSub.publish(EVENTS.TWEET_CREATED, { tweetCreated: full });
    return full!;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteTweet(
    @Args('id') id: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.tweetsService.delete(id, user.id);
  }

  // ---- Subscriptions ----

  @Subscription(() => Tweet)
  tweetCreated() {
    return pubSub.asyncIterator(EVENTS.TWEET_CREATED);
  }

  // ---- Field Resolvers (computed fields) ----

  @ResolveField(() => Int)
  async likesCount(@Parent() tweet: Tweet): Promise<number> {
    return this.tweetsService.getLikesCount(tweet.id);
  }

  @ResolveField(() => Int)
  async repliesCount(@Parent() tweet: Tweet): Promise<number> {
    return this.tweetsService.getRepliesCount(tweet.id);
  }
}
