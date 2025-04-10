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
import { CreateCommentDomainDto } from './dto/create-comment.domain.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
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

  static createInstance(dto: CreateCommentDomainDto): CommentDocument {
    const comment = new this();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.commentatorInfo = {
      userId: dto.userId,
      userLogin: dto.userLogin,
    };
    comment.likesInfo = {
      likesCount: 0,
      dislikesCount: 0,
    };
    comment.deletedAt = null;

    return comment as CommentDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Comment is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateCommentDto) {
    this.content = dto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.loadClass(Comment);

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> & typeof Comment;
