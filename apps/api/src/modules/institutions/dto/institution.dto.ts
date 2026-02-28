import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateInstitutionDto {
  @IsString()
  name: string;

  @IsString()
  domain: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}

export class UpdateInstitutionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
