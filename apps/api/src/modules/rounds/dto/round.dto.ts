import { IsString, IsOptional, IsEnum, IsDateString, IsInt, IsBoolean, IsNumber, Min } from 'class-validator';
import { RoundType } from '@prisma/client';

export class CreateRoundDto {
  @IsString()
  jobPostingId: string;

  @IsEnum(RoundType)
  roundType: RoundType;

  @IsInt()
  @Min(1)
  roundNumber: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class UpdateRoundDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  meetingLink?: string;
}

export class SubmitRoundResultDto {
  @IsString()
  applicationId: string;

  @IsString()
  roundId: string;

  @IsOptional()
  @IsBoolean()
  passed?: boolean;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
