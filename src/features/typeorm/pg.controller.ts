import { Controller, Get } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user-accounts/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('pg')
export class PgController {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  @Get()
  async getUsers(): Promise<User[]> {
    const users = await this.usersRepository.find({
      relations: { confirmationInfo: true, passwordRecoveryInfo: true },
    });
    return users;
  }
}
