import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../dto/like-status';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDomainDto } from './dto/create-like.domain.dto';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';

@Schema({ timestamps: true })
export class Like {
  @Prop({
    type: String,
    required: true,
  })
  parentId: string;

  @Prop({
    type: String,
    required: true,
  })
  userId: string;

  @Prop({
    type: String,
    enum: LikeStatus,
    required: true,
  })
  status: LikeStatus;

  createdAt: Date;
  updatedAt: Date;

  @Prop({
    type: Date,
    nullable: true,
    default: null,
  })
  deletedAt: Date | null;

  static createInstance(dto: CreateLikeDomainDto): LikeDocument {
    const like = new this();

    like.parentId = dto.parentId;
    like.userId = dto.userId;
    like.status = dto.status;
    like.deletedAt = null;

    return like as LikeDocument;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Like is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
  }
}

export const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.loadClass(Like);

export type LikeDocument = HydratedDocument<Like>;

export type LikeModelType = Model<LikeDocument> & typeof Like;
