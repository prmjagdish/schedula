import {
  Injectable,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { CreateSlotDto } from "./dto/slot.schema";
import { AppointmentStatus } from "@prisma/client";

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
        maxCapacity: data.maxAppointments,
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
        maxCapacity: data.maxAppointments,
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

    const slots = await this.prisma.slot.findMany({
      where: { doctorId: doctor.id },
      include: {
        appointments: {
          where: {
            status: AppointmentStatus.CONFIRMED,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    // 🔥 Transform response
    return slots.map((slot) => {
      const confirmedCount = slot.appointments.length;

      return {
        id: slot.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxCapacity: slot.maxCapacity,
        confirmedBookings: confirmedCount,
        remainingCapacity: slot.maxCapacity - confirmedCount,
        status: confirmedCount >= slot.maxCapacity ? "FULL" : "AVAILABLE",
      };
    });
  }
}
