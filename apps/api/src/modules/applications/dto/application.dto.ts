import { IsString, IsEnum } from 'class-validator';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @IsString()
  jobPostingId: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}
