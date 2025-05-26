export class DeviceAuthSessionDtoSql {
  id: number;
  deviceId: string;
  userId: number;
  exp: Date;
  iat: Date;
  deviceName: string;
  ip: string;
}
