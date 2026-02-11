import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDto, SignupDtoSchema } from './dto/signup.dto';
import { SigninDto, SigninDtoSchema } from './dto/signin.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: any): Promise<AuthResponseDto> {
    try {
      const data = SignupDtoSchema.parse(body);
      return await this.authService.signup(data);
    } catch (error: any) {
      if (error.errors) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  @Post('signin')
  async signin(@Body() body: any): Promise<AuthResponseDto> {
    try {
      const data = SigninDtoSchema.parse(body);
      return await this.authService.signin(data);
    } catch (error: any) {
      if (error.errors) {
        throw new BadRequestException(error.errors[0].message);
      }
      throw error;
    }
  }

  @Get('google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // This route initiates Google OAuth flow
    // PassportAuthGuard handles the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleCallback(@Req() req: any): Promise<AuthResponseDto> {
    let role: string | undefined;
    try {
      const state = req.query?.state;
      if (state) {
        const parsed = typeof state === 'string' ? JSON.parse(state) : state;
        role = parsed?.role;
      }
    } catch (e) {
      // ignore malformed state
    }

    return this.authService.handleGoogleCallback(req.user, role);
  }

  @Post('signout')
  async signout(@Req() req: any) {
    return { success: true };
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@Req() req: any) {
    return {
      userId: req.user.userId,
      role: req.user.role,
    };
  }
}
