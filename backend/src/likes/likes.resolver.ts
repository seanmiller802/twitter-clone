import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Like } from './entities/like.entity';
import { LikesService } from './likes.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Resolver(() => Like)
export class LikesResolver {
  constructor(private likesService: LikesService) {}

  @Mutation(() => Boolean, {
    description: 'Toggle like on a tweet. Returns true if now liked, false if unliked.',
  })
  @UseGuards(GqlAuthGuard)
  async toggleLike(
    @Args('tweetId') tweetId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.likesService.toggleLike(user.id, tweetId);
  }

  @Query(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async isLiked(
    @Args('tweetId') tweetId: string,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return this.likesService.isLikedByUser(user.id, tweetId);
  }

  @Query(() => [Like])
  async tweetLikes(@Args('tweetId') tweetId: string): Promise<Like[]> {
    return this.likesService.getLikesForTweet(tweetId);
  }
}
