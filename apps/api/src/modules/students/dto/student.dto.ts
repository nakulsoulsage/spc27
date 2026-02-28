import { IsString, IsOptional, IsNumber, IsArray, IsInt, Min, Max } from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsString()
  enrollmentNo?: string;

  @IsOptional()
  @IsString()
  course?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsInt()
  semester?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cgpa?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage10th?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage12th?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  backlogs?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @IsOptional()
  @IsString()
  achievements?: string;

  @IsOptional()
  @IsString()
  resumeUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsInt()
  graduationYear?: number;
}

export class CreateStudentProfileDto extends UpdateStudentProfileDto {
  @IsString()
  enrollmentNo: string;

  @IsString()
  course: string;

  @IsString()
  branch: string;

  @IsInt()
  graduationYear: number;
}
