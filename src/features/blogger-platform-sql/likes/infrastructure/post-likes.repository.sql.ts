import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MakePostLikeOperationDtoSql } from '../dto/make-post-like-operation.dto.sql';

@Injectable()
export class PostLikesRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updatePostLike(dto: MakePostLikeOperationDtoSql): Promise<void> {
    const createOrUpdateQuery = `
    INSERT INTO post_likes
    (post_id, user_id, status)
    VALUES ($1, $2, $3)
    ON CONFLICT (post_id, user_id)
    DO UPDATE SET
    status = EXCLUDED.status,
    updated_at = now();
    `;
    await this.dataSource.query(createOrUpdateQuery, [
      dto.postId,
      dto.userId,
      dto.likeStatus,
    ]);
  }
}
