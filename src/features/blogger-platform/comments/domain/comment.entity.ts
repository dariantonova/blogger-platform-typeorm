import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/domain/base.entity';
import { Post } from '../../posts/domain/post.entity';
import { User } from '../../../user-accounts/domain/user.entity';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { UpdateCommentDto } from '../dto/update-comment.dto';

@Entity({ name: 'comments' })
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
