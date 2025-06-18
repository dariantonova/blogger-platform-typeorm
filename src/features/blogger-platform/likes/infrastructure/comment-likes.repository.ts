import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getValuesFromDtoToUpdate } from '../../../../common/utils/sql/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../../common/utils/sql/build-update-set-clause';
import { CommentLike } from '../domain/comment-like.entity';

export class CommentLikesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(like: CommentLike): Promise<CommentLike> {
    if (!like.id) {
      await this.createCommentLike(like);
    } else {
      const { id, ...dtoToUpdate } = like;
      await this.updateCommentLike(id, dtoToUpdate);
    }

    return like;
  }

  async findByUserAndComment(
    userId: number,
    commentId: number,
  ): Promise<CommentLike | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE cl.deleted_at IS NULL
    AND cl.user_id = $1
    AND cl.comment_id = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      userId,
      commentId,
    ]);

    return findResult[0] ? CommentLike.reconstitute(findResult[0]) : null;
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

  async softDeleteByUserId(userId: number): Promise<void> {
    const updateQuery = `
    UPDATE comment_likes
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND user_id = $1;
    `;
    await this.dataSource.query(updateQuery, [userId]);
  }

  async softDeleteLikesOfCommentsWithUserId(userId: number): Promise<void> {
    const commentIdsCte = `
    SELECT c.id
    FROM comments c
    WHERE c.user_id = $1
    `;

    const updateQuery = `
    WITH comment_ids AS (${commentIdsCte})
    UPDATE comment_likes
    SET deleted_at = now()
    FROM comment_ids ci
    WHERE deleted_at IS NULL
    AND comment_id IN (ci.id);
    `;
    await this.dataSource.query(updateQuery, [userId]);
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    cl.id, cl.comment_id, cl.user_id, cl.status, cl.created_at, cl.updated_at, cl.deleted_at
    FROM comment_likes cl
    `;
  }

  private async createCommentLike(like: CommentLike): Promise<void> {
    const createQuery = `
    INSERT INTO comment_likes
    (comment_id, user_id, status, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      like.commentId,
      like.userId,
      like.status,
      like.createdAt,
      like.updatedAt,
      like.deletedAt,
    ]);

    like.id = createResult[0].id;
  }

  private async updateCommentLike(
    id: number,
    dtoToUpdate: Partial<CommentLike>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE comment_likes
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }
}
