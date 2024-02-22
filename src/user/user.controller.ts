/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ParseArrayPipe,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { DeleteResult, UpdateResult } from 'typeorm';
import { FilterUserDto } from './dto/filter-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helper/config';
import { extname } from 'path';
import { Roles } from 'src/auth/decorator/roles.decorator';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles('Admin')
  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'items_per_page' })
  @ApiQuery({ name: 'search' })
  @Get()
  async findAll(@Query() query: FilterUserDto): Promise<User[]> {
    return await this.userService.findAll(query);
  }

  @Get('profile')
  async profile(@Req() req: any): Promise<User> {
    return await this.userService.findOne(Number(req['user_data'].id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.userService.findOne(Number(id));
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.create(createUserDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.userService.update(Number(id), updateUserDto);
  }

  @Delete('multiple')
  multipleDelete(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ) {
    return this.userService.multipleDelete(ids);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<DeleteResult> {
    return await this.userService.delete(Number(id));
  }

  @Post('upload-avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: storageConfig('avatar'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname);
        const allowedExtArr = ['.jpg', '.png', '.jpeg'];
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`;
          cb(null, false);
        } else {
          const fileSize = parseInt(req.headers['Content-Length']);
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Accepted file size less than 5mb`;
            cb(null, false);
          } else {
            cb(null, true);
          }
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Avatar uploaded successfully' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UpdateResult> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError);
    }

    if (!file) {
      throw new BadRequestException('File is required');
    }

    return this.userService.updateAvatar(
      req.user_data.id,
      file.fieldname + '/' + file.filename,
    );
  }
}
