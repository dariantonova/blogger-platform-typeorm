export class CreateDeviceAuthSessionDomainDto {
  deviceId: string;
  userId: string;
  exp: Date;
  iat: Date;
  deviceName: string;
  ip: string;
}
