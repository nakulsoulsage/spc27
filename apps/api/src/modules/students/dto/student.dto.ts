import {
  IsString,
  IsOptional,
  IsNumber,
  IsInt,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { Gender, Category } from '@prisma/client';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class CreateStudentProfileDto {
  @IsString()
  enrollmentNo: string;

  @IsString()
  course: string;

  @IsString()
  branch: string;

  @IsInt()
  graduationYear: number;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  alternatePhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  tenthBoard?: string;

  @IsOptional()
  @IsInt()
  tenthYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  tenthPercentage?: number;

  @IsOptional()
  @IsString()
  twelfthBoard?: string;

  @IsOptional()
  @IsInt()
  twelfthYear?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  twelfthPercentage?: number;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsInt()
  semester?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  activeBacklogs?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  backlogHistory?: number;

  @IsOptional()
  skills?: any;

  @IsOptional()
  certifications?: any;

  @IsOptional()
  internships?: any;

  @IsOptional()
  projects?: any;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  photoUrl?: string;

  @IsOptional()
  @IsString()
  tenthMarksheetUrl?: string;

  @IsOptional()
  @IsString()
  twelfthMarksheetUrl?: string;

  @IsOptional()
  @IsString()
  graduationMarksheetUrl?: string;
}

export class UpdateStudentProfileDto extends PartialType(CreateStudentProfileDto) {}

export class BulkUploadResultDto {
  total: number;
  created: number;
  failed: number;
  errors: { row: number; message: string }[];
}

export class StudentQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  graduationYear?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPlaced?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isProfileComplete?: boolean;
}
