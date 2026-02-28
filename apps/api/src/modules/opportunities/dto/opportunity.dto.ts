import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsInt,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { OpportunityType, OpportunityStatus, RoundType } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class EligibilityCriteriaDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  minCGPA?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedBranches?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  maxActiveBacklogs?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTenthPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minTwelfthPercentage?: number;

  @IsOptional()
  @IsInt()
  graduationYear?: number;
}

export class RecruitmentRoundDto {
  @IsString()
  roundName: string;

  @IsEnum(RoundType)
  roundType: RoundType;

  @IsInt()
  @Min(1)
  roundOrder: number;
}

export class CreateOpportunityDto {
  @IsString()
  companyName: string;

  @IsString()
  roleTitle: string;

  @IsEnum(OpportunityType)
  type: OpportunityType;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  ctc?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  lastDateToApply: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EligibilityCriteriaDto)
  eligibility?: EligibilityCriteriaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecruitmentRoundDto)
  rounds?: RecruitmentRoundDto[];
}

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {}

export class OpportunityQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(OpportunityStatus)
  status?: OpportunityStatus;

  @IsOptional()
  @IsEnum(OpportunityType)
  type?: OpportunityType;
}
