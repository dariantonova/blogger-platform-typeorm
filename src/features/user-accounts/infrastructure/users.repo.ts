import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../domain/user.entity';
import { Repository } from 'typeorm';
import { PasswordRecovery } from '../domain/password-recovery.entity';

@Injectable()
export class UsersRepo {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(PasswordRecovery)
    private passwordRecoveriesRepository: Repository<PasswordRecovery>,
  ) {}

  async save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async findByIdOrNotFoundFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByIdOrInternalFail(id: number): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { login },
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: [{ login: loginOrEmail }, { email: loginOrEmail }],
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { confirmationInfo: { confirmationCode } },
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async findByPasswordRecoveryCodeHash(
    recoveryCodeHash: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { passwordRecoveryInfo: { recoveryCodeHash } },
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
  }

  async deletePasswordRecoveryByUserId(userId: number): Promise<void> {
    await this.passwordRecoveriesRepository.delete({ userId });
  }
}
