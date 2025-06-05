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

  async softDeleteLikesOfPostsWithBlogId(blogId: number): Promise<void> {
    const postIdsCte = `
    SELECT p.id
    FROM posts p
    WHERE p.blog_id = $1
    `;

    const updateQuery = `
    WITH post_ids AS (${postIdsCte})
    UPDATE post_likes
    SET deleted_at = now()
    FROM post_ids pi
    WHERE deleted_at IS NULL
    AND post_id IN (pi.id);
    `;
    await this.dataSource.query(updateQuery, [blogId]);
  }

  async softDeleteByPostId(postId: number): Promise<void> {
    const updateQuery = `
    UPDATE post_likes
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND post_id = $1;
    `;
    await this.dataSource.query(updateQuery, [postId]);
  }
}
