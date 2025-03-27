import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AUTH_PATH } from '../../helpers/helper';

export class AuthTestManager {
  constructor(private app: INestApplication) {}

  async login(dto: any, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/login')
      .send(dto)
      .expect(expectedStatusCode);
  }
}
