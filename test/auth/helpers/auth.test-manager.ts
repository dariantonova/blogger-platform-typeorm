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

  async getNewAccessToken(
    loginOrEmail: string,
    password: string,
  ): Promise<string> {
    const loginResponse = await this.login(
      {
        loginOrEmail,
        password,
      },
      HttpStatus.OK,
    );
    return loginResponse.body.accessToken;
  }

  async me(auth: string, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(AUTH_PATH + '/me')
      .set('Authorization', auth)
      .expect(expectedStatusCode);
  }

  async register(dto: any, expectedStatusCode: HttpStatus): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/registration')
      .send(dto)
      .expect(expectedStatusCode);
  }
}
