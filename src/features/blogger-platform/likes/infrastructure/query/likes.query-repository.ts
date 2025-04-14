import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Like, LikeModelType } from '../../domain/like.entity';
import { LikeStatus } from '../../dto/like-status';

@Injectable()
export class LikesQueryRepository {
  constructor(@InjectModel(Like.name) private LikeModel: LikeModelType) {}

  async findLikeStatus(userId: string, parentId: string): Promise<LikeStatus> {
    const like = await this.LikeModel.findOne({
      userId,
      parentId,
      deletedAt: null,
    });
    return like?.status ?? LikeStatus.None;
  }
}
