import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Post } from './post.entity';
import { User } from '../user-accounts/user.entity';

@Entity()
@Unique(['postId', 'userId'])
export class PostLike extends BaseEntity {
  @Column({ type: 'enum', enum: LikeStatus })
  status: LikeStatus;

  @ManyToOne(() => Post)
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  // static createInstance(dto: CreatePostLikeDomainDto): PostLike {
  //   const like = new PostLike();
  //
  //   like.postId = dto.postId;
  //   like.userId = dto.userId;
  //   like.status = dto.status;
  //   like.createdAt = new Date();
  //   like.updatedAt = new Date();
  //   like.deletedAt = null;
  //
  //   return like;
  // }
  //
  // static reconstitute(row: PostLikeRow): PostLike {
  //   const like = new PostLike();
  //
  //   like.id = row.id;
  //   like.postId = row.post_id;
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
  //     throw new Error('Post like is already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // update(dto: UpdateLikeDomainDto) {
  //   this.status = dto.status;
  //   this.updatedAt = new Date();
  // }
}
