import { CreateUserInputDto } from '../api/input-dto/create-user.input-dto';
import { UsersRepository } from '../infrastructure/users.repository';
import bcrypt from 'bcrypt';
import { User, UserModelType } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';

export class UsersService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    private usersRepository: UsersRepository,
  ) {}

  async createUser(dto: CreateUserInputDto): Promise<string> {
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.UserModel.createInstance({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });

    await this.usersRepository.save(user);

    return user._id.toString();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findUserByIdOrNotFoundFail(id);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
