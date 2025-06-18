import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repository';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { UserRegisteredEvent } from '../../../user-accounts/domain/events/user-registered.event';
import { CreateUserCommand } from './create-user.usecase';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
  ) {}

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      number
    >(new CreateUserCommand(dto));

    const createdUser =
      await this.usersRepository.findByIdOrInternalFail(createdUserId);

    const confirmationCode =
      await this.usersService.updateUserConfirmationCode(createdUser);

    this.eventBus.publish(
      new UserRegisteredEvent(createdUser.email, confirmationCode),
    );
  }
}
