import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { DeviceAuthSessionsRepository } from '../../infrastructure/device-auth-sessions.repository';
import { BloggerPlatformExternalService } from '../../../blogger-platform/common/infrastructure/external/blogger-platform.external-service';

export class DeleteUserCommand {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(
    private usersRepository: UsersRepository,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepository,
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
