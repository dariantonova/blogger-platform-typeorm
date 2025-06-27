import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeviceAuthSession } from '../domain/device-auth-session.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class DeviceAuthSessionsRepo {
  constructor(
    @InjectRepository(DeviceAuthSession)
    private deviceAuthSessionsRepository: Repository<DeviceAuthSession>,
  ) {}

  async save(session: DeviceAuthSession): Promise<DeviceAuthSession> {
    return this.deviceAuthSessionsRepository.save(session);
  }

  async findByDeviceIdAndIatAndUserId(
    deviceId: string,
    iat: Date,
    userId: number,
  ): Promise<DeviceAuthSession | null> {
    return this.deviceAuthSessionsRepository.findOne({
      where: { deviceId, iat, userId },
    });
  }

  async findByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<DeviceAuthSession | null> {
    return this.deviceAuthSessionsRepository.findOne({
      where: { deviceId, userId },
    });
  }

  async findByDeviceIdAndUserIdOrInternalFail(
    deviceId: string,
    userId: number,
  ): Promise<DeviceAuthSession> {
    const session = await this.findByDeviceIdAndUserId(deviceId, userId);

    if (!session) {
      throw new Error('Device auth session not found');
    }

    return session;
  }

  async findManyByDeviceId(deviceId: string): Promise<DeviceAuthSession[]> {
    return this.deviceAuthSessionsRepository.find({ where: { deviceId } });
  }

  async deleteUserDeviceAuthSessions(userId: number): Promise<void> {
    await this.deviceAuthSessionsRepository.delete({ userId });
  }

  async deleteByDeviceIdAndUserId(
    deviceId: string,
    userId: number,
  ): Promise<void> {
    await this.deviceAuthSessionsRepository.delete({ deviceId, userId });
  }

  async deleteUserDeviceAuthSessionsExceptCurrent(
    userId: number,
    currentDeviceId: string,
  ): Promise<void> {
    await this.deviceAuthSessionsRepository.delete({
      userId,
      deviceId: Not(currentDeviceId),
    });
  }
}
