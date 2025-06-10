import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';

export class TerminateDeviceSessionCommandWrap {
  constructor(public dto: { deviceId: string; currentUserId: string }) {}
}

@CommandHandler(TerminateDeviceSessionCommandWrap)
export class TerminateDeviceSessionUseCaseWrap
  implements ICommandHandler<TerminateDeviceSessionCommandWrap>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ dto }: TerminateDeviceSessionCommandWrap): Promise<void> {
    const deviceSession =
      await this.deviceAuthSessionsRepository.findByDeviceIdOrNotFoundFail(
        dto.deviceId,
      );

    if (dto.currentUserId !== deviceSession.userId) {
      throw new ForbiddenException();
    }

    await this.deviceAuthSessionsRepository.deleteByDeviceId(dto.deviceId);
  }
}
