import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';

export class TerminateAllOtherUserDeviceSessionsCommandSql {
  constructor(public dto: { userId: number; currentDeviceId: string }) {}
}

@CommandHandler(TerminateAllOtherUserDeviceSessionsCommandSql)
export class TerminateAllOtherUserDeviceSessionsUseCaseSql
  implements ICommandHandler<TerminateAllOtherUserDeviceSessionsCommandSql>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
  ) {}

  async execute({
    dto,
  }: TerminateAllOtherUserDeviceSessionsCommandSql): Promise<void> {
    await this.deviceAuthSessionsRepository.hardDeleteUserDeviceAuthSessionsExceptCurrent(
      dto.userId,
      dto.currentDeviceId,
    );
  }
}
