import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

@Controller('companies')
@UseGuards(RolesGuard)
export class CompaniesController {
  constructor(private service: CompaniesService) {}

  @Post()
  @Roles(Role.RECRUITER, Role.TPO, Role.SUPER_ADMIN)
  create(
    @CurrentUser('institutionId') institutionId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCompanyDto,
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.RECRUITER, Role.TPO, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
