import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { EligibilityService } from './eligibility.service';

@Module({
  controllers: [JobsController],
  providers: [JobsService, EligibilityService],
  exports: [JobsService, EligibilityService],
})
export class JobsModule {}
