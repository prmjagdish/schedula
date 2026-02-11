import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthResponseDto, JwtPayload } from './dto/auth-response.dto';
import { randomBytes } from 'crypto';
import { Role, Status, Provider } from '@prisma/client';
import { MailService } from '../../services/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService
  ) {}

  async signup(data: SignupDto): Promise<{ message: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email, 
        password: hashedPassword,
        role: data.role ?? Role.PATIENT,
        provider: Provider.LOCAL,
        status: Status.PENDING,
      },
    });

    const token = randomBytes(32).toString('hex');

    await this.prisma.verificationToken.create({
      data: {
        user: {
          connect: { id: user.id },
        },
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await this.mailService.sendVerificationEmail(user.email, token);

    return { message: 'Registered successfully. Please verify your email.' };
  }

  async verify(token: string): Promise<{ message: string }> {
    const record = await this.prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!record) {
      throw new BadRequestException('Invalid token');
    }

    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired');
    }

    await this.prisma.user.update({
      where: { id: record.userId },
      data: {
        status: Status.APPROVED,
      },
    });

    await this.prisma.verificationToken.delete({
      where: { id: record.id },
    });

    return { message: 'Account verified successfully.' };
  }

  async signin(data: SigninDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== Status.APPROVED) {
      throw new UnauthorizedException(
        'Please verify your email before logging in.',
      );
    }

    const accessToken = this.generateToken(user.id, user.role);

    return { accessToken };
  }

  async handleGoogleCallback(
    profile: any,
    role?: Role,
  ): Promise<AuthResponseDto> {
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
            provider: Provider.GOOGLE,
            ...(role ? { role } : {}),
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            googleId: profile.googleId,
            provider: Provider.GOOGLE,
            role: role ?? Role.PATIENT,
            status: Status.APPROVED, // Google users auto-verified
            password: null,
          },
        });
      }
    }

    const accessToken = this.generateToken(user.id, user.role);
    return { accessToken };
  }

  private generateToken(userId: string, role: Role): string {
    const payload: JwtPayload = {
      sub: userId,
      role,
    };

    return this.jwtService.sign(payload);
  }
}
