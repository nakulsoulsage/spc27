import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('notifications')
export class NotificationProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    const { userId, title, message, type, linkUrl } = job.data;

    await this.prisma.notification.create({
      data: { userId, title, message, type, linkUrl },
    });

    // Future: Add email/push notification dispatch here
    console.log(`Notification sent to ${userId}: ${title}`);
  }
}
