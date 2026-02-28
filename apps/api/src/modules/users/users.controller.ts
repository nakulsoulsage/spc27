import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { UsersService } from './users.service';
import { UpdateUserDto, AdminUpdateUserDto } from './dto/user.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findAll(institutionId, query);
  }

  @Get('me')
  getProfile(@CurrentUser('sub') userId: string) {
    return this.service.getProfile(userId);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.updateProfile(userId, dto);
  }

  @Get(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/admin')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.service.adminUpdate(id, dto);
  }
}
