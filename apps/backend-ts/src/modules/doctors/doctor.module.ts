import { Module } from "@nestjs/common";
import { DoctorsController } from "./doctor.controller";
import { DoctorsService } from "./doctor.service";
import { PrismaService } from "src/prisma.service";


@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService, PrismaService],

})

export class DoctorsModule {}
