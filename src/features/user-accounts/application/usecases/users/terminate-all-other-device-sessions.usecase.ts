import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepository } from '../../../infrastructure/device-auth-sessions.repository';

export class TerminateAllOtherUserDeviceSessionsCommand {
  constructor(public dto: { userId: string; currentDeviceId: string }) {}
}

@CommandHandler(TerminateAllOtherUserDeviceSessionsCommand)
export class TerminateAllOtherUserDeviceSessionsUseCase
  implements ICommandHandler<TerminateAllOtherUserDeviceSessionsCommand>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({
    dto,
  }: TerminateAllOtherUserDeviceSessionsCommand): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessionsExceptCurrent(
      dto.userId,
      dto.currentDeviceId,
    );
  }
}
