import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user-accounts/user.entity';
import { Comment } from './comment.entity';
import { CreateCommentLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/create-comment-like.domain-dto';
import { UpdateLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/update-like.domain.dto';

@Entity()
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
      throw new Error('Comment like is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
  }
}
