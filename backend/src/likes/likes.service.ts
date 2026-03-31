import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private likesRepo: Repository<Like>,
  ) {}

  /**
   * Toggle like: if already liked, remove it; otherwise create it.
   * Returns true if the tweet is now liked, false if unliked.
   */
  async toggleLike(userId: string, tweetId: string): Promise<boolean> {
    const existing = await this.likesRepo.findOne({
      where: { userId, tweetId },
    });

    if (existing) {
      await this.likesRepo.remove(existing);
      return false; // unliked
    }

    const like = this.likesRepo.create({ userId, tweetId });
    await this.likesRepo.save(like);
    return true; // liked
  }

  async isLikedByUser(userId: string, tweetId: string): Promise<boolean> {
    const count = await this.likesRepo.count({
      where: { userId, tweetId },
    });
    return count > 0;
  }

  async getLikesForTweet(tweetId: string): Promise<Like[]> {
    return this.likesRepo.find({
      where: { tweetId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }
}
