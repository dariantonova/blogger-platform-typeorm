import { CreateUserDto } from '../../../dto/create-user.dto';
import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { CreateUserCommand } from '../admins/create-user.usecase';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UsersService } from '../../users.service';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';

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
      string
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
