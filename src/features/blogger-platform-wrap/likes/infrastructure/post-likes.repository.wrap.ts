import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostLikeWrap } from '../domain/post-like.wrap';
import { getValuesFromDtoToUpdate } from '../../../wrap/utils/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../wrap/utils/build-update-set-clause';

export class PostLikesRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(like: PostLikeWrap): Promise<PostLikeWrap> {
    if (!like.id) {
      await this.createPostLike(like);
    } else {
      const { id, ...dtoToUpdate } = like;
      await this.updatePostLike(+id, dtoToUpdate);
    }

    return like;
  }

  async findByUserAndPost(
    userId: string,
    postId: string,
  ): Promise<PostLikeWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE pl.deleted_at IS NULL
    AND pl.user_id = $1
    AND pl.post_id = $2;
    `;
    const findResult = await this.dataSource.query(findQuery, [
      +userId,
      +postId,
    ]);

    return findResult[0] ? PostLikeWrap.reconstitute(findResult[0]) : null;
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    pl.id, pl.post_id, pl.user_id, pl.status, pl.created_at, pl.updated_at, pl.deleted_at
    FROM post_likes pl
    `;
  }

  private async createPostLike(like: PostLikeWrap): Promise<void> {
    const createQuery = `
    INSERT INTO post_likes
    (post_id, user_id, status, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      like.postId,
      like.userId,
      like.status,
      like.createdAt,
      like.updatedAt,
      like.deletedAt,
    ]);

    like.id = createResult[0].id.toString();
  }

  private async updatePostLike(
    id: number,
    dtoToUpdate: Partial<PostLikeWrap>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE post_likes
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }
}
