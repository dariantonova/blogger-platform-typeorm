import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../../dto/create-user.dto';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UsersRepo } from '../../infrastructure/users.repo';
import { CryptoService } from '../crypto.service';
import { UserAccountsConfig } from '../../user-accounts.config';
import { BaseCreateUser } from './common/base-create-user';

export class RegisterUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  extends BaseCreateUser
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    private eventBus: EventBus,
    private usersService: UsersService,
    usersRepository: UsersRepo,
    cryptoService: CryptoService,
    userAccountsConfig: UserAccountsConfig,
  ) {
    super(usersRepository, cryptoService, userAccountsConfig);
  }

  async execute({ dto }: RegisterUserCommand): Promise<void> {
    const user = await this.createUser(dto);

    const confirmationCode =
      await this.usersService.updateUserConfirmationCode(user);

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(user.email, confirmationCode),
    );
  }
}
