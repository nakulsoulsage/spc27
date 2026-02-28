import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { StudentsService } from './students.service';
import { CreateStudentProfileDto, UpdateStudentProfileDto } from './dto/student.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('students')
@UseGuards(RolesGuard)
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Post('profile')
  @Roles(Role.STUDENT)
  createProfile(
    @CurrentUser('sub') userId: string,
    @CurrentUser('institutionId') institutionId: string,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.service.createProfile(userId, institutionId, dto);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Patch('me')
  @Roles(Role.STUDENT)
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.service.updateMyProfile(userId, dto);
  }

  @Get()
  @Roles(Role.TPO, Role.SUPER_ADMIN, Role.RECRUITER)
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findAll(institutionId, query);
  }

  @Get(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN, Role.RECRUITER)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
