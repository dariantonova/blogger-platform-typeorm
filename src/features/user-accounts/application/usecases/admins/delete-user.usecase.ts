import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DeviceAuthSessionsRepository } from '../../../infrastructure/device-auth-sessions.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
  ) {}

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);

    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessions(
      userId,
    );
  }
}
