import { CreateCommentDto } from '../../../blogger-platform/comments/dto/create-comment.dto';
import { UpdateCommentDto } from '../../../blogger-platform/comments/dto/update-comment.dto';
import { CommentRowWrap } from '../infrastructure/dto/comment.row.wrap';

export class CommentWrap {
  id: string;
  content: string;
  postId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  static createInstance(dto: CreateCommentDto): CommentWrap {
    const comment = new CommentWrap();

    comment.content = dto.content;
    comment.postId = dto.postId;
    comment.userId = dto.userId;
    comment.createdAt = new Date();
    comment.updatedAt = new Date();
    comment.deletedAt = null;

    return comment;
  }

  static reconstitute(row: CommentRowWrap): CommentWrap {
    const comment = new CommentWrap();

    comment.id = row.id.toString();
    comment.content = row.content;
    comment.postId = row.post_id.toString();
    comment.userId = row.user_id.toString();
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
