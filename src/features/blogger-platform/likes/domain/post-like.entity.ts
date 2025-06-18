import { LikeStatus } from '../dto/like-status';
import { CreatePostLikeDomainDto } from './dto/create-post-like.domain-dto';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';
import { PostLikeRow } from '../infrastructure/dto/post-like.row';

export class PostLike {
  id: number;
  postId: number;
  userId: number;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreatePostLikeDomainDto): PostLike {
    const like = new PostLike();

    like.postId = dto.postId;
    like.userId = dto.userId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.updatedAt = new Date();
    like.deletedAt = null;

    return like;
  }

  static reconstitute(row: PostLikeRow): PostLike {
    const like = new PostLike();

    like.id = row.id;
    like.postId = row.post_id;
    like.userId = row.user_id;
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
