import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto, paginate, paginationMeta } from '../../common/dto/pagination.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async send(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
  }) {
    await this.notificationQueue.add('send-notification', data);
  }

  async sendDirect(data: {
    userId: string;
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
  }) {
    return this.prisma.notification.create({ data });
  }

  async findAll(userId: string, query: PaginationDto) {
    const where = { userId };

    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        ...paginate(query.page, query.limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data,
      meta: { ...paginationMeta(total, query.page, query.limit), unreadCount },
    };
  }

  async markAsRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
