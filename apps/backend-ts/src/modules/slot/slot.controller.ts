import {
  Body,
  Controller,
  Post,
  Get,
  BadRequestException,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { SlotService } from "./slot.service";
import { CreateSlotSchema } from "./dto/slot.schema";
import { AuthGuard } from "../auth/guards/auth.guard";

@Controller("api/v1/slots")
export class SlotController {
  constructor(private readonly slotService: SlotService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() body: unknown, @Req() req: any) {
    const parsed = CreateSlotSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException(parsed.error.format());
    }

    const user = req.user;

    if (user.role !== "DOCTOR") {
      throw new ForbiddenException("Only doctors can create slots");
    }

    return this.slotService.createSlot(user.userId, parsed.data);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req: any) {
    const user = req.user;

    if (user.role !== "DOCTOR") {
      throw new ForbiddenException("Only doctors can view their slots");
    }

    return this.slotService.findSlotsByDoctor(user.userId);
  } 
}
