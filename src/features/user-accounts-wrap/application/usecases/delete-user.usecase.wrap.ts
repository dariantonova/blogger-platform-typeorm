import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { DeviceAuthSessionsRepositoryWrap } from '../../infrastructure/device-auth-sessions.repository.wrap';
import { BloggerPlatformExternalServiceWrap } from '../../../blogger-platform-wrap/common/infrastructure/external/blogger-platform.external-service.wrap';

export class DeleteUserCommandWrap {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteUserCommandWrap)
export class DeleteUserUseCaseWrap
  implements ICommandHandler<DeleteUserCommandWrap>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositoryWrap,
    private bloggerPlatformExternalService: BloggerPlatformExternalServiceWrap,
  ) {}

  async execute({ userId }: DeleteUserCommandWrap): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);

    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessions(
      userId,
    );
    await this.bloggerPlatformExternalService.deleteUserRelations(userId);
  }
}
