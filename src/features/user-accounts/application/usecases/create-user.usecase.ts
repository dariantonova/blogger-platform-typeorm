import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../crypto.service';
import { UserAccountsConfig } from '../../user-accounts.config';
import { UsersRepo } from '../../infrastructure/users.repo';
import { BaseCreateUser } from './common/base-create-user';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  extends BaseCreateUser
  implements ICommandHandler<CreateUserCommand, number>
{
  constructor(
    usersRepository: UsersRepo,
    cryptoService: CryptoService,
    userAccountsConfig: UserAccountsConfig,
  ) {
    super(usersRepository, cryptoService, userAccountsConfig);
  }

  async execute({ dto }: CreateUserCommand): Promise<number> {
    const user = await this.createUser(dto);

    await this.usersRepository.save(user);

    return user.id;
  }
}
