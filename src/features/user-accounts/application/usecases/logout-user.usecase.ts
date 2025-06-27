import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';

export class LogoutUserCommand {
  constructor(public dto: { deviceId: string; userId: number }) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(private deviceAuthSessionsRepository: DeviceAuthSessionsRepo) {}

  async execute({ dto }: LogoutUserCommand): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteByDeviceIdAndUserId(
      dto.deviceId,
      dto.userId,
    );
  }
}
