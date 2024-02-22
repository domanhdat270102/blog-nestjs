/* eslint-disable */
import { ApiProperty } from "@nestjs/swagger";
import { Category } from "src/category/entities/category.entity";
import { User } from "src/user/entities/user.entity";

export class CreatePostDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    thumbnail: string;
    @ApiProperty()
    status: number
    @ApiProperty()
    user: User
    @ApiProperty()
    category: Category
}
