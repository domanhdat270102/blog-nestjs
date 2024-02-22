/* eslint-disable */
import { BadRequestException, Injectable, Query } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { DeleteResult, In, Like, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}
 

  async findAll(query: FilterUserDto): Promise<any> {
    const items_per_page = Number(query.items_per_page) || 10
    const page = Number(query.page) || 1;
    const skip = (page - 1) * items_per_page
    const keyword = query.search || ''
    const [res, total] = await this.userRepository.findAndCount({
      where: [
        {first_name: Like('%' + keyword + '%')},
        {last_name: Like('%' + keyword + '%')},
        {email: Like('%' + keyword + '%')}
      ],
      order: {created_at: "DESC"},
      take: items_per_page,
      skip: skip,
      relations: {
        posts: true
      },
      select: ['id','email','created_at','updated_at','first_name','last_name','status']
    })

    const lastPage = Math.ceil(total / items_per_page);
    const nextPage = page + 1 > lastPage ? null : page + 1
    const prevPage = page - 1 < 1 ? null : page - 1

    return {
      data: res,
      total: total,
      currentPage: page,
      nextPage,
      prevPage,
      lastPage
    }
  }
  
  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOneBy({id})
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashPassword = await bcrypt.hash(createUserDto.password, 10)
    return await this.userRepository.save({...createUserDto, password: hashPassword})
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    return await this.userRepository.update(id, updateUserDto)
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.userRepository.delete(id)
  }

  async multipleDelete(ids: string[]): Promise<DeleteResult> {
     // Chuyển các id thành số nếu có thể, lọc ra các id hợp lệ
  const validIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));

  // Kiểm tra nếu không có id hợp lệ, trả về lỗi hoặc xử lý tùy ý
  if (validIds.length !== ids.length) {
    throw new BadRequestException('Invalid id');
  }

  // Tiến hành xóa với các id hợp lệ
  return await this.userRepository.delete({ id: In(validIds) });
    // return await this.userRepository.delete({id: In(ids)})
  }

  async updateAvatar(id: number, avatar: string): Promise<UpdateResult> {
    return await this.userRepository.update(id, {avatar})
  }
}