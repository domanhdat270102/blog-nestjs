/* eslint-disable */
import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from 'src/user/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from './decorator/public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  async register(@Body() registerUserDto: RegisterUserDto): Promise<User> {
    return await this.authService.register(registerUserDto)
  }

  @Post('login')
  @Public()
  @ApiResponse({status: 201, description: 'Login successful'})
  @ApiResponse({status: 401, description: 'Login fail'})
  @UsePipes(ValidationPipe)
  async login(@Body() loginUserDto: LoginUserDto): Promise<any> {
    return await this.authService.login(loginUserDto)
  }

  @Post('refresh-token')
  @Public()
  async refreshToken(@Body() {refresh_token}): Promise<any> {
    return await this.authService.refreshToken(refresh_token)
  }
}
