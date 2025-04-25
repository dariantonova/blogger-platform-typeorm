import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';

export class LogoutUserCommand {
  constructor(public dto: { deviceId: string }) {}
}

@CommandHandler(LogoutUserCommand)
export class LogoutUserUseCase implements ICommandHandler<LogoutUserCommand> {
  constructor(
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ dto }: LogoutUserCommand): Promise<void> {
    await this.deviceAuthSessionsRepository.deleteByDeviceId(dto.deviceId);
  }
}
