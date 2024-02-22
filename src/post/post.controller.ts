/* eslint-disable */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Req,
  UploadedFile,
  UseGuards,
  BadRequestException,
  Query,
  Put,
  Res,
  ParseArrayPipe,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'helper/config';
import { AuthGuard } from 'src/auth/auth.guard';
import { extname } from 'path';
import { FilterPostDto } from './dto/filter-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { UpdateResult } from 'typeorm';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnail', { 
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname)
        const allowedExtArr = ['.jpg', '.png', '.jpeg']
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`
          cb(null,false)
        } else {
          const fileSize = parseInt(req.headers['Content-Length'])
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Accepted file size less than 5mb`
            cb(null, false)
          } else {
            cb(null, true)
          }
        }
       }  
    }),
  )
  create(@Req() req: any, @Body() createPostDto: CreatePostDto, @UploadedFile() file: Express.Multer.File) {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    if (!file) {
      throw new BadRequestException('File is required')
    }

    const formatFile = file.destination.split('/')[1]    
        
    return this.postService.create(req['user_data'].id, {...createPostDto, thumbnail: formatFile +'/'+file.filename});
  }

  @ApiQuery({ name: 'page' })
  @ApiQuery({ name: 'items_per_page' })
  @ApiQuery({ name: 'search' })
  @ApiQuery({ name: 'category' })
  @Get()
  findAll(@Query() query: FilterPostDto): Promise<any> {
    return this.postService.findAll(query);
  }

  @Delete('multiple')
  multipleDelete(
    @Query('ids', new ParseArrayPipe({ items: String, separator: ',' }))
    ids: string[],
  ) {
    return this.postService.multipleDelete(ids);
  }

  @Get(':id')
  findDetail(@Param('id') id: string): Promise<PostEntity> {
    return this.postService.findDetail(+id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('thumbnail', { 
      storage: storageConfig('post'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname)
        const allowedExtArr = ['.jpg', '.png', '.jpeg']
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`
          cb(null,false)
        } else {
          const fileSize = parseInt(req.headers['Content-Length'])
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Accepted file size less than 5mb`
            cb(null, false)
          } else {
            cb(null, true)
          }
        }
       }  
    }),
  )
  update(@Param('id') id: string,@Req() req: any, @Body() updatePostDto: UpdatePostDto, @UploadedFile() file: Express.Multer.File): Promise<UpdateResult> {
    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }

    const formatFile = file?.destination.split('/')[1]

    if (file) {
      updatePostDto.thumbnail = formatFile + '/' + file.filename 
    } 
    return this.postService.update(+id, updatePostDto); 
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(+id);
  }

  @Post('cke-upload')
  @UseInterceptors(
    FileInterceptor('upload', { 
      storage: storageConfig('ckeditor'),
      fileFilter: (req, file, cb) => {
        const ext = extname(file.originalname)
        const allowedExtArr = ['.jpg', '.png', '.jpeg']
        if (!allowedExtArr.includes(ext)) {
          req.fileValidationError = `Wrong extension type. Accepted file ext are: ${allowedExtArr.toString()}`
          cb(null,false)
        } else {
          const fileSize = parseInt(req.headers['Content-Length'])
          if (fileSize > 1024 * 1024 * 5) {
            req.fileValidationError = `File size is too large. Accepted file size less than 5mb`
            cb(null, false)
          } else {
            cb(null, true)
          }
        }
       }  
    }),
  )
  ckeUpload(@Body() data: any, @UploadedFile() file: Express.Multer.File) {
    return {
      'url': `ckeditor/${file.filename}`
    }
  }
}
