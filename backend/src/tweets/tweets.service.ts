import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tweet } from './entities/tweet.entity';

@Injectable()
export class TweetsService {
  constructor(
    @InjectRepository(Tweet)
    private tweetsRepo: Repository<Tweet>,
  ) {}

  async create(authorId: string, content: string, parentId?: string): Promise<Tweet> {
    // If replying, verify parent exists
    if (parentId) {
      const parent = await this.tweetsRepo.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException('Parent tweet not found');
      }
    }

    const tweet = this.tweetsRepo.create({ content, authorId, parentId: parentId ?? null });
    return this.tweetsRepo.save(tweet);
  }

  async findById(id: string): Promise<Tweet | null> {
    return this.tweetsRepo.findOne({
      where: { id },
      relations: ['author', 'replies', 'replies.author', 'likes'],
    });
  }

  async getFeed(limit: number = 20, offset: number = 0) {
    const [items, total] = await this.tweetsRepo.findAndCount({
      where: { parentId: IsNull() }, // only top-level posts
      relations: ['author', 'likes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getReplies(tweetId: string, limit: number = 20, offset: number = 0) {
    const [items, total] = await this.tweetsRepo.findAndCount({
      where: { parentId: tweetId },
      relations: ['author', 'likes'],
      order: { createdAt: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getUserTweets(authorId: string, limit: number = 20, offset: number = 0) {
    const [items, total] = await this.tweetsRepo.findAndCount({
      where: { authorId },
      relations: ['author', 'likes'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      items,
      total,
      hasMore: offset + limit < total,
    };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const tweet = await this.tweetsRepo.findOne({ where: { id, authorId: userId } });
    if (!tweet) {
      throw new NotFoundException('Tweet not found or not authorized');
    }
    await this.tweetsRepo.remove(tweet);
    return true;
  }

  async getLikesCount(tweetId: string): Promise<number> {
    const tweet = await this.tweetsRepo.findOne({
      where: { id: tweetId },
      relations: ['likes'],
    });
    return tweet?.likes?.length ?? 0;
  }

  async getRepliesCount(tweetId: string): Promise<number> {
    return this.tweetsRepo.count({ where: { parentId: tweetId } });
  }
}
