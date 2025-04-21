import { Injectable } from '@nestjs/common';
import { DeviceAuthSessionDocument } from '../domain/device-auth-session.entity';

@Injectable()
export class DeviceAuthSessionsRepository {
  constructor() {}

  async save(deviceAuthSession: DeviceAuthSessionDocument): Promise<void> {
    await deviceAuthSession.save();
  }
}
