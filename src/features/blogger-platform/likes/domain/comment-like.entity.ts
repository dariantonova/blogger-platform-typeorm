import { LikeStatus } from '../dto/like-status';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../../../common/domain/base.entity';
import { User } from '../../../user-accounts/domain/user.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { CreateCommentLikeDomainDto } from './dto/create-comment-like.domain-dto';
import { UpdateLikeDomainDto } from './dto/update-like.domain.dto';
import { DomainException } from '../../../../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-code';

@Entity({ name: 'comment_likes' })
@Unique(['commentId', 'userId'])
export class CommentLike extends BaseEntity {
  @Column({ type: 'enum', enum: LikeStatus })
  status: LikeStatus;

  @ManyToOne(() => Comment)
  comment: Comment;

  @Column()
  commentId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

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

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'Comment like is already deleted',
      });
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
  }
}
