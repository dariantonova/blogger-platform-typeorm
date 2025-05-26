import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';

export class LogoutUserCommandSql {
  constructor(public dto: { deviceId: string; userId: number }) {}
}

@CommandHandler(LogoutUserCommandSql)
export class LogoutUserUseCaseSql
  implements ICommandHandler<LogoutUserCommandSql>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async execute({ dto }: LogoutUserCommandSql): Promise<void> {
    await this.deviceAuthSessionsRepository.hardDeleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.userId,
    );
  }
}
