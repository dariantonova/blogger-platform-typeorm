import { DeviceAuthSession } from '../../domain/device-auth-session.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToViewEntity(entity: DeviceAuthSession): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = entity.ip;
    dto.title = entity.deviceName;
    dto.lastActiveDate = entity.iat.toISOString();
    dto.deviceId = entity.deviceId;

    return dto;
  }
}
