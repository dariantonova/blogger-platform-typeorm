import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { SECURITY_DEVICES_PATH } from './helper';
import { DeviceViewDto } from '../../src/features/user-accounts/api/view-dto/device.view-dto';

export class SecurityDevicesCommonTestManager {
  constructor(private app: INestApplication) {}

  async getUserDeviceSessions(refreshToken: string): Promise<DeviceViewDto[]> {
    const response = await request(this.app.getHttpServer())
      .get(SECURITY_DEVICES_PATH)
      .set('Cookie', 'refreshToken=' + refreshToken)
      .expect(HttpStatus.OK);

    return response.body as DeviceViewDto[];
  }
}
