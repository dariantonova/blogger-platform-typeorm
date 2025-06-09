import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCommentDtoSql } from '../dto/create-comment.dto.sql';
import { buildWhereClause } from '../../../../common/utils/sql/build-where-clause';
import { CommentDtoSql } from '../dto/comment.dto.sql';
import { mapCommentRowToDto } from './mappers/comment.mapper';
import { UpdateCommentDto } from '../../../blogger-platform/comments/dto/update-comment.dto';

@Injectable()
export class CommentsRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createComment(dto: CreateCommentDtoSql): Promise<number> {
    const createQuery = `
    INSERT INTO comments
    (content, post_id, user_id)
    VALUES ($1, $2, $3)
    RETURNING id;
    `;
    const createResult = await this.dataSource.query(createQuery, [
      dto.content,
      dto.postId,
      dto.userId,
    ]);

    return createResult[0].id;
  }

  async findById(id: number): Promise<CommentDtoSql | null> {
    const whereParts = ['c.deleted_at IS NULL', 'c.id = $1'];
    const whereClause = buildWhereClause(whereParts);

    const findSql = this.getCommentsSelectSql(whereClause, '', '');
    const findResult = await this.dataSource.query(findSql, [id]);

    return findResult[0] ? mapCommentRowToDto(findResult[0]) : null;
  }

  async findByIdOrInternalFail(id: number): Promise<CommentDtoSql> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new InternalServerErrorException('Comment not found');
    }

    return comment;
  }

  async findByIdOrNotFoundFail(id: number): Promise<CommentDtoSql> {
    const comment = await this.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  async updateComment(id: number, dto: UpdateCommentDto): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET content = $1,
        updated_at = now()
    WHERE id = $2;
    `;
    await this.dataSource.query(updateQuery, [dto.content, id]);
  }

  async softDeleteById(id: number): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND id = $1;
    `;
    await this.dataSource.query(updateQuery, [id]);
  }

  async softDeleteCommentsOfPostsWithBlogId(blogId: number): Promise<void> {
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
    await this.dataSource.query(updateQuery, [blogId]);
  }

  async softDeleteByPostId(postId: number): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND post_id = $1;
    `;
    await this.dataSource.query(updateQuery, [postId]);
  }

  async softDeleteByUserId(userId: number): Promise<void> {
    const updateQuery = `
    UPDATE comments
    SET deleted_at = now()
    WHERE deleted_at IS NULL
    AND user_id = $1;
    `;
    await this.dataSource.query(updateQuery, [userId]);
  }

  getCommentLikesCountsCtePart(): string {
    const commentLikesCountsQuery = `
    SELECT
    cl.comment_id,
    COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count, 
    COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count
    FROM comment_likes cl
    GROUP BY cl.comment_id
    `;

    return `comment_likes_counts AS (${commentLikesCountsQuery})`;
  }

  getPaginatedCommentsCtePart(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
  ): string {
    const paginatedCommentsQuery = `
    SELECT
    c.id, c.content, c.post_id, c.created_at, c.updated_at,
    c.user_id, u.login as user_login
    FROM comments c
    LEFT JOIN users u
    ON c.user_id = u.id
    ${whereClause}
    ${orderClause}
    ${paginationClause}
    `;

    return `paginated_comments AS (${paginatedCommentsQuery})`;
  }

  getCommentsSelectSql(
    whereClause: string,
    commentsOrderClause: string,
    paginationClause: string,
  ): string {
    const cteParts = [
      this.getCommentLikesCountsCtePart(),
      this.getPaginatedCommentsCtePart(
        whereClause,
        commentsOrderClause,
        paginationClause,
      ),
    ];
    const cte = `WITH ${cteParts.join(', ')}`;

    return `
    ${cte}
    SELECT
    c.id, c.content, c.post_id, c.created_at, c.updated_at,
    c.user_id, c.user_login,
    COALESCE(clc.likes_count, 0) as likes_count, 
    COALESCE(clc.dislikes_count, 0) as dislikes_count
    FROM paginated_comments c
    LEFT JOIN comment_likes_counts clc
    ON c.id = clc.comment_id
    ${commentsOrderClause};
    `;
  }
}
