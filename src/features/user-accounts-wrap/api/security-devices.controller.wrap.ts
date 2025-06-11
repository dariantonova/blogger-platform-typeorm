import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuardWrap } from '../guards/refresh-token/jwt-refresh-auth.guard.wrap';
import { GetUserDeviceSessionsQueryWrap } from '../application/queries/get-user-device-sessions.query.wrap';
import { TerminateDeviceSessionCommandWrap } from '../application/usecases/terminate-device-session.usecase.wrap';
import { TerminateAllOtherUserDeviceSessionsCommandWrap } from '../application/usecases/terminate-all-other-device-sessions.usecase.wrap';
import { DeviceAuthSessionContextDto } from '../../user-accounts/guards/dto/device-auth-session-context.dto';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request';
import { DeviceViewDto } from '../../user-accounts/api/view-dto/device.view-dto';

@Controller('security/devices')
export class SecurityDevicesControllerWrap {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuardWrap)
  async getUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<DeviceViewDto[]> {
    return this.queryBus.execute(
      new GetUserDeviceSessionsQueryWrap(user.userId),
    );
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuardWrap)
  async terminateDeviceSession(
    @Param('deviceId') deviceId: string,
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateDeviceSessionCommandWrap({
        deviceId,
        currentUserId: user.userId,
      }),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuardWrap)
  async terminateAllOtherUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateAllOtherUserDeviceSessionsCommandWrap({
        userId: user.userId,
        currentDeviceId: user.deviceId,
      }),
    );
  }
}
