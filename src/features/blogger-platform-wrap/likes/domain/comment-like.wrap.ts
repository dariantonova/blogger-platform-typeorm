import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { UpdateLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/update-like.domain.dto';
import { CreateCommentLikeDomainDto } from './dto/create-comment-like.domain-dto';
import { CommentLikeRowWrap } from '../infrastructure/dto/comment-like.row.wrap';

export class CommentLikeWrap {
  id: number;
  commentId: number;
  userId: number;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreateCommentLikeDomainDto): CommentLikeWrap {
    const like = new CommentLikeWrap();

    like.commentId = dto.commentId;
    like.userId = dto.userId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.updatedAt = new Date();
    like.deletedAt = null;

    return like;
  }

  static reconstitute(row: CommentLikeRowWrap): CommentLikeWrap {
    const like = new CommentLikeWrap();

    like.id = row.id;
    like.commentId = row.comment_id;
    like.userId = row.user_id;
    like.status = row.status;
    like.createdAt = row.created_at;
    like.updatedAt = row.updated_at;
    like.deletedAt = row.deleted_at;

    return like;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Comment like is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
    this.updatedAt = new Date();
  }
}
