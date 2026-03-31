import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';
import { Tweet } from '../entities/tweet.entity';

@InputType()
export class CreateTweetInput {
  @Field()
  @MinLength(1)
  @MaxLength(280)
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string; // if set, this tweet is a comment/reply
}

@ObjectType()
export class PaginatedTweets {
  @Field(() => [Tweet])
  items: Tweet[];

  @Field(() => Int)
  total: number;

  @Field()
  hasMore: boolean;
}
