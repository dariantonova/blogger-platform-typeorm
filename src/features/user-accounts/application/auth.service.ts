import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from './crypto.service';
import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
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
}
