import { DeviceAuthSessionViewRow } from '../../infrastructure/query/dto/device-auth-session.view-row';
import { DeviceAuthSession } from '../../../typeorm/entities/user-accounts/device-auth-session.entity';

export class DeviceViewDto {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;

  static mapToViewWrap(row: DeviceAuthSessionViewRow): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = row.ip;
    dto.title = row.device_name;
    dto.lastActiveDate = row.iat.toISOString();
    dto.deviceId = row.device_id;

    return dto;
  }

  static mapToViewEntity(entity: DeviceAuthSession): DeviceViewDto {
    const dto = new DeviceViewDto();

    dto.ip = entity.ip;
    dto.title = entity.deviceName;
    dto.lastActiveDate = entity.iat.toISOString();
    dto.deviceId = entity.deviceId;

    return dto;
  }
}
