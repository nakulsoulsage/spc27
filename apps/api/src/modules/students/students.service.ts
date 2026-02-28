import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
  StudentQueryDto,
  BulkUploadResultDto,
} from './dto/student.dto';
import { paginate, paginationMeta } from '../../common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(
    userId: string,
    institutionId: string,
    dto: CreateStudentProfileDto,
  ) {
    const existing = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Student profile already exists');
    }

    const data: any = {
      userId,
      institutionId,
      ...dto,
    };

    if (dto.dob) {
      data.dob = new Date(dto.dob);
    }

    data.isProfileComplete = this.checkProfileComplete(data);

    const profile = await this.prisma.studentProfile.create({
      data,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
      },
    });

    return profile;
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async updateMyProfile(userId: string, dto: UpdateStudentProfileDto) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Student profile not found');

    if (profile.isProfileLocked) {
      throw new ForbiddenException(
        'Your profile is locked. Contact your TPO to unlock.',
      );
    }

    const updateData: any = { ...dto };
    if ((dto as any).dob) {
      updateData.dob = new Date((dto as any).dob);
    }

    const merged = { ...profile, ...updateData };
    updateData.isProfileComplete = this.checkProfileComplete(merged);

    return this.prisma.studentProfile.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(institutionId: string, query: StudentQueryDto) {
    const where: any = { institutionId };

    if (query.search) {
      where.OR = [
        { enrollmentNo: { contains: query.search, mode: 'insensitive' } },
        { fullName: { contains: query.search, mode: 'insensitive' } },
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
      ];
    }

    if (query.branch) {
      where.branch = query.branch;
    }

    if (query.graduationYear) {
      where.graduationYear = query.graduationYear;
    }

    if (query.isPlaced !== undefined) {
      where.isPlaced = query.isPlaced;
    }

    if (query.isProfileComplete !== undefined) {
      where.isProfileComplete = query.isProfileComplete;
    }

    const [data, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        where,
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studentProfile.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        applications: {
          include: {
            opportunity: {
              select: { companyName: true, roleTitle: true, type: true },
            },
          },
        },
      },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  async adminUpdate(id: string, dto: UpdateStudentProfileDto) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Student profile not found');

    const updateData: any = { ...dto };
    if ((dto as any).dob) {
      updateData.dob = new Date((dto as any).dob);
    }

    const merged = { ...profile, ...updateData };
    updateData.isProfileComplete = this.checkProfileComplete(merged);

    return this.prisma.studentProfile.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true },
        },
      },
    });
  }

  async lockProfile(id: string, locked: boolean) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Student profile not found');

    return this.prisma.studentProfile.update({
      where: { id },
      data: { isProfileLocked: locked },
    });
  }

  async bulkUpload(
    institutionId: string,
    records: any[],
  ): Promise<BulkUploadResultDto> {
    const result: BulkUploadResultDto = {
      total: records.length,
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      try {
        if (!record.email || !record.firstName || !record.lastName) {
          throw new Error(
            'Missing required fields: email, firstName, lastName',
          );
        }

        if (!record.enrollmentNo || !record.course || !record.branch || !record.graduationYear) {
          throw new Error(
            'Missing required fields: enrollmentNo, course, branch, graduationYear',
          );
        }

        const hashedPassword = await bcrypt.hash(
          record.password || record.enrollmentNo,
          10,
        );

        await this.prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              email: record.email,
              password: hashedPassword,
              firstName: record.firstName,
              lastName: record.lastName,
              role: 'STUDENT',
              institutionId,
              isApproved: true,
              isActive: true,
            },
          });

          const profileData: any = {
            userId: user.id,
            institutionId,
            enrollmentNo: record.enrollmentNo,
            course: record.course,
            branch: record.branch,
            graduationYear: parseInt(record.graduationYear, 10),
          };

          if (record.fullName) profileData.fullName = record.fullName;
          if (record.phone) profileData.phone = record.phone;
          if (record.personalEmail)
            profileData.personalEmail = record.personalEmail;
          if (record.cgpa) profileData.cgpa = parseFloat(record.cgpa);
          if (record.tenthPercentage)
            profileData.tenthPercentage = parseFloat(record.tenthPercentage);
          if (record.twelfthPercentage)
            profileData.twelfthPercentage = parseFloat(
              record.twelfthPercentage,
            );
          if (record.semester)
            profileData.semester = parseInt(record.semester, 10);

          profileData.isProfileComplete =
            this.checkProfileComplete(profileData);

          await tx.studentProfile.create({ data: profileData });
        });

        result.created++;
      } catch (error: any) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          message: error.message || 'Unknown error',
        });
      }
    }

    return result;
  }

  async getStats(institutionId: string) {
    const total = await this.prisma.studentProfile.count({
      where: { institutionId },
    });

    const placed = await this.prisma.studentProfile.count({
      where: { institutionId, isPlaced: true },
    });

    const placementPercentage = total > 0 ? Math.round((placed / total) * 100 * 100) / 100 : 0;

    const placedStudents = await this.prisma.studentProfile.findMany({
      where: { institutionId, isPlaced: true, placedCTC: { not: null } },
      select: { placedCTC: true },
    });

    let avgCTC = 0;
    if (placedStudents.length > 0) {
      const totalCTC = placedStudents.reduce((sum, s) => {
        const ctc = parseFloat(s.placedCTC || '0');
        return sum + (isNaN(ctc) ? 0 : ctc);
      }, 0);
      avgCTC = Math.round((totalCTC / placedStudents.length) * 100) / 100;
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

    const branchWiseMap = branchWise.map((b) => {
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

    const companyWiseData = companyWise.map((c) => ({
      company: c.placedCompany,
      count: c._count.id,
    }));

    return {
      total,
      placed,
      placementPercentage,
      avgCTC,
      branchWise: branchWiseMap,
      companyWise: companyWiseData,
    };
  }

  private checkProfileComplete(data: any): boolean {
    return !!(
      data.enrollmentNo &&
      data.course &&
      data.branch &&
      data.graduationYear &&
      data.cgpa &&
      data.tenthPercentage &&
      data.twelfthPercentage &&
      data.resumeUrl
    );
  }
}
