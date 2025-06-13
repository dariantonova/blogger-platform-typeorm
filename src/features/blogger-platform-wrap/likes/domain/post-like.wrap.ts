import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { CreatePostLikeDomainDto } from './dto/create-post-like.domain-dto';
import { UpdateLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/update-like.domain.dto';
import { PostLikeRowWrap } from '../infrastructure/dto/post-like.row.wrap';

export class PostLikeWrap {
  id: string;
  postId: string;
  userId: string;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreatePostLikeDomainDto): PostLikeWrap {
    const like = new PostLikeWrap();

    like.postId = dto.postId;
    like.userId = dto.userId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.updatedAt = new Date();
    like.deletedAt = null;

    return like;
  }

  static reconstitute(row: PostLikeRowWrap): PostLikeWrap {
    const like = new PostLikeWrap();

    like.id = row.id.toString();
    like.postId = row.post_id.toString();
    like.userId = row.user_id.toString();
    like.status = row.status;
    like.createdAt = row.created_at;
    like.updatedAt = row.updated_at;
    like.deletedAt = row.deleted_at;

    return like;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post like is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
    this.updatedAt = new Date();
  }
}
