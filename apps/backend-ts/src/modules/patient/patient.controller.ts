import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { PatientService } from "./patient.service";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { createPatientSchema } from "./dto/create-patient.schema";
import { updatePatientSchema } from "./dto/update-patient.schema";
import { Role } from "@prisma/client";

@Controller("api/v1/patient")
@UseGuards(AuthGuard)
export class PatientController {
  constructor(private readonly service: PatientService) {}

  private ensurePatientRole(user: any) {
    if (user.role !== Role.PATIENT) {
      throw new ForbiddenException("Only patients allowed");
    }
  }

  @Post("profile")
  async createProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(createPatientSchema)) body: any
  ) {
    this.ensurePatientRole(req.user);
    return this.service.createProfile(req.user.userId, body);
  }

  @Get("profile")
  async getProfile(@Req() req: any) {
    this.ensurePatientRole(req.user);
    return this.service.getProfile(req.user.userId);
  }

  @Patch("profile")
  async updateProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(updatePatientSchema)) body: any
  ) {
    this.ensurePatientRole(req.user);
    return this.service.updateProfile(req.user.userId, body);
  }

  @Get("appointments")
  async getAppointments(@Req() req: any) {
    this.ensurePatientRole(req.user);
    return this.service.getAppointments(req.user.userId);
  }
}
