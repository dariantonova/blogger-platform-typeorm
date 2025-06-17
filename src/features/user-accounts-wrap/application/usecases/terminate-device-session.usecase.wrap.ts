import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';

export class TerminateDeviceSessionCommandWrap {
  constructor(public dto: { deviceId: string; currentUserId: number }) {}
}

@CommandHandler(TerminateDeviceSessionCommandWrap)
export class TerminateDeviceSessionUseCaseWrap
  implements ICommandHandler<TerminateDeviceSessionCommandWrap>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ dto }: TerminateDeviceSessionCommandWrap): Promise<void> {
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

    await this.deviceAuthSessionsRepository.deleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.currentUserId,
    );
  }
}
