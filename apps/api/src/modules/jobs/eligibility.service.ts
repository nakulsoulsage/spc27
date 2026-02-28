import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface EligibilityCriteria {
  minCgpa?: number;
  maxBacklogs?: number;
  branches?: string[];
  minPercentage10th?: number;
  minPercentage12th?: number;
}

@Injectable()
export class EligibilityService {
  constructor(private prisma: PrismaService) {}

  isStudentEligible(
    student: {
      cgpa: number | null;
      backlogs: number;
      branch: string;
      percentage10th: number | null;
      percentage12th: number | null;
    },
    criteria: EligibilityCriteria,
  ): boolean {
    if (criteria.minCgpa && (student.cgpa === null || student.cgpa < criteria.minCgpa)) {
      return false;
    }
    if (criteria.maxBacklogs !== undefined && student.backlogs > criteria.maxBacklogs) {
      return false;
    }
    if (criteria.branches && criteria.branches.length > 0 && !criteria.branches.includes(student.branch)) {
      return false;
    }
    if (criteria.minPercentage10th && (student.percentage10th === null || student.percentage10th < criteria.minPercentage10th)) {
      return false;
    }
    if (criteria.minPercentage12th && (student.percentage12th === null || student.percentage12th < criteria.minPercentage12th)) {
      return false;
    }
    return true;
  }

  async getEligibleJobsForStudent(userId: string, institutionId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!student) return [];

    const openJobs = await this.prisma.jobPosting.findMany({
      where: {
        institutionId,
        status: 'OPEN',
      },
      include: {
        company: { select: { name: true, logo: true, industry: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return openJobs.filter((job) => {
      const criteria = job.eligibilityCriteria as EligibilityCriteria | null;
      if (!criteria) return true;
      return this.isStudentEligible(student, criteria);
    });
  }

  async getEligibleStudentsForJob(jobId: string) {
    const job = await this.prisma.jobPosting.findUnique({
      where: { id: jobId },
    });
    if (!job) return [];

    const criteria = job.eligibilityCriteria as EligibilityCriteria | null;
    if (!criteria) {
      return this.prisma.studentProfile.findMany({
        where: { institutionId: job.institutionId, isProfileComplete: true },
        include: { user: { select: { email: true, firstName: true, lastName: true } } },
      });
    }

    const students = await this.prisma.studentProfile.findMany({
      where: { institutionId: job.institutionId, isProfileComplete: true },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });

    return students.filter((s) => this.isStudentEligible(s, criteria));
  }
}
