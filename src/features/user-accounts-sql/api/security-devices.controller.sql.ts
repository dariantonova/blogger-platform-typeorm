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
import { JwtRefreshAuthGuardSql } from '../guards/refresh-token/jwt-refresh-auth.guard.sql';
import { DeviceAuthSessionContextDtoSql } from '../guards/dto/device-auth-session-context.dto.sql';
import { GetUserDeviceSessionsQuerySql } from '../application/queries/get-user-device-sessions.query.sql';
import { TerminateDeviceSessionCommandSql } from '../application/usecases/terminate-device-session.usecase.sql';
import { TerminateAllOtherUserDeviceSessionsCommandSql } from '../application/usecases/terminate-all-other-user-device-sessions.usecase.sql';
import { DeviceViewDto } from '../../user-accounts/api/view-dto/device.view-dto';
import { ExtractUserFromRequestSql } from '../guards/decorators/param/extract-user-from-request.sql';

// @Controller('sql/security/devices')
@Controller('security/devices')
export class SecurityDevicesControllerSql {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuardSql)
  async getUserDeviceSessions(
    @ExtractUserFromRequestSql() user: DeviceAuthSessionContextDtoSql,
  ): Promise<DeviceViewDto[]> {
    return this.queryBus.execute(
      new GetUserDeviceSessionsQuerySql(user.userId),
    );
  }

  @Delete(':deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuardSql)
  async terminateDeviceSession(
    @Param(
      'deviceId',
      new ParseUUIDPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    deviceId: string,
    @ExtractUserFromRequestSql() user: DeviceAuthSessionContextDtoSql,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateDeviceSessionCommandSql({
        deviceId,
        currentUserId: user.userId,
      }),
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuardSql)
  async terminateAllOtherUserDeviceSessions(
    @ExtractUserFromRequestSql() user: DeviceAuthSessionContextDtoSql,
  ): Promise<void> {
    await this.commandBus.execute(
      new TerminateAllOtherUserDeviceSessionsCommandSql({
        userId: user.userId,
        currentDeviceId: user.deviceId,
      }),
    );
  }
}
