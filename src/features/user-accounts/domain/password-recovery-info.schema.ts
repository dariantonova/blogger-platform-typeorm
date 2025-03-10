import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class PasswordRecoveryInfo {
  @Prop({
    type: String,
    default: '',
  })
  recoveryCodeHash: string;

  @Prop({
    type: Date,
    required: true,
  })
  expirationDate: Date;
}

export const PasswordRecoveryInfoSchema =
  SchemaFactory.createForClass(PasswordRecoveryInfo);
