import { IsString, IsOptional, IsEnum, IsDateString, IsObject, IsNumber, IsArray, Min, Max, IsInt } from 'class-validator';
import { JobType, JobStatus } from '@prisma/client';

export class EligibilityCriteriaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  minCgpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxBacklogs?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  branches?: string[];

  @IsOptional()
  @IsNumber()
  minPercentage10th?: number;

  @IsOptional()
  @IsNumber()
  minPercentage12th?: number;
}

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(JobType)
  jobType: JobType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsString()
  companyId: string;

  @IsOptional()
  @IsObject()
  eligibilityCriteria?: EligibilityCriteriaDto;
}

export class UpdateJobDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsObject()
  eligibilityCriteria?: EligibilityCriteriaDto;
}

export class JobFilterDto {
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsString()
  companyId?: string;
}
