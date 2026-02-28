import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { Role } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { StudentsService } from './students.service';
import {
  CreateStudentProfileDto,
  UpdateStudentProfileDto,
  StudentQueryDto,
} from './dto/student.dto';
import { CurrentUser, Roles } from '../../common/decorators';
import { RolesGuard } from '../../common/guards';

const resumeStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'resumes'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `resume-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const documentStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'documents'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `doc-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

const csvStorage = diskStorage({
  destination: join(process.cwd(), 'uploads', 'temp'),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `csv-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('students')
@UseGuards(RolesGuard)
export class StudentsController {
  constructor(private service: StudentsService) {}

  @Post('profile')
  @Roles(Role.STUDENT)
  createProfile(
    @CurrentUser('sub') userId: string,
    @CurrentUser('institutionId') institutionId: string,
    @Body() dto: CreateStudentProfileDto,
  ) {
    return this.service.createProfile(userId, institutionId, dto);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  getMyProfile(@CurrentUser('sub') userId: string) {
    return this.service.getMyProfile(userId);
  }

  @Patch('me')
  @Roles(Role.STUDENT)
  updateMyProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateStudentProfileDto,
  ) {
    return this.service.updateMyProfile(userId, dto);
  }

  @Get('stats')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  getStats(@CurrentUser('institutionId') institutionId: string) {
    return this.service.getStats(institutionId);
  }

  @Get()
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findAll(
    @CurrentUser('institutionId') institutionId: string,
    @Query() query: StudentQueryDto,
  ) {
    return this.service.findAll(institutionId, query);
  }

  @Get(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  adminUpdate(@Param('id') id: string, @Body() dto: UpdateStudentProfileDto) {
    return this.service.adminUpdate(id, dto);
  }

  @Patch(':id/lock')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  lockProfile(
    @Param('id') id: string,
    @Body('locked') locked: boolean,
  ) {
    return this.service.lockProfile(id, locked);
  }

  @Post('bulk-upload')
  @Roles(Role.TPO, Role.SUPER_ADMIN)
  @UseInterceptors(FileInterceptor('file', { storage: csvStorage }))
  async bulkUpload(
    @CurrentUser('institutionId') institutionId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }

    const csvContent = readFileSync(file.path, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    return this.service.bulkUpload(institutionId, records);
  }

  @Post('upload-resume')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file', { storage: resumeStorage }))
  async uploadResume(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Resume file is required');
    }

    const resumeUrl = `/uploads/resumes/${file.filename}`;
    await this.service.updateMyProfile(userId, { resumeUrl });

    return { resumeUrl, message: 'Resume uploaded successfully' };
  }

  @Post('upload-document')
  @Roles(Role.STUDENT)
  @UseInterceptors(FileInterceptor('file', { storage: documentStorage }))
  async uploadDocument(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('Document file is required');
    }

    const validTypes = ['photo', 'tenth', 'twelfth', 'graduation'];
    if (!type || !validTypes.includes(type)) {
      throw new BadRequestException(
        `Invalid document type. Must be one of: ${validTypes.join(', ')}`,
      );
    }

    const documentUrl = `/uploads/documents/${file.filename}`;

    const updateData: any = {};
    switch (type) {
      case 'photo':
        updateData.photoUrl = documentUrl;
        break;
      case 'tenth':
        updateData.tenthMarksheetUrl = documentUrl;
        break;
      case 'twelfth':
        updateData.twelfthMarksheetUrl = documentUrl;
        break;
      case 'graduation':
        updateData.graduationMarksheetUrl = documentUrl;
        break;
    }

    await this.service.updateMyProfile(userId, updateData);

    return { documentUrl, type, message: 'Document uploaded successfully' };
  }
}
