import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';

export class TerminateAllOtherUserDeviceSessionsCommandWrap {
  constructor(public dto: { userId: number; currentDeviceId: string }) {}
}

@CommandHandler(TerminateAllOtherUserDeviceSessionsCommandWrap)
export class TerminateAllOtherUserDeviceSessionsUseCaseWrap
  implements ICommandHandler<TerminateAllOtherUserDeviceSessionsCommandWrap>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({
    dto,
  }: TerminateAllOtherUserDeviceSessionsCommandWrap): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessionsExceptCurrent(
      dto.userId,
      dto.currentDeviceId,
    );
  }
}
