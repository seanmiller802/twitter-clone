import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tweet } from './entities/tweet.entity';
import { TweetsService } from './tweets.service';
import { TweetsResolver } from './tweets.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Tweet])],
  providers: [TweetsService, TweetsResolver],
  exports: [TweetsService],
})
export class TweetsModule {}
