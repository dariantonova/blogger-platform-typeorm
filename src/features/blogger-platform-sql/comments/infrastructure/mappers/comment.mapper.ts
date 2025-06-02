import { CommentDtoSql } from '../../dto/comment.dto.sql';

export class CommentRow {
  id: number;
  content: string;
  post_id: number;
  user_id: number;
  user_login: string;
  created_at: Date;
  updated_at: Date;
  likes_count: number;
  dislikes_count: number;
}

export const mapCommentRowToDto = (row: CommentRow): CommentDtoSql => {
  return {
    id: row.id,
    content: row.content,
    postId: row.post_id,
    commentatorInfo: {
      userId: row.user_id,
      userLogin: row.user_login,
    },
    likesInfo: {
      likesCount: row.likes_count,
      dislikesCount: row.dislikes_count,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};
