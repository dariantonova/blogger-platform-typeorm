import { CreateUserDto } from '../../dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../crypto.service';
import { UserAccountsConfig } from '../../user-accounts.config';
import { BadRequestException } from '@nestjs/common';
import { User } from '../../domain/user.entity';
import { UsersRepo } from '../../infrastructure/users.repo';

export class CreateUserCommand {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, number>
{
  constructor(
    private usersRepository: UsersRepo,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommand): Promise<number> {
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

    const user = User.createInstance(
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
