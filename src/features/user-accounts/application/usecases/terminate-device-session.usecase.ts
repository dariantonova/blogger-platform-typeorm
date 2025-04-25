import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';
import { ForbiddenException } from '@nestjs/common';

export class TerminateDeviceSessionCommand {
  constructor(public dto: { deviceId: string; currentUserId: string }) {}
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase
  implements ICommandHandler<TerminateDeviceSessionCommand>
{
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ dto }: TerminateDeviceSessionCommand): Promise<void> {
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
