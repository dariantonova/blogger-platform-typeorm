import { LikeStatus } from '../dto/like-status';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';
import { CreateCommentLikeDomainDto } from './dto/create-comment-like.domain-dto';
import { CommentLikeRow } from '../infrastructure/dto/comment-like.row';

export class CommentLike {
  id: number;
  commentId: number;
  userId: number;
  status: LikeStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreateCommentLikeDomainDto): CommentLike {
    const like = new CommentLike();

    like.commentId = dto.commentId;
    like.userId = dto.userId;
    like.status = dto.status;
    like.createdAt = new Date();
    like.updatedAt = new Date();
    like.deletedAt = null;

    return like;
  }

  static reconstitute(row: CommentLikeRow): CommentLike {
    const like = new CommentLike();

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
