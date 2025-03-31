import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../notifications/email.service';
import { UsersService } from './users.service';

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
}
