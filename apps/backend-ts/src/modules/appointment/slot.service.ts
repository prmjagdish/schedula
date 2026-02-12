import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateSlotDto } from "./dto/slot.schema";

@Injectable()
export class SlotService {
  constructor(private prisma: PrismaService) {}

  async createSlot(userId: string, data: CreateSlotDto) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new ForbiddenException("Doctor profile not found");
    }

    const existingSlot = await this.prisma.slot.findFirst({
      where: {
        doctorId: doctor.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });

    if (existingSlot) {
      throw new BadRequestException("Slot already exists");
    }

    return this.prisma.slot.create({
      data: {
        doctorId: doctor.id,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      },
    });
  }

    async findSlotsByDoctor(userId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new ForbiddenException("Doctor profile not found");
    }

    return this.prisma.slot.findMany({
      where: { doctorId: doctor.id },
    });
  }
}
