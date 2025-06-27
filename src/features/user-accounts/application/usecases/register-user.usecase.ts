import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';
import { CreateUserCommand } from './create-user.usecase';
import { UsersRepo } from '../../infrastructure/users.repo';

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
    private usersRepository: UsersRepo,
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
