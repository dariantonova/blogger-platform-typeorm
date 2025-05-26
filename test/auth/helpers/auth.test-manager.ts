import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AUTH_PATH } from '../../helpers/helper';
import { parse } from 'cookie';
import { DeviceViewDto } from '../../../src/features/user-accounts/api/view-dto/device.view-dto';
import { LoginInputDto } from '../../../src/features/user-accounts/api/input-dto/login.input-dto';

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

  /**
   * Extracts the raw `refreshToken` cookie string from the response headers.
   * Asserts that the cookie is present.
   *
   * @param response - The HTTP response object.
   * @returns The full `refreshToken` cookie string.
   */
  extractRefreshCookieFromResponse(response: Response): string {
    const cookies = response.headers['set-cookie'] as unknown as string[];
    const refreshCookie = cookies.find((c) => c.startsWith('refreshToken='));
    expect(refreshCookie).toBeDefined();

    return refreshCookie as string;
  }

  /**
   * Extracts the value of the `refreshToken` from the response cookies.
   * Asserts that the token is present and correctly parsed.
   *
   * @param response - The HTTP response object.
   * @returns The `refreshToken` string extracted from cookies.
   */
  extractRefreshTokenFromResponse(response: Response): string {
    const refreshCookie = this.extractRefreshCookieFromResponse(response);

    const parsed = parse(refreshCookie);
    expect(parsed.refreshToken).toBeDefined();

    return parsed.refreshToken as string;
  }

  /**
   * Checks that the access token is present in the response body.
   */
  private assertAccessTokenPresent(response: Response): void {
    expect(response.body).toEqual({ accessToken: expect.any(String) });
  }

  /**
   * Extracts and asserts that the refresh-token token cookie exists and is not empty.
   * @returns The extracted refresh-token token.
   */
  private assertRefreshTokenPresent(response: Response): string {
    const refreshToken = this.extractRefreshTokenFromResponse(response);
    expect(refreshToken.length).not.toBe(0);
    return refreshToken;
  }

  /**
   * Validates that the access token is usable by calling a protected endpoint.
   */
  async assertAccessTokenIsValid(accessToken: string): Promise<void> {
    await this.me('Bearer ' + accessToken, HttpStatus.OK);
  }

  /**
   * Validates that the refresh-token token is usable by calling the refresh-token endpoint.
   */
  async assertRefreshTokenIsValid(refreshToken: string): Promise<void> {
    await this.refreshToken(refreshToken, HttpStatus.OK);
  }

  /**
   * Validates that the access token is usable by calling a protected endpoint.
   */
  async assertAccessTokenIsInvalid(accessToken: string): Promise<void> {
    await this.me('Bearer ' + accessToken, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Validates that the refresh-token token is usable by calling the refresh-token endpoint.
   */
  async assertRefreshTokenIsInvalid(refreshToken: string): Promise<void> {
    await this.refreshToken(refreshToken, HttpStatus.UNAUTHORIZED);
  }

  /**
   * Asserts that the login/refresh-token response contains valid tokens.
   * @param response - The HTTP response from login or token refresh-token.
   */
  async validateAuthTokensResponse(response: Response): Promise<void> {
    this.assertAccessTokenPresent(response);
    const refreshToken = this.assertRefreshTokenPresent(response);
    await this.assertAccessTokenIsValid(response.body.accessToken);
    await this.assertRefreshTokenIsValid(refreshToken);
  }

  async refreshToken(
    refToken: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/refresh-token')
      .set('Cookie', 'refreshToken=' + refToken)
      .expect(expectedStatusCode);
  }

  async getNewRefreshToken(loginInput: LoginInputDto): Promise<string> {
    const loginResponse = await this.login(loginInput, HttpStatus.OK);
    return this.extractRefreshTokenFromResponse(loginResponse);
  }

  async getNewRefreshTokensOfUser(
    loginInput: LoginInputDto,
    numberOfTokens: number,
  ): Promise<string[]> {
    const tokens: string[] = [];
    for (let i = 0; i < numberOfTokens; i++) {
      const loginResponse = await this.login(loginInput, HttpStatus.OK);
      const token = this.extractRefreshTokenFromResponse(loginResponse);
      tokens.push(token);
    }
    return tokens;
  }

  async logout(
    refToken: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post(AUTH_PATH + '/logout')
      .set('Cookie', 'refreshToken=' + refToken)
      .expect(expectedStatusCode);
  }

  validateDeviceSession(
    deviceSession: DeviceViewDto,
    expectedTitle: string,
  ): void {
    expect(deviceSession.ip).toEqual(expect.any(String));
    expect(deviceSession.lastActiveDate).toEqual(expect.any(String));
    expect(Date.parse(deviceSession.lastActiveDate)).not.toBeNaN();
    expect(deviceSession.deviceId).toEqual(expect.any(String));
    expect(deviceSession.title).toBe(expectedTitle);
  }
}
