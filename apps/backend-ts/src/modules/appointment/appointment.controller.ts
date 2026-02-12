import {
  Controller,
  Post,
  Param,
  Delete,
  Get,
  UseGuards,
  Req,
} from "@nestjs/common";
import { AppointmentService } from "./appointment.service";
import { AuthGuard } from "../auth/guards/auth.guard";

@Controller("api/v1/appointments")
export class AppointmentController {
  constructor(private readonly service: AppointmentService) {}

  @UseGuards(AuthGuard)
  @Post(":slotId")
  async book(@Param("slotId") slotId: string, @Req() req: any) {
    return this.service.bookAppointment(req.user.userId, slotId);
  }

  @UseGuards(AuthGuard)
  @Delete(":appointmentId")
  async cancel(@Param("appointmentId") appointmentId: string) {
    return this.service.cancelAppointment(appointmentId);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  async myAppointments(@Req() req: any) {
    return this.service.getPatientAppointments(req.user.userId);
  }
}
