export class CreateDeviceAuthSessionRepoDto {
  deviceId: string;
  userId: number;
  exp: Date;
  iat: Date;
  deviceName: string;
  ip: string;
}
