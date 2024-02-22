/* eslint-disable */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { DeleteResult, In, Like, Repository, UpdateResult } from 'typeorm';
import { Post } from './entities/post.entity';
import { FilterPostDto } from './dto/filter-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Post)
    private postRepository: Repository<Post>,
  ) {}
  async create(userId: number, createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: userId });

    try {
      const res = await this.postRepository.save({
        ...createPostDto,
        user: user,
      });

      return await this.postRepository.findOneBy({ id: res.id });
    } catch (error) {
      throw new HttpException('Can not create post', HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(query: FilterPostDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10;
    const page = Number(query.page) || 1;
    const search = query.search || '';
    const category = +query.category || null;

    const skip = (page - 1) * items_per_page;
    const [res, total] = await this.postRepository.findAndCount({
      where: [
        {
          title: Like('%' + search + '%'),
          category: {
            id: category,
          },
        },
        {
          description: Like('%' + search + '%'),
          category: {
            id: category,
          },
        },
      ],
      order: { created_at: 'DESC' },
      take: items_per_page,
      skip: skip,
      relations: {
        user: true,
        category: true,
      },
      select: {
        category: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar: true,
        },
      },
    });

    const lastPage = Math.ceil(total / items_per_page);
    const nextPage = page + 1 > lastPage ? null : page + 1;
    const prevPage = page - 1 < 1 ? null : page - 1;

    return {
      data: res,
      total,
      currentPage: page,
      nextPage,
      prevPage,
      lastPage,
    };
  }

  async findDetail(id: number): Promise<Post> {
    return await this.postRepository.findOne({
      where: {
        id,
      },
      relations: ['user', 'category'],
      select: {
        category: {
          id: true,
          name: true,
        },
        user: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          avatar: true,
        },
      },
    });
  }

  async update(
    id: number,
    updatePostDto: UpdatePostDto,
  ): Promise<UpdateResult> {
    return await this.postRepository.update(id, updatePostDto);
  }

  async remove(id: number): Promise<DeleteResult> {
    return await this.postRepository.delete(id);
  }

  async multipleDelete(ids: string[]): Promise<DeleteResult> {
    // Chuyển các id thành số nếu có thể, lọc ra các id hợp lệ
    const validIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    // Kiểm tra nếu không có id hợp lệ, trả về lỗi hoặc xử lý tùy ý
    if (validIds.length !== ids.length) {
      throw new BadRequestException('Invalid id');
    }

    // Tiến hành xóa với các id hợp lệ
    return await this.postRepository.delete({ id: In(validIds) });
    // return await this.userRepository.delete({id: In(ids)})
  }
}
