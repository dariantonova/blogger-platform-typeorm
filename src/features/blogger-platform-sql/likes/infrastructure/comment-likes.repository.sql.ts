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
}
