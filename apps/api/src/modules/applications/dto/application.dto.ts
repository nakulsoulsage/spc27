import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsInt,
  IsDateString,
} from 'class-validator';
import { ApplicationStatus } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateApplicationDto {
  @IsString()
  opportunityId: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsInt()
  currentRound?: number;
}

export class BulkUpdateStatusDto {
  @IsArray()
  @IsString({ each: true })
  applicationIds: string[];

  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class CreateOfferDto {
  @IsString()
  applicationId: string;

  @IsOptional()
  @IsString()
  ctc?: string;

  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @IsOptional()
  @IsString()
  offerLetterUrl?: string;
}

export class ApplicationQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;
}
