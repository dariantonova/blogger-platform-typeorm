import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class BaseLikesInfo {
  @Prop({
    type: Number,
    required: true,
  })
  likesCount: number;

  @Prop({
    type: Number,
    required: true,
  })
  dislikesCount: number;
}

export const BaseLikesInfoSchema = SchemaFactory.createForClass(BaseLikesInfo);
