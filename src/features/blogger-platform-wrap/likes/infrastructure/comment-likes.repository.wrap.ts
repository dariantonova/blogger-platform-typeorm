import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { getValuesFromDtoToUpdate } from '../../../wrap/utils/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../wrap/utils/build-update-set-clause';
import { CommentLikeWrap } from '../domain/comment-like.wrap';

export class CommentLikesRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(like: CommentLikeWrap): Promise<CommentLikeWrap> {
    if (!like.id) {
      await this.createCommentLike(like);
    } else {
      const { id, ...dtoToUpdate } = like;
      await this.updateCommentLike(+id, dtoToUpdate);
    }

    return like;
  }

  async findByUserAndPost(
    userId: string,
    commentId: string,
  ): Promise<CommentLikeWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE cl.deleted_at IS NULL
    AND cl.user_id = $1
    AND cl.comment_id = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      +userId,
      +commentId,
    ]);

    return findResult[0] ? CommentLikeWrap.reconstitute(findResult[0]) : null;
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    cl.id, cl.comment_id, cl.user_id, cl.status, cl.created_at, cl.updated_at, cl.deleted_at
    FROM comment_likes cl
    `;
  }

  private async createCommentLike(like: CommentLikeWrap): Promise<void> {
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

    like.id = createResult[0].id.toString();
  }

  private async updateCommentLike(
    id: number,
    dtoToUpdate: Partial<CommentLikeWrap>,
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
