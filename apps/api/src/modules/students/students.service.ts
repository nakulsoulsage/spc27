import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStudentProfileDto, UpdateStudentProfileDto } from './dto/student.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async createProfile(userId: string, institutionId: string, dto: CreateStudentProfileDto) {
    const existing = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      throw new BadRequestException('Student profile already exists');
    }

    const profile = await this.prisma.studentProfile.create({
      data: {
        userId,
        institutionId,
        ...dto,
        isProfileComplete: this.checkProfileComplete(dto),
      },
      include: { user: { select: { email: true, firstName: true, lastName: true } } },
    });

    return profile;
  }

  async getMyProfile(userId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, avatar: true } },
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

    const updatedData = { ...dto };
    const merged = { ...profile, ...updatedData };
    const isComplete = this.checkProfileComplete(merged);

    return this.prisma.studentProfile.update({
      where: { userId },
      data: { ...updatedData, isProfileComplete: isComplete },
      include: {
        user: { select: { email: true, firstName: true, lastName: true, avatar: true } },
      },
    });
  }

  async findAll(institutionId: string, query: PaginationDto & { branch?: string }) {
    const where: any = { institutionId };
    if (query.search) {
      where.OR = [
        { enrollmentNo: { contains: query.search, mode: 'insensitive' } },
        { user: { firstName: { contains: query.search, mode: 'insensitive' } } },
        { user: { lastName: { contains: query.search, mode: 'insensitive' } } },
      ];
    }
    if (query.branch) {
      where.branch = query.branch;
    }

    const [data, total] = await Promise.all([
      this.prisma.studentProfile.findMany({
        where,
        include: {
          user: { select: { email: true, firstName: true, lastName: true, avatar: true } },
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
        user: { select: { email: true, firstName: true, lastName: true, avatar: true } },
        applications: { include: { jobPosting: { select: { title: true, company: { select: { name: true } } } } } },
      },
    });
    if (!profile) throw new NotFoundException('Student profile not found');
    return profile;
  }

  private checkProfileComplete(data: any): boolean {
    return !!(
      data.enrollmentNo &&
      data.course &&
      data.branch &&
      data.cgpa &&
      data.graduationYear &&
      data.resumeUrl
    );
  }
}
