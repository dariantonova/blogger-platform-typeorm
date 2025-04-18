import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AUTH_PATH } from '../../helpers/helper';
import { parse } from 'cookie';

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

  /**
   * Registers a new user and returns a valid authorization header string.
   *
   * The user is created with a unique login and email based on the provided number.
   * After registration, the user is logged in and the method returns a string
   * in the format `"Bearer <accessToken>"` that can be used in the `Authorization` header.
   *
   * @param {number} [userNumber=1] - A number used to generate a unique login and email (e.g., "user2", "user2@example.com").
   * @returns {Promise<string>} - The authorization header string in the format "Bearer <accessToken>".
   */
  async getValidAuth(userNumber: number = 1): Promise<string> {
    const userData = {
      login: 'user' + userNumber,
      email: 'user' + userNumber + '@example.com',
      password: 'qwerty',
    };
    await this.register(userData, HttpStatus.NO_CONTENT);
    const userAccessToken = await this.getNewAccessToken(
      userData.login,
      userData.password,
    );
    return 'Bearer ' + userAccessToken;
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

  async confirmRegistration(
    dto: any,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/registration-confirmation')
      .send(dto)
      .expect(expectedStatusCode);
  }

  async resendRegistrationEmail(
    dto: any,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/registration-email-resending')
      .send(dto)
      .expect(expectedStatusCode);
  }

  async recoverPassword(
    dto: any,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/password-recovery')
      .send(dto)
      .expect(expectedStatusCode);
  }

  async setNewPassword(
    dto: any,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/new-password')
      .send(dto)
      .expect(expectedStatusCode);
  }

  checkLoginResponse(response: Response) {
    expect(response.body).toEqual({ accessToken: expect.any(String) });

    const cookies = response.headers['set-cookie'] as unknown as string[];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();

    const parsed = parse(refreshCookie as string);
    expect(parsed.refreshToken?.length).not.toBe(0);
  }
}
