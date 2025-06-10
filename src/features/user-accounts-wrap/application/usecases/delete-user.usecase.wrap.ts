import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';

export class DeleteUserCommandWrap {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommandWrap)
export class DeleteUserUseCaseWrap
  implements ICommandHandler<DeleteUserCommandWrap>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
  ) {}

  async execute({ userId }: DeleteUserCommandWrap): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);

    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessions(
      userId,
    );
  }
}
