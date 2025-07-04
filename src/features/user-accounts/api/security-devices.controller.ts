import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuard } from './guards/refresh-token/jwt-refresh-auth.guard';
import { DeviceViewDto } from './view-dto/device.view-dto';
import { ExtractUserFromRequest } from './guards/decorators/param/extract-user-from-request';
import { DeviceAuthSessionContextDto } from './guards/dto/device-auth-session-context.dto';
import { TerminateAllOtherUserDeviceSessionsCommand } from '../application/usecases/terminate-all-other-user-device-sessions.usecase';
import { GetUserDeviceSessionsQuery } from '../application/queries/get-user-device-sessions.query';
import { TerminateDeviceSessionCommand } from '../application/usecases/terminate-device-session.usecase';

@Controller('security/devices')
export class SecurityDevicesController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuard)
  async getUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<DeviceViewDto[]> {
    return this.queryBus.execute(new GetUserDeviceSessionsQuery(user.userId));
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async terminateDeviceSession(
    @Param(
      'deviceId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    deviceId: string,
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateDeviceSessionCommand({
        deviceId,
        currentUserId: user.userId,
      }),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async terminateAllOtherUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateAllOtherUserDeviceSessionsCommand({
        userId: user.userId,
        currentDeviceId: user.deviceId,
      }),
    );
  }
}
