import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';

export class LogoutUserCommandSql {
  constructor(public dto: { deviceId: string }) {}
}

@CommandHandler(LogoutUserCommandSql)
export class LogoutUserUseCaseSql
  implements ICommandHandler<LogoutUserCommandSql>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async execute({ dto }: LogoutUserCommandSql): Promise<void> {
    await this.deviceAuthSessionsRepository.hardDeleteByDeviceId(dto.deviceId);
  }
}
