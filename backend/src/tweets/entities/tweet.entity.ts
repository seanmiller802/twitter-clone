import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Like } from '../../likes/entities/like.entity';

@ObjectType()
@Entity('tweets')
export class Tweet {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  content: string;

  // ---- Self-referential: null = top-level post, set = comment/reply ----

  @Field(() => String, { nullable: true })
  @Column({ type: 'uuid', nullable: true })
  parentId: string | null;

  @Field(() => Tweet, { nullable: true })
  @ManyToOne(() => Tweet, (tweet) => tweet.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: Tweet;

  @Field(() => [Tweet], { nullable: true })
  @OneToMany(() => Tweet, (tweet) => tweet.parent)
  replies?: Tweet[];

  // ---- Author ----

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.tweets, { eager: true })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column('uuid')
  authorId: string;

  // ---- Likes ----

  @Field(() => [Like], { nullable: true })
  @OneToMany(() => Like, (like) => like.tweet)
  likes?: Like[];

  @Field(() => Int)
  likesCount: number; // resolved in the resolver, not a DB column

  @Field(() => Int)
  repliesCount: number; // resolved in the resolver, not a DB column

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
