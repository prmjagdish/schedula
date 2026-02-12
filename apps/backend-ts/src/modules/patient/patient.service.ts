import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class PatientService {constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: any) {
    const existing = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException("Profile already exists");
    }

    return this.prisma.patientProfile.create({
      data: {
        userId,
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : undefined,
      },
    });
  }

  async getProfile(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { userId },
      include: {
        appointments: {
          include: {
            doctor: true,
            slot: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return profile;
  }

  async updateProfile(userId: string, data: any) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return this.prisma.patientProfile.update({
      where: { userId },
      data: {
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth)
          : undefined,
      },
    });
  }

  async getAppointments(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    return this.prisma.appointment.findMany({
      where: { patientId: profile.id },
      include: {
        doctor: true,
        slot: true,
      },
    });
  }}
