import { Controller, Get, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { DashboardService } from './dashboard.service';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('dashboard')
@UseGuards(RolesGuard)
export class DashboardController {
  constructor(private service: DashboardService) {}

  @Get('admin')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  getAdminStats(@CurrentUser('institutionId') institutionId: string) {
    return this.service.getAdminStats(institutionId);
  }

  @Get('student')
  @Roles(Role.STUDENT)
  getStudentStats(@CurrentUser('sub') userId: string) {
    return this.service.getStudentStats(userId);
  }
}
