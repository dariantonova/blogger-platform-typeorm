import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from './commentator-info.schema';
import {
  BaseLikesInfo,
  BaseLikesInfoSchema,
} from '../../common/schemas/base-likes-info.schema';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Comment {
  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  postId: string;

  @Prop({
    type: CommentatorInfoSchema,
  })
  commentatorInfo: CommentatorInfo;

  @Prop({
    type: BaseLikesInfoSchema,
  })
  likesInfo: BaseLikesInfo;

  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Date,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
