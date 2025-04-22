import { Injectable } from '@nestjs/common';
import {
  DeviceAuthSession,
  DeviceAuthSessionDocument,
  DeviceAuthSessionModelType,
} from '../domain/device-auth-session.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DeviceAuthSessionsRepository {
  constructor(
    @InjectModel(DeviceAuthSession.name)
    private DeviceAuthSessionModel: DeviceAuthSessionModelType,
  ) {}

  async save(deviceAuthSession: DeviceAuthSessionDocument): Promise<void> {
    await deviceAuthSession.save();
  }

  async findByDeviceIdAndIat(
    deviceId: string,
    iat: Date,
  ): Promise<DeviceAuthSessionDocument | null> {
    return this.DeviceAuthSessionModel.findOne({
      deviceId,
      iat,
    });
  }

  async findByDeviceIdOrInternalFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionDocument> {
    const deviceAuthSession = await this.DeviceAuthSessionModel.findOne({
      deviceId,
    });

    if (!deviceAuthSession) {
      throw new Error('Device auth session not found');
    }

    return deviceAuthSession;
  }

  async deleteUserDeviceAuthSessions(userId: string): Promise<void> {
    await this.DeviceAuthSessionModel.deleteMany({ userId });
  }

  async deleteByDeviceIdAndUserId(
    deviceId: string,
    userId: string,
  ): Promise<void> {
    await this.DeviceAuthSessionModel.deleteOne({ deviceId, userId });
  }
}
