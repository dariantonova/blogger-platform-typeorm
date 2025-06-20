import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Post } from './post.entity';
import { User } from '../user-accounts/user.entity';
import { CreateCommentDto } from '../../../blogger-platform/comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../../../blogger-platform/comments/dto/update-comment.dto';

@Entity()
export class Comment extends BaseEntity {
  @Column()
  content: string;

  @ManyToOne(() => Post)
  post: Post;

  @Column()
  postId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  static createInstance(dto: CreateCommentDto): Comment {
    const comment = new Comment();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.userId = dto.userId;
    comment.createdAt = new Date();
    comment.updatedAt = new Date();
    comment.deletedAt = null;

    return comment;
  }

  makeDeleted() {
    if (this.deletedAt !== null) {
      throw new Error('Comment is already deleted');
    }
    this.deletedAt = new Date();
  }

  update(dto: UpdateCommentDto) {
    this.content = dto.content;
  }
}
