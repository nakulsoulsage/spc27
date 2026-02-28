import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInstitutionDto, UpdateInstitutionDto } from './dto/institution.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInstitutionDto) {
    return this.prisma.institution.create({ data: dto });
  }

  async findAll(query: PaginationDto) {
    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as const } }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.institution.findMany({
        where,
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.institution.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new NotFoundException('Institution not found');
    return institution;
  }

  async update(id: string, dto: UpdateInstitutionDto) {
    await this.findOne(id);
    return this.prisma.institution.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.institution.delete({ where: { id } });
  }
}
