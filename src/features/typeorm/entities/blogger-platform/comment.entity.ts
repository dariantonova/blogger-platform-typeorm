import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../base.entity';
import { Post } from './post.entity';
import { User } from '../user-accounts/user.entity';

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

  // static createInstance(dto: CreateCommentDto): Comment {
  //   const comment = new Comment();
  //
  //   comment.content = dto.content;
  //   comment.postId = dto.postId;
  //   comment.userId = dto.userId;
  //   comment.createdAt = new Date();
  //   comment.updatedAt = new Date();
  //   comment.deletedAt = null;
  //
  //   return comment;
  // }
  //
  // static reconstitute(row: CommentRow): Comment {
  //   const comment = new Comment();
  //
  //   comment.id = row.id;
  //   comment.content = row.content;
  //   comment.postId = row.post_id;
  //   comment.userId = row.user_id;
  //   comment.createdAt = row.created_at;
  //   comment.updatedAt = row.updated_at;
  //   comment.deletedAt = row.deleted_at;
  //
  //   return comment;
  // }
  //
  // makeDeleted() {
  //   if (this.deletedAt !== null) {
  //     throw new Error('Comment is already deleted');
  //   }
  //   this.deletedAt = new Date();
  // }
  //
  // update(dto: UpdateCommentDto) {
  //   this.content = dto.content;
  //   this.updatedAt = new Date();
  // }
}
