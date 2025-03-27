import { HttpStatus, INestApplication } from '@nestjs/common';
import { USERS_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import request from 'supertest';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';

export class UsersCommonTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createDto: any,
    auth: string = VALID_BASIC_AUTH_VALUE,
  ): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(USERS_PATH)
      .set('Authorization', auth)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as UserViewDto;
  }
}
