import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';
import { BloggerPlatformExternalServiceSql } from '../../../blogger-platform-sql/common/infrastructure/external/blogger-platform.external-service.sql';

export class DeleteUserCommandSql {
  constructor(public userId: number) {}
}

@CommandHandler(DeleteUserCommandSql)
export class DeleteUserUseCaseSql
  implements ICommandHandler<DeleteUserCommandSql>
{
  constructor(
    private usersRepository: UsersRepositorySql,
    private deviceAuthSessionsRepository: DeviceAuthSessionsRepositorySql,
    private bloggerPlatformExternalService: BloggerPlatformExternalServiceSql,
  ) {}

  async execute({ userId }: DeleteUserCommandSql): Promise<void> {
    await this.usersRepository.findByIdOrNotFoundFail(userId);

    await this.bloggerPlatformExternalService.deleteUserRelations(userId);
    await this.deviceAuthSessionsRepository.hardDeleteByUserId(userId);
    await this.usersRepository.softDeleteUserAggregateById(userId);
  }
}
