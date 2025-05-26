import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
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
    const deviceSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdOrNotFoundFail(
        dto.deviceId,
      );

    if (dto.currentUserId !== deviceSession.userId) {
      throw new ForbiddenException();
    }

    await this.deviceAuthSessionsRepository.hardDeleteByDeviceId(dto.deviceId);
  }
}
