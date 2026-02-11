import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
  Get,
  Query,
} from "@nestjs/common";
import { DoctorsService } from "./doctor.service";
import { ZodValidationPipe } from "../../common/pipes/zod-validation.pipe";
import { createProfileSchema } from "./dto/create-profile.schema";
import { addSpecializationSchema } from "./dto/add-specialization.schema";
import { updateProfileSchema } from "./dto/update-profile.schema";
import { AuthGuard } from "@nestjs/passport";
import { Role } from "@prisma/client";

@Controller("api/v1/doctors")
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}

  // Create Doctor Profile (JWT required)
  @Post("profile")
  @UseGuards(AuthGuard("jwt"))
  async createProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(createProfileSchema)) body: any,
  ) {
    if (req.user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can create profile");
    }

    return this.service.createProfile(req.user.userId, body);
  }

  // Update Doctor Profile (JWT required)
  @Patch("profile")
  @UseGuards(AuthGuard("jwt"))
  async updateProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(updateProfileSchema)) body: any,
  ) {
    if (req.user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can update profile");
    }

    return this.service.updateProfile(req.user.userId, body);
  }

  // Add Specialization (JWT required)
  @Post("specializations")
  @UseGuards(AuthGuard("jwt"))
  async addSpecialization(
    @Req() req: any,
    @Body(new ZodValidationPipe(addSpecializationSchema)) body: any,
  ) {
    if (req.user.role !== Role.DOCTOR) {
      throw new ForbiddenException("Only doctors can add specialization");
    }

    return this.service.addSpecialization(req.user.userId, body.name);
  }

  // Get Doctors (Public)
  @Get()
  async getDoctors(
    @Query("page") page = 1,
    @Query("limit") limit = 10,
    @Query("specialization") specialization?: string,
  ) {
    return this.service.getDoctors(Number(page), Number(limit), specialization);
  }
}
