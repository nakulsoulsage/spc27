import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('jobs')
@UseGuards(RolesGuard)
export class JobsController {
  constructor(private service: JobsService) {}

  @Post()
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  create(
    @CurrentUser('institutionId') institutionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateJobDto,
  ) {
    return this.service.create(institutionId, userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findAll(institutionId, query);
  }

  @Get('eligible')
  @Roles(Role.STUDENT)
  findEligible(
    @CurrentUser('sub') userId: string,
    @CurrentUser('institutionId') institutionId: string,
  ) {
    return this.service.findEligibleForStudent(userId, institutionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/eligible-students')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  getEligibleStudents(@Param('id') id: string) {
    return this.service.getEligibleStudents(id);
  }

  @Patch(':id')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
