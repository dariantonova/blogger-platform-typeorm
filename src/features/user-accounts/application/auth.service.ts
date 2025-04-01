import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../notifications/email.service';
import { UsersService } from './users.service';
import { randomBytes } from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private usersService: UsersService,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserContextDto | null> {
    const user =
      await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
    if (!user) {
      return null;
    }

    const isPasswordCorrect = await this.cryptoService.comparePasswords(
      password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      return null;
    }

    return { id: user._id.toString() };
  }

  async login(user: UserContextDto): Promise<{ accessToken: string }> {
    const accessToken = this.jwtService.sign(user);
    return { accessToken };
  }

  async resendRegistrationEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user || user.confirmationInfo.isConfirmed) {
      return;
    }

    const newConfirmationCode =
      await this.usersService.updateUserConfirmationCode(user);

    this.emailService.sendConfirmationEmail(email, newConfirmationCode);
  }

  async confirmRegistration(confirmationCode: string): Promise<void> {
    const user =
      await this.usersRepository.findUserByConfirmationCode(confirmationCode);
    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code is incorrect',
          },
        ],
      });
    }

    if (user.confirmationInfo.isConfirmed) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code has already been applied',
          },
        ],
      });
    }

    if (new Date() > user.confirmationInfo.expirationDate) {
      throw new BadRequestException({
        errors: [
          {
            field: 'code',
            message: 'Confirmation code is expired',
          },
        ],
      });
    }

    user.makeConfirmed();

    await this.usersRepository.save(user);
  }

  async recoverPassword(email: string): Promise<void> {
    const user = await this.usersRepository.findUserByEmail(email);
    if (!user) {
      return;
    }

    const recoveryCode = randomBytes(32).toString('hex');
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    user.setPasswordRecoveryCodeHash(recoveryCodeHash);

    await this.usersRepository.save(user);

    this.emailService.sendPasswordRecoveryEmail(user.email, recoveryCode);
  }

  async setNewPassword(
    newPassword: string,
    recoveryCode: string,
  ): Promise<void> {
    const recoveryCodeHash =
      this.cryptoService.createPasswordRecoveryCodeHash(recoveryCode);

    const user =
      await this.usersRepository.findUserByPasswordRecoveryCodeHash(
        recoveryCodeHash,
      );
    if (!user) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is incorrect',
          },
        ],
      });
    }

    if (new Date() > user.passwordRecoveryInfo.expirationDate) {
      throw new BadRequestException({
        errors: [
          {
            field: 'recoveryCode',
            message: 'Recovery code is expired',
          },
        ],
      });
    }

    user.resetPasswordRecoveryInfo();

    const newPasswordHash =
      await this.cryptoService.createPasswordHash(newPassword);

    user.setPasswordHash(newPasswordHash);

    this.usersRepository.save(user);
  }
}
