import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../guards/refresh-token/jwt-refresh-auth.guard';
import { ExtractUserFromRequest } from '../guards/decorators/param/extract-user-from-request';
import { DeviceAuthSessionContextDto } from '../guards/dto/device-auth-session-context.dto';
import { DeviceViewDto } from './view-dto/device.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserDeviceSessionsQuery } from '../application/queries/get-user-device-sessions.query';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-pipe';
import { TerminateDeviceSessionCommand } from '../application/usecases/terminate-device-session.usecase';
import { TerminateAllOtherUserDeviceSessionsCommand } from '../application/usecases/users/terminate-all-other-device-sessions.usecase';

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
    @Param('deviceId', ObjectIdValidationPipe) deviceId: string,
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
