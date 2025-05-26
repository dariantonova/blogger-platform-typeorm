import { DeviceAuthSessionDtoSql } from '../../dto/device-auth-session.dto.sql';

export class DeviceViewDtoSql {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToView(
    deviceAuthSession: DeviceAuthSessionDtoSql,
  ): DeviceViewDtoSql {
    const dto = new DeviceViewDtoSql();

    dto.ip = deviceAuthSession.ip;
    dto.title = deviceAuthSession.deviceName;
    dto.lastActiveDate = deviceAuthSession.iat.toISOString();
    dto.deviceId = deviceAuthSession.deviceId;

    return dto;
  }
}
