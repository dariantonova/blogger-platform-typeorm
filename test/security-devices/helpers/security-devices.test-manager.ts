import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { SECURITY_DEVICES_PATH } from '../../helpers/helper';

export class SecurityDevicesTestManager {
  constructor(private app: INestApplication) {}

  async getUserDeviceSessions(
    refreshToken: string,
    expectedStatusCode: HttpStatus,
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .get(SECURITY_DEVICES_PATH)
      .set('Cookie', 'refreshToken=' + refreshToken)
      .expect(expectedStatusCode);
  }
}
