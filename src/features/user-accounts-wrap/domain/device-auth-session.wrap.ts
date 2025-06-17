import { UpdateDeviceAuthSessionDomainDto } from '../../user-accounts/domain/dto/update-device-auth-session.domain.dto';
import { DeviceAuthSessionRowWrap } from '../infrastructure/dto/device-auth-session.row.wrap';
import { CreateDeviceAuthSessionDomainDtoWrap } from './dto/create-device-auth-session.domain-dto.wrap';

export class DeviceAuthSessionWrap {
  id: number;
  deviceId: string;
  userId: number;
  exp: Date;
  iat: Date;
  deviceName: string;
  ip: string;

  static createInstance(
    dto: CreateDeviceAuthSessionDomainDtoWrap,
  ): DeviceAuthSessionWrap {
    const session = new DeviceAuthSessionWrap();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.exp = dto.exp;
    session.iat = dto.iat;
    session.deviceName = dto.deviceName;
    session.ip = dto.ip;

    return session;
  }

  static reconstitute(row: DeviceAuthSessionRowWrap): DeviceAuthSessionWrap {
    const session = new DeviceAuthSessionWrap();

    session.id = row.id;
    session.deviceId = row.device_id;
    session.userId = row.user_id;
    session.exp = row.exp;
    session.iat = row.iat;
    session.deviceName = row.device_name;
    session.ip = row.ip;

    return session;
  }

  update(dto: UpdateDeviceAuthSessionDomainDto) {
    this.exp = dto.exp;
    this.iat = dto.iat;
    this.ip = dto.ip;
  }
}
