import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';

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
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'Device auth session not found',
      });
    }

    const sessionOfCurrentUser = deviceSessions.find(
      (s) => s.userId === dto.currentUserId,
    );
    if (!sessionOfCurrentUser) {
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'Forbidden',
      });
    }

    await this.deviceAuthSessionsRepository.deleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.currentUserId,
    );
  }
}
