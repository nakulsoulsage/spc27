import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';
import { EligibilityService } from './eligibility.service';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private eligibility: EligibilityService,
  ) {}

  async create(institutionId: string, postedById: string, dto: CreateJobDto) {
    return this.prisma.jobPosting.create({
      data: {
        title: dto.title,
        description: dto.description,
        jobType: dto.jobType,
        location: dto.location,
        salary: dto.salary,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        eligibilityCriteria: dto.eligibilityCriteria
          ? (JSON.parse(JSON.stringify(dto.eligibilityCriteria)) as object)
          : undefined,
        companyId: dto.companyId,
        institutionId,
        postedById,
      },
      include: { company: { select: { name: true } } },
    });
  }

  async findAll(institutionId: string, query: PaginationDto & { jobType?: string; status?: string; companyId?: string }) {
    const where: any = { institutionId };
    if (query.jobType) where.jobType = query.jobType;
    if (query.status) where.status = query.status;
    if (query.companyId) where.companyId = query.companyId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.jobPosting.findMany({
        where,
        include: {
          company: { select: { name: true, logo: true, industry: true } },
          _count: { select: { applications: true, rounds: true } },
        },
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.jobPosting.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findEligibleForStudent(userId: string, institutionId: string) {
    return this.eligibility.getEligibleJobsForStudent(userId, institutionId);
  }

  async findOne(id: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id },
      include: {
        company: true,
        rounds: { orderBy: { roundNumber: 'asc' } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) throw new NotFoundException('Job posting not found');
    return job;
  }

  async update(id: string, dto: UpdateJobDto) {
    await this.findOne(id);
    const { eligibilityCriteria, deadline, ...rest } = dto;
    return this.prisma.jobPosting.update({
      where: { id },
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : undefined,
        ...(eligibilityCriteria !== undefined && {
          eligibilityCriteria: JSON.parse(JSON.stringify(eligibilityCriteria)) as object,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.jobPosting.delete({ where: { id } });
  }

  async getEligibleStudents(jobId: string) {
    return this.eligibility.getEligibleStudentsForJob(jobId);
  }
}
