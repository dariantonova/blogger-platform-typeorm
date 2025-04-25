import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findByDeviceId(
    deviceId: string,
  ): Promise<DeviceAuthSessionDocument | null> {
    return this.DeviceAuthSessionModel.findOne({
      deviceId,
    });
  }

  async findByDeviceIdOrInternalFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionDocument> {
    const deviceAuthSession = await this.findByDeviceId(deviceId);

    if (!deviceAuthSession) {
      throw new Error('Device auth session not found');
    }

    return deviceAuthSession;
  }

  async findByDeviceIdOrNotFoundFail(
    deviceId: string,
  ): Promise<DeviceAuthSessionDocument> {
    const deviceAuthSession = await this.findByDeviceId(deviceId);

    if (!deviceAuthSession) {
      throw new NotFoundException('Device auth session not found');
    }

    return deviceAuthSession;
  }

  async deleteUserDeviceAuthSessions(userId: string): Promise<void> {
    await this.DeviceAuthSessionModel.deleteMany({ userId });
  }

  async deleteByDeviceId(deviceId: string): Promise<void> {
    await this.DeviceAuthSessionModel.deleteOne({ deviceId });
  }

  async deleteUserDeviceAuthSessionsExceptCurrent(
    userId: string,
    currentDeviceId: string,
  ): Promise<void> {
    await this.DeviceAuthSessionModel.deleteMany({
      userId,
      deviceId: { $ne: currentDeviceId },
    });
  }
}
