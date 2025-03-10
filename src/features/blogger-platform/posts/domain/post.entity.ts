import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from '../../common/schemas/extended-likes-info.schema';
import { HydratedDocument, Model } from 'mongoose';

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({
    type: String,
    required: true,
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: true,
  })
  content: string;

  @Prop({
    type: String,
    required: true,
  })
  blogId: string;

  @Prop({
    type: String,
    required: true,
  })
  blogName: string;

  @Prop({
    type: ExtendedLikesInfoSchema,
  })
  extendedLikesInfo: ExtendedLikesInfo;

  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Date,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
