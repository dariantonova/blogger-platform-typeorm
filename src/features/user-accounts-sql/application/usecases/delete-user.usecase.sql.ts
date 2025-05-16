import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';
import { DeviceAuthSessionsRepositorySql } from '../../infrastructure/device-auth-sessions.repository.sql';

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
  ) {}

  async execute({ userId }: DeleteUserCommandSql): Promise<void> {
    await this.usersRepository.findByIdOrNotFoundFail(userId);

    // todo: delete comments with their likes, comment likes, post likes
    await this.deviceAuthSessionsRepository.hardDeleteByUserId(userId);
    await this.usersRepository.softDeleteUserAggregateById(userId);
  }
}
