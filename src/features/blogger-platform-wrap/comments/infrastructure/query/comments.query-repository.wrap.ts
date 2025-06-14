import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetCommentsQueryParams } from '../../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { buildWhereClause } from '../../../../../common/utils/sql/build-where-clause';
import { buildPaginationClause } from '../../../../../common/utils/sql/build-pagination-clause';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { CommentsSortBy } from '../../../../blogger-platform/comments/api/input-dto/comments-sort-by';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case';
import { CommentViewRowWrap } from './dto/comment.view-row.wrap';

@Injectable()
export class CommentsQueryRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(
    id: string,
    currentUserId: string | undefined,
  ): Promise<CommentViewRowWrap | null> {
    const whereParts = ['c.deleted_at IS NULL', 'c.id = $1'];
    const whereClause = buildWhereClause(whereParts);

    const findSql = this.getCommentsSelectSql(
      whereClause,
      '',
      '',
      currentUserId,
    );
    const findResult = await this.dataSource.query(findSql, [+id]);

    return findResult[0] ? findResult[0] : null;
  }

  async findByIdOrInternalFail(
    id: string,
    currentUserId: string | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.findById(id, currentUserId);

    if (!comment) {
      throw new InternalServerErrorException('Comment not found');
    }

    return CommentViewDto.mapToViewWrap(comment);
  }

  async findByIdOrNotFoundFail(
    id: string,
    currentUserId: string | undefined,
  ): Promise<CommentViewDto> {
    const comment = await this.findById(id, currentUserId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return CommentViewDto.mapToViewWrap(comment);
  }

  async findPostComments(
    postId: string,
    queryParams: GetCommentsQueryParams,
    currentUserId: string | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const whereParams: any[] = [+postId];
    const whereParts = ['c.deleted_at IS NULL', `c.post_id = $1`];

    return this.findManyByWhereAndQuery(
      whereParts,
      whereParams,
      queryParams,
      currentUserId,
    );
  }

  private async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetCommentsQueryParams,
    currentUserId: string | undefined,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];

    const whereClause = buildWhereClause(whereParts);
    const orderClause = this.buildOrderClause(queryParams);
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = this.getCommentsSelectSql(
      whereClause,
      orderClause,
      paginationClause,
      currentUserId,
    );
    const findResult = await this.dataSource.query(findSql, sqlParams);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM comments c
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, whereSqlParams);
    const totalCount = countResult[0].count;

    const comments: CommentViewDto[] = findResult.map(
      CommentViewDto.mapToViewWrap,
    );

    return PaginatedViewDto.mapToView<CommentViewDto[]>({
      items: comments,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private buildOrderClause(queryParams: GetCommentsQueryParams): string {
    const allowedSortFields = Object.values(CommentsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : CommentsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${sortBy} ${sortDirection}`;
  }

  private getCommentsSelectSql(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
    currentUserId: string | undefined,
  ): string {
    const cteParts = [
      ...this.getCommentLikesCteParts(currentUserId),
      this.getPaginatedCommentsCtePart(
        whereClause,
        orderClause,
        paginationClause,
      ),
    ];
    const cte = `WITH ${cteParts.join(', ')}`;

    return `
    ${cte}
    SELECT
    c.id, c.content, c.created_at,
    c.user_id, c.user_login,
    COALESCE(clc.likes_count, 0) as likes_count, 
    COALESCE(clc.dislikes_count, 0) as dislikes_count,
    COALESCE(cucl.status, 'None') as my_status
    FROM paginated_comments c
    LEFT JOIN comment_likes_counts clc
    ON c.id = clc.comment_id
    LEFT JOIN current_user_comment_likes cucl
    ON c.id = cucl.comment_id
    ${orderClause};
    `;
  }

  private getCommentLikesCteParts(currentUserId: string | undefined): string[] {
    const commentLikesCountsCte = `
    SELECT
    cl.comment_id,
    COUNT(*) FILTER(WHERE status = 'Like')::int as likes_count, 
    COUNT(*) FILTER(WHERE status = 'Dislike')::int as dislikes_count
    FROM comment_likes cl
    GROUP BY cl.comment_id
    `;

    const currentUserCommentLikesCte = `
    SELECT
    cl.comment_id,
    cl.status
    FROM comment_likes cl
    WHERE cl.user_id = ${currentUserId ? +currentUserId : -1}
    `;

    return [
      `comment_likes_counts AS (${commentLikesCountsCte})`,
      `current_user_comment_likes AS (${currentUserCommentLikesCte})`,
    ];
  }

  private getPaginatedCommentsCtePart(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
  ): string {
    const paginatedCommentsCte = `
    SELECT
    c.id, c.content, c.created_at,
    c.user_id, u.login as user_login
    FROM comments c
    LEFT JOIN users u
    ON c.user_id = u.id
    ${whereClause}
    ${orderClause}
    ${paginationClause}
    `;

    return `paginated_comments AS (${paginatedCommentsCte})`;
  }
}
