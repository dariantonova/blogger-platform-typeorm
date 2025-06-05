import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { MakeCommentLikeOperationDtoSql } from '../dto/make-comment-like-operation.dto.sql';

@Injectable()
export class CommentLikesRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateCommentLike(dto: MakeCommentLikeOperationDtoSql): Promise<void> {
    const createOrUpdateQuery = `
    INSERT INTO comment_likes
    (comment_id, user_id, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (comment_id, user_id)
    DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = now();
    `;
    await this.dataSource.query(createOrUpdateQuery, [
      dto.commentId,
      dto.userId,
      dto.likeStatus,
    ]);
  }

  async softDeleteLikesOfCommentsWithBlogId(blogId: number): Promise<void> {
    const commentIdsCte = `
    SELECT c.id
    FROM comments c
    JOIN posts p ON c.post_id = p.id
    WHERE p.blog_id = $1
    `;

    const updateQuery = `
    WITH comment_ids AS (${commentIdsCte})
    UPDATE comment_likes
    SET deleted_at = now()
    FROM comment_ids ci
    WHERE deleted_at IS NULL
    AND comment_id IN (ci.id);
    `;
    await this.dataSource.query(updateQuery, [blogId]);
  }

  async softDeleteLikesOfCommentsWithPostId(postId: number): Promise<void> {
    const commentIdsCte = `
    SELECT c.id
    FROM comments c
    WHERE c.post_id = $1
    `;

    const updateQuery = `
    WITH comment_ids AS (${commentIdsCte})
    UPDATE comment_likes
    SET deleted_at = now()
    FROM comment_ids ci
    WHERE deleted_at IS NULL
    AND comment_id IN (ci.id);
    `;
    await this.dataSource.query(updateQuery, [postId]);
  }

  async softDeleteByCommentId(commentId: number): Promise<void> {
    const updateQuery = `
    UPDATE comment_likes
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND comment_id = $1;
    `;
    await this.dataSource.query(updateQuery, [commentId]);
  }
}
