import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BloggerPlatformExternalService } from '../../../blogger-platform/common/infrastructure/external/blogger-platform.external-service';
import { DeviceAuthSessionsRepo } from '../../infrastructure/device-auth-sessions.repo';
import { UsersRepo } from '../../infrastructure/users.repo';

export class DeleteUserCommand {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersRepository: UsersRepo,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepo,
    private bloggerPlatformExternalService: BloggerPlatformExternalService,
  ) {}

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);

    await this.deviceAuthSessionsRepository.deleteUserDeviceAuthSessions(
      userId,
    );
    await this.bloggerPlatformExternalService.deleteUserRelations(userId);
  }
}
