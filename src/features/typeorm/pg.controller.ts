import { Controller, Get } from '@nestjs/common';
import { UsersRepo } from './infrastructure/user-accounts/users.repo';
import { DeviceAuthSessionsRepo } from './infrastructure/user-accounts/device-auth-sessions.repo';

@Controller('pg')
export class PgController {
  constructor(
    private usersRepo: UsersRepo,
    private deviceAuthSessionsRepo: DeviceAuthSessionsRepo,
  ) {}

  @Get()
  async getUsers(): Promise<string> {
    const sessions = await this.deviceAuthSessionsRepo.findManyByDeviceId(
      '040677e6-6c1a-46d4-8cfe-314aa5d183c0',
    );
    return 'OK';
  }
}
