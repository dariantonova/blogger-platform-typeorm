import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { UsersServiceWrap } from '../users.service.wrap';
import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { UserRegisteredEvent } from '../../../user-accounts/domain/events/user-registered.event';
import { CreateUserCommandWrap } from './create-user.usecase.wrap';

export class RegisterUserCommandWrap {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommandWrap)
export class RegisterUserUseCaseWrap
  implements ICommandHandler<RegisterUserCommandWrap>
{
  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
    private usersRepository: UsersRepositoryWrap,
    private usersService: UsersServiceWrap,
  ) {}

  async execute({ dto }: RegisterUserCommandWrap): Promise<void> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommandWrap,
      number
    >(new CreateUserCommandWrap(dto));

    const createdUser =
      await this.usersRepository.findByIdOrInternalFail(createdUserId);

    const confirmationCode =
      await this.usersService.updateUserConfirmationCode(createdUser);

    this.eventBus.publish(
      new UserRegisteredEvent(createdUser.email, confirmationCode),
    );
  }
}
