import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, data: any) {
    const existing = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException("Profile already exists");
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
      throw new BadRequestException("Profile not found");
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

  async updateProfile(userId: string, data: any) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: { userId },
      include: { specializations: true },
    });

    if (!profile) {
      throw new NotFoundException("Profile not found");
    }

    const {
      fullName,
      experienceYears,
      consultationFee,
      consultationHours,
      bio,
      specializations,
    } = data;

    return this.prisma.$transaction(async (tx) => {
      const updatedProfile = await tx.doctorProfile.update({
        where: { userId },
        data: {
          fullName,
          experienceYears,
          consultationFee,
          consultationHours,
          bio,
        },
      });

      if (specializations) {
        await tx.specialization.deleteMany({
          where: { profileId: profile.id },
        });

        await tx.specialization.createMany({
          data: specializations.map((name: string) => ({
            name,
            profileId: profile.id,
          })),
        });
      }

      return updatedProfile;
    });
  }

  async getDoctors(page: number, limit: number, specialization?: string) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (specialization) {
      where.specializations = {
        some: {
          name: specialization,
        },
      };
    }

    const [doctors, total] = await this.prisma.$transaction([
      this.prisma.doctorProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: true,
          specializations: true,
        },
      }),
      this.prisma.doctorProfile.count({ where }),
    ]);

    return {
      data: doctors,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
