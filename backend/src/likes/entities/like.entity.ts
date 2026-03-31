import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Tweet } from '../../tweets/entities/tweet.entity';

@ObjectType()
@Entity('likes')
@Unique('UQ_user_tweet', ['userId', 'tweetId'])
export class Like {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.likes, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column('uuid')
  userId: string;

  @Field(() => Tweet)
  @ManyToOne(() => Tweet, (tweet) => tweet.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tweetId' })
  tweet: Tweet;

  @Column('uuid')
  tweetId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
