import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';

export class TerminateAllOtherUserDeviceSessionsCommand {
  constructor(public dto: { userId: number; currentDeviceId: string }) {}
}

@CommandHandler(TerminateAllOtherUserDeviceSessionsCommand)
export class TerminateAllOtherUserDeviceSessionsUseCase
  implements ICommandHandler<TerminateAllOtherUserDeviceSessionsCommand>
{
  constructor(private deviceAuthSessionsRepository: DeviceAuthSessionsRepo) {}

  async execute({
    dto,
  }: TerminateAllOtherUserDeviceSessionsCommand): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessionsExceptCurrent(
      dto.userId,
      dto.currentDeviceId,
    );
  }
}
