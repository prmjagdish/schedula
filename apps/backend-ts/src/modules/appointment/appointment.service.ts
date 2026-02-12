import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AppointmentStatus } from "@prisma/client";

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  async bookAppointment(userId: string, slotId: string) {
    return this.prisma.$transaction(async (tx) => {
      const patientProfile = await tx.patientProfile.findUnique({
        where: { userId },
      });

      if (!patientProfile) {
        throw new BadRequestException("Patient profile not found");
      }

      const slot = await tx.slot.findUnique({
        where: { id: slotId },
      });

      if (!slot) {
        throw new NotFoundException("Slot not found");
      }

      const appointmentCount = await tx.appointment.count({
        where: {
          slotId,
          status: AppointmentStatus.CONFIRMED,
        },
      });

      if (appointmentCount >= slot.maxCapacity) {
        throw new BadRequestException("Slot is fully booked");
      }

      return tx.appointment.create({
        data: {
          patientId: patientProfile.id,
          doctorId: slot.doctorId,
          slotId,
        },
      });
    });
  }

  async cancelAppointment(appointmentId: string) {
    return this.prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.findUnique({
        where: { id: appointmentId },
      });

      if (!appointment) {
        throw new NotFoundException("Appointment not found");
      }

      if (appointment.status === AppointmentStatus.CANCELLED) {
        throw new BadRequestException("Already cancelled");
      }

      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: AppointmentStatus.CANCELLED,
        },
      });

      return { message: "Appointment cancelled successfully" };
    });
  }

async getPatientAppointments(userId: string) {
  const patientProfile = await this.prisma.patientProfile.findUnique({
    where: { userId },
  });

  if (!patientProfile) {
    throw new BadRequestException("Patient profile not found");
  }

  return this.prisma.appointment.findMany({
    where: {
      patientId: patientProfile.id,
    },
    include: {
      doctor: {
        select: {
          id: true,
          fullName: true,
          experienceYears: true,
          consultationFee: true,
        },
      },
      slot: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

}
