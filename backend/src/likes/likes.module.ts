import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { LikesService } from './likes.service';
import { LikesResolver } from './likes.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Like])],
  providers: [LikesService, LikesResolver],
  exports: [LikesService],
})
export class LikesModule {}
