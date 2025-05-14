import { CreateUserDto } from '../../../user-accounts/dto/create-user.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CryptoService } from '../../../user-accounts/application/crypto.service';
import { UserAccountsConfig } from '../../../user-accounts/user-accounts.config';
import { BadRequestException } from '@nestjs/common';
import { UsersRepositorySql } from '../../infrastructure/users.repository.sql';
import { CreateUserRepoDto } from '../../infrastructure/dto/create-user.repo-dto';

export class CreateUserCommandSql {
  constructor(public dto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommandSql)
export class CreateUserUseCaseSql
  implements ICommandHandler<CreateUserCommandSql, number>
{
  constructor(
    private usersRepository: UsersRepositorySql,
    private cryptoService: CryptoService,
    private userAccountsConfig: UserAccountsConfig,
  ) {}

  async execute({ dto }: CreateUserCommandSql): Promise<number> {
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

    const repoDto: CreateUserRepoDto = {
      login: dto.login,
      email: dto.email,
      passwordHash,
      confirmationInfo: {
        confirmationCode: null,
        expirationDate: null,
        isConfirmed: this.userAccountsConfig.isUserAutomaticallyConfirmed,
      },
    };

    return this.usersRepository.createUserWithConfirmation(repoDto);
  }
}
