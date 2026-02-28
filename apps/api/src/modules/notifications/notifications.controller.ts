import { Controller, Get, Patch, Param, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { CurrentUser } from '../../common/decorators';

@Controller('notifications')
export class NotificationsController {
  constructor(private service: NotificationsService) {}

  @Get()
  findAll(
    @CurrentUser('sub') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.service.findAll(userId, query);
  }

  @Patch(':id/read')
  markAsRead(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.service.markAsRead(id, userId);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser('sub') userId: string) {
    return this.service.markAllAsRead(userId);
  }
}
