import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDtoSchema } from './dto/signup.dto';
import { SigninDtoSchema } from './dto/signin.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ZodError } from 'zod';
import { Role } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any): Promise<{ message: string }> {
    try {
      const data = SignupDtoSchema.parse(body);
      return await this.authService.signup(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token is required');
    }

    return this.authService.verify(token);
  }

  @Post('signin')
  async signin(@Body() body: any): Promise<AuthResponseDto> {
    try {
      const data = SigninDtoSchema.parse(body);
      return await this.authService.signin(data);
    } catch (error: any) {
      if (error instanceof ZodError) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // handled by passport
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleCallback(@Req() req: any): Promise<AuthResponseDto> {
    let role: Role | undefined;

    try {
      const state = req.query?.state;
      if (state) {
        const parsed =
          typeof state === 'string' ? JSON.parse(state) : state;

        if (parsed?.role && Object.values(Role).includes(parsed.role)) {
          role = parsed.role as Role;
        }
      }
    } catch {
      // ignore malformed state
    }

    return this.authService.handleGoogleCallback(req.user, role);
  }

}
