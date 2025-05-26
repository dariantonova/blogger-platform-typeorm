import { DeviceAuthSessionDtoSql } from '../../dto/device-auth-session.dto.sql';

export class DeviceAuthSessionRow {
  id: number;
  device_id: string;
  user_id: number;
  exp: Date;
  iat: Date;
  device_name: string;
  ip: string;
}

export const mapDeviceAuthSessionRowToDto = (
  row: DeviceAuthSessionRow,
): DeviceAuthSessionDtoSql => {
  return {
    id: row.id,
    deviceId: row.device_id,
    userId: row.user_id,
    exp: row.exp,
    iat: row.iat,
    deviceName: row.device_name,
    ip: row.ip,
  };
};
