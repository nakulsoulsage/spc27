import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('applications')
@UseGuards(RolesGuard)
export class ApplicationsController {
  constructor(private service: ApplicationsService) {}

  @Post()
  @Roles(Role.STUDENT)
  apply(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.service.apply(userId, dto.jobPostingId);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  findMyApplications(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findMyApplications(userId, query);
  }

  @Get('job/:jobId')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  findByJob(
    @Param('jobId') jobId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findByJob(jobId, query);
  }

  @Patch(':id/status')
  @Roles(Role.TPO, Role.RECRUITER, Role.SUPER_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }
}
