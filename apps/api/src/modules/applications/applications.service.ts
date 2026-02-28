import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EligibilityService } from '../jobs/eligibility.service';
import { UpdateApplicationStatusDto } from './dto/application.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';
import { APPLICATION_STATUS_TRANSITIONS } from '@spc27/shared';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private eligibility: EligibilityService,
  ) {}

  async apply(userId: string, jobPostingId: string) {
    // Get student profile
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new BadRequestException('Complete your student profile first');
    }
    if (!student.isProfileComplete) {
      throw new BadRequestException('Complete your profile before applying');
    }

    // Check job exists and is open
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobPostingId },
    });
    if (!job) throw new NotFoundException('Job posting not found');
    if (job.status !== 'OPEN') {
      throw new BadRequestException('This job is no longer accepting applications');
    }

    // Check deadline
    if (job.deadline && new Date(job.deadline) < new Date()) {
      throw new BadRequestException('Application deadline has passed');
    }

    // Check eligibility
    const criteria = job.eligibilityCriteria as any;
    if (criteria && !this.eligibility.isStudentEligible(student, criteria)) {
      throw new BadRequestException('You do not meet the eligibility criteria');
    }

    // Check duplicate
    const existing = await this.prisma.application.findUnique({
      where: {
        studentProfileId_jobPostingId: {
          studentProfileId: student.id,
          jobPostingId,
        },
      },
    });
    if (existing) {
      throw new ConflictException('You have already applied to this job');
    }

    return this.prisma.application.create({
      data: {
        studentProfileId: student.id,
        jobPostingId,
      },
      include: {
        jobPosting: { select: { title: true, company: { select: { name: true } } } },
      },
    });
  }

  async findMyApplications(userId: string, query: PaginationDto) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) return { data: [], meta: paginationMeta(0, query.page, query.limit) };

    const where = { studentProfileId: student.id };
    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          jobPosting: {
            select: {
              title: true,
              jobType: true,
              location: true,
              salary: true,
              company: { select: { name: true, logo: true } },
            },
          },
          roundResults: {
            include: { round: { select: { roundType: true, roundNumber: true, title: true } } },
          },
        },
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findByJob(jobPostingId: string, query: PaginationDto & { status?: string }) {
    const where: any = { jobPostingId };
    if (query.status) where.status = query.status;
    if (query.search) {
      where.studentProfile = {
        OR: [
          { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
          { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
          { enrollmentNo: { contains: query.search, mode: 'insensitive' } },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          studentProfile: {
            include: {
              user: { select: { email: true, firstName: true, lastName: true } },
            },
          },
          roundResults: true,
        },
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) throw new NotFoundException('Application not found');

    const allowed = APPLICATION_STATUS_TRANSITIONS[application.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${application.status} to ${dto.status}`,
      );
    }

    return this.prisma.application.update({
      where: { id },
      data: { status: dto.status },
      include: {
        studentProfile: {
          include: { user: { select: { email: true, firstName: true, lastName: true } } },
        },
        jobPosting: { select: { title: true } },
      },
    });
  }

  async bulkUpdateStatus(applicationIds: string[], status: string) {
    return this.prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { status: status as any },
    });
  }
}
