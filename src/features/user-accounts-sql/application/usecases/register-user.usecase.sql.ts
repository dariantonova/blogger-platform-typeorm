import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UserRegisteredEvent } from '../../../user-accounts/domain/events/user-registered.event';
import { CreateUserCommandSql } from './create-user.usecase.sql';
import { UsersServiceSql } from '../users.service.sql';

export class RegisterUserCommandSql {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommandSql)
export class RegisterUserUseCaseSql
  implements ICommandHandler<RegisterUserCommandSql>
{
  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
    private usersService: UsersServiceSql,
  ) {}

  async execute({ dto }: RegisterUserCommandSql): Promise<void> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommandSql,
      number
    >(new CreateUserCommandSql(dto));

    const confirmationCode =
      await this.usersService.updateUserConfirmationCode(createdUserId);

    this.eventBus.publish(new UserRegisteredEvent(dto.email, confirmationCode));
  }
}
