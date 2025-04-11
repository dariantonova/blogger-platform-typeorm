import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
} from '../../common/schemas/extended-likes-info.schema';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDomainDto } from './dto/create-post.domain.dto';
import { UpdatePostDomainDto } from './dto/update-post.domain.dto';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};

export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 100,
};

export const contentConstraints = {
  minLength: 1,
  maxLength: 1000,
};

@Schema({ timestamps: true })
export class Post {
  @Prop({
    type: String,
    required: true,
    ...titleConstraints,
  })
  title: string;

  @Prop({
    type: String,
    required: true,
    ...shortDescriptionConstraints,
  })
  shortDescription: string;

  @Prop({
    type: String,
    required: true,
    ...contentConstraints,
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

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdatePostDomainDto) {
    this.title = dto.title;
    this.shortDescription = dto.shortDescription;
    this.content = dto.content;
    this.blogId = dto.blogId;
    this.blogName = dto.blogName;
  }

  updateBlogName(blogName: string) {
    this.blogName = blogName;
  }

  updateExtendedLikesInfo(extendedLikesInfo: ExtendedLikesInfo) {
    this.extendedLikesInfo.likesCount = extendedLikesInfo.likesCount;
    this.extendedLikesInfo.dislikesCount = extendedLikesInfo.dislikesCount;
    this.extendedLikesInfo.newestLikes = extendedLikesInfo.newestLikes;
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.loadClass(Post);

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & typeof Post;
