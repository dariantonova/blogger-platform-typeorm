import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';

export class LogoutUserCommandWrap {
  constructor(public dto: { deviceId: string; userId: number }) {}
}

@CommandHandler(LogoutUserCommandWrap)
export class LogoutUserUseCaseWrap
  implements ICommandHandler<LogoutUserCommandWrap>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ dto }: LogoutUserCommandWrap): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.userId,
    );
  }
}
