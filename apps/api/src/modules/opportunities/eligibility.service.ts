import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EligibilityService {
  constructor(private prisma: PrismaService) {}

  isStudentEligible(
    student: {
      cgpa?: number | null;
      branch: string;
      activeBacklogs: number;
      tenthPercentage?: number | null;
      twelfthPercentage?: number | null;
      graduationYear: number;
    },
    criteria: {
      minCGPA?: number | null;
      allowedBranches?: any;
      maxActiveBacklogs?: number | null;
      minTenthPercentage?: number | null;
      minTwelfthPercentage?: number | null;
      graduationYear?: number | null;
    },
  ): boolean {
    if (
      criteria.minCGPA != null &&
      (student.cgpa == null || student.cgpa < criteria.minCGPA)
    ) {
      return false;
    }

    if (criteria.allowedBranches != null) {
      const branches: string[] = Array.isArray(criteria.allowedBranches)
        ? criteria.allowedBranches
        : [];
      if (branches.length > 0 && !branches.includes(student.branch)) {
        return false;
      }
    }

    if (
      criteria.maxActiveBacklogs != null &&
      student.activeBacklogs > criteria.maxActiveBacklogs
    ) {
      return false;
    }

    if (
      criteria.minTenthPercentage != null &&
      (student.tenthPercentage == null ||
        student.tenthPercentage < criteria.minTenthPercentage)
    ) {
      return false;
    }

    if (
      criteria.minTwelfthPercentage != null &&
      (student.twelfthPercentage == null ||
        student.twelfthPercentage < criteria.minTwelfthPercentage)
    ) {
      return false;
    }

    if (
      criteria.graduationYear != null &&
      student.graduationYear !== criteria.graduationYear
    ) {
      return false;
    }

    return true;
  }

  async getEligibleOpportunitiesForStudent(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) return [];

    const opportunities = await this.prisma.opportunity.findMany({
      where: {
        institutionId: student.institutionId,
        status: 'OPEN',
        lastDateToApply: { gte: new Date() },
      },
      include: {
        eligibility: true,
        _count: { select: { applications: true } },
        rounds: { orderBy: { roundOrder: 'asc' } },
      },
    });

    return opportunities.filter((opp) => {
      if (!opp.eligibility) return true;
      return this.isStudentEligible(student, opp.eligibility);
    });
  }

  async getEligibleStudentsForOpportunity(
    opportunityId: string,
    institutionId: string,
  ) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { eligibility: true },
    });

    if (!opportunity) return [];

    const students = await this.prisma.studentProfile.findMany({
      where: {
        institutionId,
        isProfileComplete: true,
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!opportunity.eligibility) return students;

    return students.filter((student) =>
      this.isStudentEligible(student, opportunity.eligibility!),
    );
  }
}
