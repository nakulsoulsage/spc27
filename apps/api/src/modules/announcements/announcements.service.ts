import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
} from './dto/announcement.dto';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@Injectable()
export class AnnouncementsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    institutionId: string,
    dto: CreateAnnouncementDto,
  ) {
    return this.prisma.announcement.create({
      data: {
        ...dto,
        institutionId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findAll(
    institutionId: string,
    userRole: Role,
    query: PaginationDto,
  ) {
    const where: any = { institutionId };

    if (userRole === Role.STUDENT) {
      where.visibleTo = { in: ['ALL', 'STUDENTS'] };
    } else if (userRole === Role.TPO || userRole === Role.SUPER_ADMIN) {
      // Admins can see all announcements
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.announcement.findMany({
        where,
        include: {
          createdBy: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
        ...paginate(query.page, query.limit),
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.announcement.count({ where }),
    ]);

    return { data, meta: paginationMeta(total, query.page, query.limit) };
  }

  async findOne(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');
    return announcement;
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    return this.prisma.announcement.update({
      where: { id },
      data: dto,
      include: {
        createdBy: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async delete(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    return this.prisma.announcement.delete({ where: { id } });
  }

  async togglePin(id: string) {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('Announcement not found');

    return this.prisma.announcement.update({
      where: { id },
      data: { isPinned: !announcement.isPinned },
    });
  }
}
