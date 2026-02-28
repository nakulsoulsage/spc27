import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  BulkUpdateStatusDto,
  CreateOfferDto,
  ApplicationQueryDto,
} from './dto/application.dto';
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
    return this.service.apply(userId, dto);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  findMyApplications(
    @CurrentUser('sub') userId: string,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.service.findMyApplications(userId, query);
  }

  @Get('opportunity/:opportunityId')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findByOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Query() query: ApplicationQueryDto,
  ) {
    return this.service.findByOpportunity(opportunityId, query);
  }

  @Patch(':id/status')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Post('bulk-status')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  bulkUpdateStatus(@Body() dto: BulkUpdateStatusDto) {
    return this.service.bulkUpdateStatus(dto.applicationIds, dto.status);
  }

  @Post('offer')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  createOffer(@Body() dto: CreateOfferDto) {
    return this.service.createOffer(dto);
  }
}
