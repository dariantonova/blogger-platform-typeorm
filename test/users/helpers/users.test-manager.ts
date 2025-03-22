import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserDto } from '../../../src/features/user-accounts/dto/create-user.dto';
import request, { Response } from 'supertest';
import { QueryType, USERS_PATH } from '../../helpers/helper';

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  async createUser(
    createDto: CreateUserDto,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(USERS_PATH)
      .send(createDto)
      .expect(expectedStatusCode);
  }

  async getUsers(
    expectedStatusCode: HttpStatus,
    query: QueryType = {},
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(USERS_PATH)
      .query(query)
      .expect(expectedStatusCode);
  }
}
