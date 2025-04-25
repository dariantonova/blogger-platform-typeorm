import { HttpStatus, INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { SECURITY_DEVICES_PATH } from './helper';
import { DeviceViewDto } from '../../src/features/user-accounts/api/view-dto/device.view-dto';

export class SecurityDevicesCommonTestManager {
  constructor(private app: INestApplication) {}

  async getUserDeviceSessions(
    refreshToken: string,
    expectedStatusCode: HttpStatus,
  ): Promise<DeviceViewDto[]> {
    const response = await request(this.app.getHttpServer())
      .get(SECURITY_DEVICES_PATH)
      .set('Cookie', 'refreshToken=' + refreshToken)
      .expect(expectedStatusCode);

    return response.body as DeviceViewDto[];
  }
}
