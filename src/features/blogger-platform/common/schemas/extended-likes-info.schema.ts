import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BaseLikesInfo } from './base-likes-info.schema';
import { LikeDetails, LikeDetailsSchema } from './like-details.schema';

@Schema({ _id: false })
export class ExtendedLikesInfo extends BaseLikesInfo {
  @Prop({
    type: LikeDetailsSchema,
  })
  newestLikes: LikeDetails[];
}

export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);
