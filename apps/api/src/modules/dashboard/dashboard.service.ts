import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats(institutionId: string) {
    const totalStudents = await this.prisma.studentProfile.count({
      where: { institutionId },
    });

    const placedStudents = await this.prisma.studentProfile.count({
      where: { institutionId, isPlaced: true },
    });

    const placementPercentage =
      totalStudents > 0
        ? Math.round((placedStudents / totalStudents) * 100 * 100) / 100
        : 0;

    const placedWithCTC = await this.prisma.studentProfile.findMany({
      where: { institutionId, isPlaced: true, placedCTC: { not: null } },
      select: { placedCTC: true },
    });

    let avgCTC = 0;
    if (placedWithCTC.length > 0) {
      const totalCTC = placedWithCTC.reduce((sum, s) => {
        const ctc = parseFloat(s.placedCTC || '0');
        return sum + (isNaN(ctc) ? 0 : ctc);
      }, 0);
      avgCTC = Math.round((totalCTC / placedWithCTC.length) * 100) / 100;
    }

    const branchWise = await this.prisma.studentProfile.groupBy({
      by: ['branch'],
      where: { institutionId },
      _count: { id: true },
    });

    const branchWisePlaced = await this.prisma.studentProfile.groupBy({
      by: ['branch'],
      where: { institutionId, isPlaced: true },
      _count: { id: true },
    });

    const branchWisePlacements = branchWise.map((b) => {
      const placedInBranch =
        branchWisePlaced.find((bp) => bp.branch === b.branch)?._count.id || 0;
      return {
        branch: b.branch,
        total: b._count.id,
        placed: placedInBranch,
        percentage:
          b._count.id > 0
            ? Math.round((placedInBranch / b._count.id) * 100 * 100) / 100
            : 0,
      };
    });

    const companyWise = await this.prisma.studentProfile.groupBy({
      by: ['placedCompany'],
      where: { institutionId, isPlaced: true, placedCompany: { not: null } },
      _count: { id: true },
    });

    const companyWisePlacements = companyWise.map((c) => ({
      company: c.placedCompany,
      count: c._count.id,
    }));

    const activeOpportunities = await this.prisma.opportunity.count({
      where: { institutionId, status: 'OPEN' },
    });

    const upcomingInterviews = await this.prisma.interviewSchedule.count({
      where: {
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
        round: {
          opportunity: { institutionId },
        },
      },
    });

    return {
      totalStudents,
      totalPlaced: placedStudents,
      placementPercentage,
      avgCTC,
      branchWise: branchWisePlacements.map((b) => ({
        branch: b.branch,
        count: b.total,
        placed: b.placed,
        percentage: b.percentage,
      })),
      companyWise: companyWisePlacements,
      activeOpportunities,
      upcomingInterviews,
    };
  }

  async getStudentStats(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        applications: {
          include: {
            opportunity: {
              select: { companyName: true, roleTitle: true, ctc: true },
            },
          },
        },
      },
    });

    if (!profile) {
      return {
        profileCompletion: 0,
        eligibleDrives: 0,
        appliedCount: 0,
        interviewSchedule: [],
        offerStatus: null,
        announcementsCount: 0,
      };
    }

    // Profile completion percentage
    const requiredFields = [
      'enrollmentNo',
      'course',
      'branch',
      'graduationYear',
      'cgpa',
      'tenthPercentage',
      'twelfthPercentage',
      'resumeUrl',
      'fullName',
      'phone',
      'personalEmail',
      'gender',
      'dob',
    ];
    const filledFields = requiredFields.filter(
      (f) => (profile as any)[f] != null && (profile as any)[f] !== '',
    );
    const profileCompletion = Math.round(
      (filledFields.length / requiredFields.length) * 100,
    );

    // Eligible drives
    const openOpportunities = await this.prisma.opportunity.findMany({
      where: {
        institutionId: profile.institutionId,
        status: 'OPEN',
        lastDateToApply: { gte: new Date() },
      },
      include: { eligibility: true },
    });

    const eligibleDrives = openOpportunities.filter((opp) => {
      if (!opp.eligibility) return true;
      return this.isEligible(profile, opp.eligibility);
    }).length;

    // Applied count
    const appliedCount = profile.applications.length;

    // Interview schedule
    const interviewSchedule = await this.prisma.interviewSchedule.findMany({
      where: {
        studentId: profile.id,
        status: 'SCHEDULED',
        scheduledAt: { gte: new Date() },
      },
      include: {
        round: {
          include: {
            opportunity: {
              select: { companyName: true, roleTitle: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    // Offer status
    const offers = profile.applications.filter(
      (app) => app.status === 'OFFERED',
    );
    const offerStatus =
      offers.length > 0
        ? {
            isPlaced: profile.isPlaced,
            company: profile.placedCompany,
            role: profile.placedRole,
            ctc: profile.placedCTC,
            offers: offers.map((o) => ({
              company: o.opportunity.companyName,
              role: o.opportunity.roleTitle,
              ctc: o.opportunity.ctc,
            })),
          }
        : null;

    // Recent announcements
    const announcements = await this.prisma.announcement.findMany({
      where: {
        institutionId: profile.institutionId,
        visibleTo: { in: ['ALL', 'STUDENTS'] },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 5,
      select: {
        id: true,
        title: true,
        description: true,
        isPinned: true,
        createdAt: true,
      },
    });

    return {
      profileCompletion,
      eligibleDrives,
      appliedDrives: appliedCount,
      interviews: interviewSchedule.map((i) => ({
        companyName: i.round.opportunity.companyName,
        roleTitle: i.round.opportunity.roleTitle,
        round: i.round.roundName,
        scheduledAt: i.scheduledAt,
        status: i.status,
      })),
      offerStatus: offerStatus
        ? `Placed at ${offerStatus.company || 'Company'}`
        : null,
      announcements,
    };
  }

  private isEligible(student: any, criteria: any): boolean {
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
}
