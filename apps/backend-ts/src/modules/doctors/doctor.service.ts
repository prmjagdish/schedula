import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: any) {
    const existing = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Profile already exists');
    }

    return this.prisma.doctorProfile.create({
      data: {
        user: {
          connect: { id: userId },
        },
        ...data,
      },
    });
  }

  async addSpecialization(userId: string, name: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    return this.prisma.specialization.create({
      data: {
        profile: {
          connect: { id: profile.id },
        },
        name,
      },
    });
  }
}
