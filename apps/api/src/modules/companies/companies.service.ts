import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto, UpdateCompanyDto } from './dto/company.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async create(institutionId: string, recruiterId: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        ...dto,
        institutionId,
        recruiters: {
          create: { userId: recruiterId },
        },
      },
      include: { recruiters: { include: { user: { select: { email: true, firstName: true, lastName: true } } } } },
    });
  }

  async findAll(institutionId: string, query: PaginationDto) {
    const where: any = { institutionId };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { industry: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { jobPostings: true } } },
      }),
      this.prisma.company.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        recruiters: { include: { user: { select: { email: true, firstName: true, lastName: true } } } },
        jobPostings: { where: { status: 'OPEN' }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }

  async update(id: string, dto: UpdateCompanyDto) {
    await this.findOne(id);
    return this.prisma.company.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.company.delete({ where: { id } });
  }
}
