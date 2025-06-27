import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';

export class TerminateDeviceSessionCommand {
  constructor(public dto: { deviceId: string; currentUserId: number }) {}
}

@CommandHandler(TerminateDeviceSessionCommand)
export class TerminateDeviceSessionUseCase
  implements ICommandHandler<TerminateDeviceSessionCommand>
{
  constructor(private deviceAuthSessionsRepository: DeviceAuthSessionsRepo) {}

  async execute({ dto }: TerminateDeviceSessionCommand): Promise<void> {
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
