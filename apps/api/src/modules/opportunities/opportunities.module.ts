import { Module } from '@nestjs/common';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesController } from './opportunities.controller';
import { EligibilityService } from './eligibility.service';

@Module({
  controllers: [OpportunitiesController],
  providers: [OpportunitiesService, EligibilityService],
  exports: [EligibilityService],
})
export class OpportunitiesModule {}
