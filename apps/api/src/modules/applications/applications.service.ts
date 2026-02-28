import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EligibilityService } from '../opportunities/eligibility.service';
import {
  UpdateApplicationStatusDto,
  CreateOfferDto,
  ApplicationQueryDto,
} from './dto/application.dto';
import { paginate, paginationMeta } from '../../common/dto/pagination.dto';
import { ApplicationStatus } from '@prisma/client';

const APPLICATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  APPLIED: ['SHORTLISTED', 'REJECTED'],
  SHORTLISTED: ['ROUND1', 'REJECTED'],
  ROUND1: ['ROUND2', 'OFFERED', 'REJECTED'],
  ROUND2: ['OFFERED', 'REJECTED'],
  OFFERED: [],
  REJECTED: [],
};

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private eligibility: EligibilityService,
  ) {}

  async apply(userId: string, dto: { opportunityId: string }) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      throw new BadRequestException('Complete your student profile first');
    }
    if (!student.isProfileComplete) {
      throw new BadRequestException('Complete your profile before applying');
    }
    if (!student.resumeUrl) {
      throw new BadRequestException('Upload your resume before applying');
    }

    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: dto.opportunityId },
      include: { eligibility: true },
    });
    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }
    if (opportunity.status !== 'OPEN') {
      throw new BadRequestException(
        'This opportunity is no longer accepting applications',
      );
    }

    if (new Date(opportunity.lastDateToApply) < new Date()) {
      throw new BadRequestException('Application deadline has passed');
    }

    if (
      opportunity.eligibility &&
      !this.eligibility.isStudentEligible(student, opportunity.eligibility)
    ) {
      throw new BadRequestException(
        'You do not meet the eligibility criteria',
      );
    }

    const existing = await this.prisma.application.findUnique({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId: dto.opportunityId,
        },
      },
    });
    if (existing) {
      throw new ConflictException(
        'You have already applied to this opportunity',
      );
    }

    return this.prisma.application.create({
      data: {
        studentId: student.id,
        opportunityId: dto.opportunityId,
      },
      include: {
        opportunity: {
          select: { companyName: true, roleTitle: true, type: true },
        },
      },
    });
  }

  async findMyApplications(userId: string, query: ApplicationQueryDto) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) {
      return { data: [], meta: paginationMeta(0, query.page, query.limit) };
    }

    const where: any = { studentId: student.id };
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          opportunity: {
            select: {
              companyName: true,
              roleTitle: true,
              type: true,
              location: true,
              ctc: true,
              status: true,
              lastDateToApply: true,
            },
          },
        },
        ...paginate(query.page, query.limit),
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findByOpportunity(
    opportunityId: string,
    query: ApplicationQueryDto,
  ) {
    const where: any = { opportunityId };
    if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.studentProfile = {
        OR: [
          {
            user: {
              firstName: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            user: {
              lastName: { contains: query.search, mode: 'insensitive' },
            },
          },
          {
            enrollmentNo: { contains: query.search, mode: 'insensitive' },
          },
        ],
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          studentProfile: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        ...paginate(query.page, query.limit),
        orderBy: { appliedAt: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async updateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.findUnique({
      where: { id },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const allowed = APPLICATION_STATUS_TRANSITIONS[application.status];
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${application.status} to ${dto.status}`,
      );
    }

    if (dto.status === ApplicationStatus.OFFERED) {
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.application.update({
          where: { id },
          data: {
            status: dto.status,
            currentRound: dto.currentRound,
          },
          include: {
            studentProfile: {
              include: {
                user: {
                  select: { email: true, firstName: true, lastName: true },
                },
              },
            },
            opportunity: {
              select: { companyName: true, roleTitle: true, ctc: true },
            },
          },
        });

        await tx.studentProfile.update({
          where: { id: application.studentId },
          data: {
            isPlaced: true,
            placedCompany: updated.opportunity.companyName,
            placedRole: updated.opportunity.roleTitle,
            placedCTC: updated.opportunity.ctc,
            placementType: 'ON_CAMPUS',
          },
        });

        return updated;
      });
    }

    return this.prisma.application.update({
      where: { id },
      data: {
        status: dto.status,
        currentRound: dto.currentRound,
      },
      include: {
        studentProfile: {
          include: {
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
          },
        },
        opportunity: { select: { companyName: true, roleTitle: true } },
      },
    });
  }

  async bulkUpdateStatus(applicationIds: string[], status: ApplicationStatus) {
    return this.prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { status },
    });
  }

  async createOffer(dto: CreateOfferDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: dto.applicationId },
      include: {
        opportunity: true,
      },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: dto.applicationId },
        data: { status: ApplicationStatus.OFFERED },
        include: {
          studentProfile: {
            include: {
              user: {
                select: { email: true, firstName: true, lastName: true },
              },
            },
          },
          opportunity: {
            select: { companyName: true, roleTitle: true, ctc: true },
          },
        },
      });

      await tx.studentProfile.update({
        where: { id: application.studentId },
        data: {
          isPlaced: true,
          placedCompany: application.opportunity.companyName,
          placedRole: application.opportunity.roleTitle,
          placedCTC: dto.ctc || application.opportunity.ctc,
          placementType: 'ON_CAMPUS',
          offerLetterUrl: dto.offerLetterUrl,
        },
      });

      return updated;
    });
  }
}
