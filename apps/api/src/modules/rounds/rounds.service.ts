import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoundDto, UpdateRoundDto, SubmitRoundResultDto } from './dto/round.dto';

@Injectable()
export class RoundsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRoundDto) {
    return this.prisma.recruitmentRound.create({
      data: {
        jobPostingId: dto.jobPostingId,
        roundType: dto.roundType,
        roundNumber: dto.roundNumber,
        title: dto.title,
        description: dto.description,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        meetingLink: dto.meetingLink,
      },
    });
  }

  async findByJob(jobPostingId: string) {
    return this.prisma.recruitmentRound.findMany({
      where: { jobPostingId },
      include: {
        _count: { select: { roundResults: true } },
      },
      orderBy: { roundNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const round = await this.prisma.recruitmentRound.findUnique({
      where: { id },
      include: {
        roundResults: {
          include: {
            application: {
              include: {
                studentProfile: {
                  include: { user: { select: { email: true, firstName: true, lastName: true } } },
                },
              },
            },
          },
        },
      },
    });
    if (!round) throw new NotFoundException('Round not found');
    return round;
  }

  async update(id: string, dto: UpdateRoundDto) {
    await this.findOne(id);
    return this.prisma.recruitmentRound.update({
      where: { id },
      data: {
        ...dto,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      },
    });
  }

  async submitResult(dto: SubmitRoundResultDto) {
    return this.prisma.roundResult.upsert({
      where: {
        applicationId_roundId: {
          applicationId: dto.applicationId,
          roundId: dto.roundId,
        },
      },
      create: {
        applicationId: dto.applicationId,
        roundId: dto.roundId,
        passed: dto.passed,
        score: dto.score,
        remarks: dto.remarks,
      },
      update: {
        passed: dto.passed,
        score: dto.score,
        remarks: dto.remarks,
      },
      include: {
        application: {
          include: {
            studentProfile: {
              include: { user: { select: { firstName: true, lastName: true } } },
            },
          },
        },
        round: { select: { roundType: true, title: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.recruitmentRound.delete({ where: { id } });
  }
}
