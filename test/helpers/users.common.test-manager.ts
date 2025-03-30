import { HttpStatus, INestApplication } from '@nestjs/common';
import { QueryType, USERS_PATH, VALID_BASIC_AUTH_VALUE } from './helper';
import request, { Response } from 'supertest';
import { UserViewDto } from '../../src/features/user-accounts/api/view-dto/users.view-dto';

export class UsersCommonTestManager {
  constructor(private app: INestApplication) {}

  async createUser(createDto: any): Promise<UserViewDto> {
    const response = await request(this.app.getHttpServer())
      .post(USERS_PATH)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .send(createDto)
      .expect(HttpStatus.CREATED);

    return response.body as UserViewDto;
  }

  async deleteUser(id: string): Promise<void> {
    await request(this.app.getHttpServer())
      .delete(USERS_PATH + '/' + id)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.NO_CONTENT);
  }

  async getUsers(query: QueryType = {}): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_PATH)
      .query(query)
      .set('Authorization', VALID_BASIC_AUTH_VALUE)
      .expect(HttpStatus.OK);
  }
}
