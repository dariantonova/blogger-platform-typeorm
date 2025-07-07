import { UsersRepo } from '../../../infrastructure/users.repo';
import { CryptoService } from '../../crypto.service';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { CreateUserDto } from '../../../dto/create-user.dto';
import { User } from '../../../domain/user.entity';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-code';

export abstract class BaseCreateUser {
  protected constructor(
    protected usersRepository: UsersRepo,
    protected cryptoService: CryptoService,
    protected userAccountsConfig: UserAccountsConfig,
  ) {}

  protected async createUser(dto: CreateUserDto): Promise<User> {
    const userWithSameLogin = await this.usersRepository.findByLogin(dto.login);
    if (userWithSameLogin) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [
          {
            field: 'login',
            message: 'Login is already taken',
          },
        ],
      });
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(dto.email);
    if (userWithSameEmail) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: 'Bad request',
        extensions: [
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

    return User.createInstance(
      {
        login: dto.login,
        email: dto.email,
        passwordHash,
      },
      this.userAccountsConfig.isUserAutomaticallyConfirmed,
    );
  }
}
