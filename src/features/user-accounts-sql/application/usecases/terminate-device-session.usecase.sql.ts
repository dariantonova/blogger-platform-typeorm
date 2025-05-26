import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';

export class TerminateDeviceSessionCommandSql {
  constructor(public dto: { deviceId: string; currentUserId: number }) {}
}

@CommandHandler(TerminateDeviceSessionCommandSql)
export class TerminateDeviceSessionUseCaseSql
  implements ICommandHandler<TerminateDeviceSessionCommandSql>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async execute({ dto }: TerminateDeviceSessionCommandSql): Promise<void> {
    const deviceSessions =
      await this.deviceAuthSessionsRepository.findManyByDeviceId(dto.deviceId);

    if (!deviceSessions.length) {
      throw new NotFoundException('Device auth session not found');
    }

    const sessionOfCurrentUser = deviceSessions.find(
      (s) => s.userId === dto.currentUserId,
    );
    if (!sessionOfCurrentUser) {
      throw new ForbiddenException();
    }

    await this.deviceAuthSessionsRepository.hardDeleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.currentUserId,
    );
  }
}
