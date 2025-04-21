import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateDeviceAuthSessionDomainDto } from './dto/create-device-auth-session.domain.dto';

@Schema()
export class DeviceAuthSession {
  @Prop({
    type: String,
    required: true,
  })
  deviceId: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: Date,
    required: true,
  })
  exp: Date;

  @Prop({
    type: Date,
    required: true,
  })
  iat: Date;

  @Prop({
    type: String,
    required: true,
  })
  deviceName: string;

  @Prop({
    type: String,
    required: true,
  })
  ip: string;

  static createInstance(
    dto: CreateDeviceAuthSessionDomainDto,
  ): DeviceAuthSessionDocument {
    const session = new this();

    session.deviceId = dto.deviceId;
    session.userId = dto.userId;
    session.exp = dto.exp;
    session.iat = dto.iat;
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;

    return session as DeviceAuthSessionDocument;
  }
}

export const DeviceAuthSessionSchema =
  SchemaFactory.createForClass(DeviceAuthSession);

DeviceAuthSessionSchema.loadClass(DeviceAuthSession);

export type DeviceAuthSessionDocument = HydratedDocument<DeviceAuthSession>;

export type DeviceAuthSessionModelType = Model<DeviceAuthSessionDocument> &
  typeof DeviceAuthSession;
