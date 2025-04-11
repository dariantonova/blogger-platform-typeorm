import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Like, LikeDocument, LikeModelType } from '../domain/like.entity';
import { LikeStatus } from '../dto/like-status';
import { FilterQuery } from 'mongoose';

@Injectable()
export class LikesRepository {
  constructor(
    @InjectModel(Like.name)
    private LikeModel: LikeModelType,
  ) {}

  async findByUserAndParent(
    userId: string,
    parentId: string,
  ): Promise<LikeDocument | null> {
    return this.LikeModel.findOne({
      userId,
      parentId,
      deletedAt: null,
    });
  }

  async save(like: LikeDocument): Promise<void> {
    await like.save();
  }

  async countLikesOfParent(parentId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      status: LikeStatus.Like,
      parentId,
      deletedAt: null,
    });
  }

  async countDislikesOfParent(parentId: string): Promise<number> {
    return this.LikeModel.countDocuments({
      status: LikeStatus.Dislike,
      parentId,
      deletedAt: null,
    });
  }

  async countLikesAndDislikesOfParent(parentId: string): Promise<{
    likesCount: number;
    dislikesCount: number;
  }> {
    const likesCount = await this.countLikesOfParent(parentId);
    const dislikesCount = await this.countDislikesOfParent(parentId);

    return { likesCount, dislikesCount };
  }

  async findNewestLikesOfParent(
    parentId: string,
    quantity: number,
  ): Promise<LikeDocument[]> {
    const filter: FilterQuery<Like> = {
      status: LikeStatus.Like,
      parentId,
      deletedAt: null,
    };

    return this.LikeModel.find(filter)
      .sort({ createdAt: -1, _id: 1 })
      .limit(quantity);
  }
}
