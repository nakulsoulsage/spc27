import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EligibilityService } from './eligibility.service';
import {
  CreateOpportunityDto,
  UpdateOpportunityDto,
  OpportunityQueryDto,
} from './dto/opportunity.dto';
import { paginate, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class OpportunitiesService {
  constructor(
    private prisma: PrismaService,
    private eligibilityService: EligibilityService,
  ) {}

  async create(
    tpoUserId: string,
    institutionId: string,
    dto: CreateOpportunityDto,
  ) {
    const { eligibility, rounds, lastDateToApply, ...oppData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const opportunity = await tx.opportunity.create({
        data: {
          ...oppData,
          lastDateToApply: new Date(lastDateToApply),
          institutionId,
          createdByTpoId: tpoUserId,
        },
      });

      if (eligibility) {
        await tx.eligibilityCriteria.create({
          data: {
            opportunityId: opportunity.id,
            minCGPA: eligibility.minCGPA,
            allowedBranches: eligibility.allowedBranches || [],
            maxActiveBacklogs: eligibility.maxActiveBacklogs,
            minTenthPercentage: eligibility.minTenthPercentage,
            minTwelfthPercentage: eligibility.minTwelfthPercentage,
            graduationYear: eligibility.graduationYear,
          },
        });
      }

      if (rounds && rounds.length > 0) {
        await tx.recruitmentRound.createMany({
          data: rounds.map((r: any) => ({
            opportunityId: opportunity.id,
            roundName: r.roundName,
            roundType: r.roundType,
            roundOrder: r.roundOrder,
          })),
        });
      }

      return tx.opportunity.findUnique({
        where: { id: opportunity.id },
        include: {
          eligibility: true,
          rounds: { orderBy: { roundOrder: 'asc' } },
          _count: { select: { applications: true } },
        },
      });
    });
  }

  async findAll(institutionId: string, query: OpportunityQueryDto) {
    const where: any = { institutionId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { companyName: { contains: query.search, mode: 'insensitive' } },
        { roleTitle: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.opportunity.findMany({
        where,
        include: {
          eligibility: true,
          _count: { select: { applications: true } },
        },
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.opportunity.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        eligibility: true,
        rounds: { orderBy: { roundOrder: 'asc' } },
        _count: { select: { applications: true } },
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');
    return opportunity;
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const existing = await this.prisma.opportunity.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Opportunity not found');

    const { eligibility, rounds, lastDateToApply, ...oppData } = dto as any;

    return this.prisma.$transaction(async (tx) => {
      const updateData: any = { ...oppData };
      if (lastDateToApply) {
        updateData.lastDateToApply = new Date(lastDateToApply);
      }

      await tx.opportunity.update({
        where: { id },
        data: updateData,
      });

      if (eligibility) {
        await tx.eligibilityCriteria.upsert({
          where: { opportunityId: id },
          create: {
            opportunityId: id,
            minCGPA: eligibility.minCGPA,
            allowedBranches: eligibility.allowedBranches || [],
            maxActiveBacklogs: eligibility.maxActiveBacklogs,
            minTenthPercentage: eligibility.minTenthPercentage,
            minTwelfthPercentage: eligibility.minTwelfthPercentage,
            graduationYear: eligibility.graduationYear,
          },
          update: {
            minCGPA: eligibility.minCGPA,
            allowedBranches: eligibility.allowedBranches || [],
            maxActiveBacklogs: eligibility.maxActiveBacklogs,
            minTenthPercentage: eligibility.minTenthPercentage,
            minTwelfthPercentage: eligibility.minTwelfthPercentage,
            graduationYear: eligibility.graduationYear,
          },
        });
      }

      if (rounds && rounds.length > 0) {
        await tx.recruitmentRound.deleteMany({
          where: { opportunityId: id },
        });
        await tx.recruitmentRound.createMany({
          data: rounds.map((r: any) => ({
            opportunityId: id,
            roundName: r.roundName,
            roundType: r.roundType,
            roundOrder: r.roundOrder,
          })),
        });
      }

      return tx.opportunity.findUnique({
        where: { id },
        include: {
          eligibility: true,
          rounds: { orderBy: { roundOrder: 'asc' } },
          _count: { select: { applications: true } },
        },
      });
    });
  }

  async close(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async delete(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
    });
    if (!opportunity) throw new NotFoundException('Opportunity not found');

    return this.prisma.opportunity.delete({
      where: { id },
    });
  }

  async findEligibleForStudent(studentId: string) {
    return this.eligibilityService.getEligibleOpportunitiesForStudent(
      studentId,
    );
  }

  async getEligibleStudents(opportunityId: string, institutionId: string) {
    return this.eligibilityService.getEligibleStudentsForOpportunity(
      opportunityId,
      institutionId,
    );
  }
}
