import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';

export class LogoutUserCommand {
  constructor(public dto: { userId: string; deviceId: string }) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ dto }: LogoutUserCommand): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.userId,
    );
  }
}
