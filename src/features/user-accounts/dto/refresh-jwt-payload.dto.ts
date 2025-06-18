export class RefreshJwtPayloadDto {
  userId: number;
  deviceId: string;
  exp: number;
  iat: number;
}
