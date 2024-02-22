/* eslint-disable */
import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, User, Category]),
    ConfigModule
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
