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
import { AnnouncementsService } from './announcements.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('announcements')
@UseGuards(RolesGuard)
export class AnnouncementsController {
  constructor(private service: AnnouncementsService) {}

  @Post()
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  create(
    @CurrentUser('sub') userId: string,
    @CurrentUser('institutionId') institutionId: string,
    @Body() dto: CreateAnnouncementDto,
  ) {
    return this.service.create(userId, institutionId, dto);
  }

  @Get()
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @CurrentUser('role') role: Role,
    @Query() query: PaginationDto,
  ) {
    return this.service.findAll(institutionId, role, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateAnnouncementDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Patch(':id/pin')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  togglePin(@Param('id') id: string) {
    return this.service.togglePin(id);
  }
}
