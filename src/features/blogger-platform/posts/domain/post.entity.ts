import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from '../../common/schemas/extended-likes-info.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';

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

  static createInstance(dto: CreatePostDomainDto): PostDocument {
    const post = new this();

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = dto.blogName;
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };
    post.deletedAt = null;

    return post as PostDocument;
  }

  update(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.shortDescription;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
