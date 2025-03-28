import { UsersRepository } from '../infrastructure/users.repository';
import { User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { randomUUID } from 'node:crypto';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private emailService: EmailService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<string> {
    const userWithSameLogin = await this.usersRepository.findUserByLogin(
      dto.login,
    );
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

    const userWithSameEmail = await this.usersRepository.findUserByEmail(
      dto.email,
    );
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

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findByIdOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }

  async registerUser(dto: CreateUserDto): Promise<void> {
    const createdUserId = await this.createUser(dto);
    const createdUser =
      await this.usersRepository.findByIdOrInternalFail(createdUserId);

    const confirmationCode = randomUUID();
    createdUser.setConfirmationCode(confirmationCode);

    await this.usersRepository.save(createdUser);

    this.emailService
      .sendConfirmationEmail(createdUser.email, confirmationCode)
      .catch((err) => console.log('Error sending email: ' + err));
  }
}
