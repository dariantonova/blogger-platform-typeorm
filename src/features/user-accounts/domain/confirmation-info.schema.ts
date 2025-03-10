import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class ConfirmationInfo {
  @Prop({
    type: String,
    default: '',
  })
  confirmationCode: string;

  @Prop({
    type: Date,
    required: true,
  })
  expirationDate: Date;

  @Prop({
    type: Boolean,
    required: true,
  })
  isConfirmed: boolean;
}

export const ConfirmationInfoSchema =
  SchemaFactory.createForClass(ConfirmationInfo);
