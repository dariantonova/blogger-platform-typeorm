import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { User } from '../user-accounts/user.entity';
import { Comment } from './comment.entity';

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

  // static createInstance(dto: CreateCommentLikeDomainDto): CommentLike {
  //   const like = new CommentLike();
  //
  //   like.commentId = dto.commentId;
  //   like.userId = dto.userId;
  //   like.status = dto.status;
  //   like.createdAt = new Date();
  //   like.updatedAt = new Date();
  //   like.deletedAt = null;
  //
  //   return like;
  // }
  //
  // static reconstitute(row: CommentLikeRow): CommentLike {
  //   const like = new CommentLike();
  //
  //   like.id = row.id;
  //   like.commentId = row.comment_id;
  //   like.userId = row.user_id;
  //   like.status = row.status;
  //   like.createdAt = row.created_at;
  //   like.updatedAt = row.updated_at;
  //   like.deletedAt = row.deleted_at;
  //
  //   return like;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Comment like is already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // update(dto: UpdateLikeDomainDto) {
  //   this.status = dto.status;
  //   this.updatedAt = new Date();
  // }
}
