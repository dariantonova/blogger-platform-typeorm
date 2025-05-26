import { Controller, Get, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtRefreshAuthGuardSql } from '../guards/refresh-token/jwt-refresh-auth.guard.sql';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request';
import { DeviceAuthSessionContextDtoSql } from '../guards/dto/device-auth-session-context.dto.sql';
import { DeviceViewDtoSql } from './view-dto/device.view-dto.sql';
import { GetUserDeviceSessionsQuerySql } from '../application/queries/get-user-device-sessions.query.sql';

@Controller('sql/security/devices')
export class SecurityDevicesControllerSql {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtRefreshAuthGuardSql)
  async getUserDeviceSessions(
    @ExtractUserFromRequest() user: DeviceAuthSessionContextDtoSql,
  ): Promise<DeviceViewDtoSql[]> {
    return this.queryBus.execute(
      new GetUserDeviceSessionsQuerySql(user.userId),
    );
  }

  // @Delete(':deviceId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtRefreshAuthGuard)
  // async terminateDeviceSession(
  //   @Param('deviceId') deviceId: string,
  //   @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new TerminateDeviceSessionCommand({
  //       deviceId,
  //       currentUserId: user.userId,
  //     }),
  //   );
  // }
  //
  // @Delete()
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtRefreshAuthGuard)
  // async terminateAllOtherUserDeviceSessions(
  //   @ExtractUserFromRequest() user: DeviceAuthSessionContextDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new TerminateAllOtherUserDeviceSessionsCommand({
  //       userId: user.userId,
  //       currentDeviceId: user.deviceId,
  //     }),
  //   );
  // }
}
