import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OpportunitiesService } from './opportunities.service';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  OpportunityQueryDto,
} from './dto/opportunity.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('opportunities')
@UseGuards(RolesGuard)
export class OpportunitiesController {
  constructor(
    private service: OpportunitiesService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('institutionId') institutionId: string,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.service.create(userId, institutionId, dto);
  }

  @Get()
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @Query() query: OpportunityQueryDto,
  ) {
    return this.service.findAll(institutionId, query);
  }

  @Get('eligible')
  @Roles(Role.STUDENT)
  async findEligible(@CurrentUser('sub') userId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) return [];
    return this.service.findEligibleForStudent(student.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/close')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  close(@Param('id') id: string) {
    return this.service.close(id);
  }

  @Get(':id/eligible-students')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  getEligibleStudents(
    @Param('id') id: string,
    @CurrentUser('institutionId') institutionId: string,
  ) {
    return this.service.getEligibleStudents(id, institutionId);
  }
}
