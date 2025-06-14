import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentWrap } from '../domain/comment.wrap';
import { getValuesFromDtoToUpdate } from '../../../wrap/utils/get-values-from-dto-to-update';
import { buildUpdateSetClause } from '../../../wrap/utils/build-update-set-clause';

@Injectable()
export class CommentsRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async save(comment: CommentWrap): Promise<CommentWrap> {
    if (!comment.id) {
      await this.createComment(comment);
    } else {
      const { id, ...dtoToUpdate } = comment;
      await this.updateComment(+id, dtoToUpdate);
    }

    return comment;
  }

  async findById(id: string): Promise<CommentWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE c.deleted_at IS NULL
    AND c.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [+id]);

    return findResult[0] ? CommentWrap.reconstitute(findResult[0]) : null;
  }

  async findByIdOrNotFoundFail(id: string): Promise<CommentWrap> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async softDeleteCommentsOfPostsWithBlogId(blogId: string): Promise<void> {
    const postIdsCte = `
    SELECT p.id
    FROM posts p
    WHERE p.blog_id = $1
    `;

    const updateQuery = `
    WITH post_ids AS (${postIdsCte})
    UPDATE comments
    SET deleted_at = now()
    FROM post_ids pi
    WHERE deleted_at IS NULL
    AND post_id IN (pi.id);
    `;
    await this.dataSource.query(updateQuery, [+blogId]);
  }

  async softDeleteByPostId(postId: string): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND post_id = $1;
    `;
    await this.dataSource.query(updateQuery, [+postId]);
  }

  async softDeleteByUserId(userId: string): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND user_id = $1;
    `;
    await this.dataSource.query(updateQuery, [+userId]);
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    c.id, c.content, c.post_id, c.user_id, c.created_at, c.updated_at, c.deleted_at
    FROM comments c
    `;
  }

  private async createComment(comment: CommentWrap): Promise<void> {
    const createQuery = `
    INSERT INTO comments
    (content, post_id, user_id, created_at, updated_at, deleted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      comment.content,
      comment.postId,
      comment.userId,
      comment.createdAt,
      comment.updatedAt,
      comment.deletedAt,
    ]);

    comment.id = createResult[0].id.toString();
  }

  private async updateComment(
    id: number,
    dtoToUpdate: Partial<CommentWrap>,
  ): Promise<void> {
    const newValues = getValuesFromDtoToUpdate(dtoToUpdate);
    const updateSetClause = buildUpdateSetClause(dtoToUpdate);

    const updateQuery = `
    UPDATE comments
    ${updateSetClause}
    WHERE id = $${newValues.length + 1};
    `;
    await this.dataSource.query(updateQuery, [...newValues, id]);
  }
}
