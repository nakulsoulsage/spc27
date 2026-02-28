import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RoundsService } from './rounds.service';
import { CreateRoundDto, UpdateRoundDto, SubmitRoundResultDto } from './dto/round.dto';
import { Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('rounds')
@UseGuards(RolesGuard)
export class RoundsController {
  constructor(private service: RoundsService) {}

  @Post()
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  create(@Body() dto: CreateRoundDto) {
    return this.service.create(dto);
  }

  @Get('job/:jobId')
  findByJob(@Param('jobId') jobId: string) {
    return this.service.findByJob(jobId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRoundDto) {
    return this.service.update(id, dto);
  }

  @Post('result')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  submitResult(@Body() dto: SubmitRoundResultDto) {
    return this.service.submitResult(dto);
  }

  @Delete(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
