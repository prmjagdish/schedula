import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthResponseDto, JwtPayload } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: SignupDto): Promise<AuthResponseDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = (data as any).role ?? 'PATIENT';

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        provider: 'LOCAL',
        role,
      },
    });

    const accessToken = this.generateToken(user.id, user.role);
    return { accessToken };
  }

  async signin(data: SigninDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.generateToken(user.id, user.role);
    return { accessToken };
  }

  async handleGoogleCallback(profile: any, role?: string): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.googleId },
    });

    if (!user) {
      user = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (user) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: profile.googleId,
            provider: 'GOOGLE',
            ...(role ? { role } : {}),
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.googleId,
            provider: 'GOOGLE',
            role: role ?? 'PATIENT',
            password: null,
          },
        });
      }
    }

    const accessToken = this.generateToken(user.id, user.role);
    return { accessToken };
  }


  private generateToken(userId: string, role: string): string {
    const payload: JwtPayload = {
      sub: userId,
      role,
    };
    return this.jwtService.sign(payload);
  }
}
