import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { DoctorsService } from './doctor.service';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { createProfileSchema } from './dto/create-profile.schema';
import { addSpecializationSchema } from './dto/add-specialization.schema';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';

@Controller('api/v1/doctors')
export class DoctorsController {
  constructor(private readonly service: DoctorsService) {}

  // ✅ Create Doctor Profile (JWT required)
  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  async createProfile(
    @Req() req: any,
    @Body(new ZodValidationPipe(createProfileSchema)) body: any,
  ) {
    if (req.user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can create profile');
    }

    return this.service.createProfile(req.user.userId, body);
  }

  // ✅ Add Specialization (JWT required)
  @Post('specializations')
  @UseGuards(AuthGuard('jwt'))
  async addSpecialization(
    @Req() req: any,
    @Body(new ZodValidationPipe(addSpecializationSchema)) body: any,
  ) {
    if (req.user.role !== Role.DOCTOR) {
      throw new ForbiddenException('Only doctors can add specialization');
    }

    return this.service.addSpecialization(req.user.userId, body.name);
  }
}
