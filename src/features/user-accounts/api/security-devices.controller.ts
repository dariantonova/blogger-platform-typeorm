import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../guards/refresh-token/jwt-refresh-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request';
import { DeviceAuthSessionContextDto } from '../guards/dto/device-auth-session-context.dto';
import { DeviceViewDto } from './view-dto/device.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserDeviceSessionsQuery } from '../application/queries/get-user-device-sessions.query';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(private queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  async getUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<DeviceViewDto[]> {
    return this.queryBus.execute(new GetUserDeviceSessionsQuery(user.userId));
  }
}
