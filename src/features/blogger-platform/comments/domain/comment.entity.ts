import { UpdateCommentDto } from '../dto/update-comment.dto';
import { CommentRow } from '../infrastructure/dto/comment.row';
import { CreateCommentDto } from '../dto/create-comment.dto';

export class Comment {
  id: number;
  content: string;
  postId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

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

  static reconstitute(row: CommentRow): Comment {
    const comment = new Comment();

    comment.id = row.id;
    comment.content = row.content;
    comment.postId = row.post_id;
    comment.userId = row.user_id;
    comment.createdAt = row.created_at;
    comment.updatedAt = row.updated_at;
    comment.deletedAt = row.deleted_at;

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
    this.updatedAt = new Date();
  }
}
