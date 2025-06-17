import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../user-accounts/application/crypto.service';
import { UserAccountsConfig } from '../../../user-accounts/user-accounts.config';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositoryWrap } from '../../infrastructure/users.repository.wrap';
import { UserWrap } from '../../domain/user.wrap';

export class CreateUserCommandWrap {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommandWrap)
export class CreateUserUseCaseWrap
  implements ICommandHandler<CreateUserCommandWrap, number>
{
  constructor(
    private usersRepository: UsersRepositoryWrap,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommandWrap): Promise<number> {
    const userWithSameLogin = await this.usersRepository.findByLogin(dto.login);
    if (userWithSameLogin) {
      throw new BadRequestException({
        errors: [
          {
            field: 'login',
            message: 'Login is already taken',
          },
        ],
      });
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(dto.email);
    if (userWithSameEmail) {
      throw new BadRequestException({
        errors: [
          {
            field: 'email',
            message: 'Email is already taken',
          },
        ],
      });
    }

    const passwordHash = await this.cryptoService.createPasswordHash(
      dto.password,
    );

    const user = UserWrap.createInstance(
      {
        login: dto.login,
        email: dto.email,
        passwordHash,
      },
      this.userAccountsConfig.isUserAutomaticallyConfirmed,
    );

    await this.usersRepository.save(user);

    return user.id;
  }
}
