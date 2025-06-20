import { LikeStatus } from '../../../blogger-platform/likes/dto/like-status';
import { Column, Entity, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Post } from './post.entity';
import { User } from '../user-accounts/user.entity';
import { CreatePostLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/create-post-like.domain-dto';
import { UpdateLikeDomainDto } from '../../../blogger-platform/likes/domain/dto/update-like.domain.dto';

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

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Post like is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateLikeDomainDto) {
    this.status = dto.status;
  }
}
