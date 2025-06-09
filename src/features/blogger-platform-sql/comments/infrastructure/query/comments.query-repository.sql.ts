import { Injectable } from '@nestjs/common';
import { CommentsRepositorySql } from '../comments.repository.sql';
import { CommentDtoSql } from '../../dto/comment.dto.sql';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { buildWhereClause } from '../../../../../common/utils/sql/build-where-clause';
import { buildPaginationClause } from '../../../../../common/utils/sql/build-pagination-clause';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case';
import { GetCommentsQueryParams } from '../../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mapCommentRowToDto } from '../mappers/comment.mapper';
import { CommentsSortBy } from '../../../../blogger-platform/comments/api/input-dto/comments-sort-by';

@Injectable()
export class CommentsQueryRepositorySql {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private commentsRepository: CommentsRepositorySql,
  ) {}

  async findByIdOrInternalFail(id: number): Promise<CommentDtoSql> {
    return this.commentsRepository.findByIdOrInternalFail(id);
  }

  async findByIdOrNotFoundFail(id: number): Promise<CommentDtoSql> {
    return this.commentsRepository.findByIdOrNotFoundFail(id);
  }

  async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentDtoSql[]>> {
    const whereClause = buildWhereClause(whereParts);

    const orderClause = this.buildOrderClause(queryParams);

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = this.commentsRepository.getCommentsSelectSql(
      whereClause,
      orderClause,
      paginationClause,
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

    const comments: CommentDtoSql[] = findResult.map(mapCommentRowToDto);

    return PaginatedViewDto.mapToView<CommentDtoSql[]>({
      items: comments,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  async findPostComments(
    postId: number,
    queryParams: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentDtoSql[]>> {
    const whereParams: any[] = [postId];
    const whereParts = [
      'c.deleted_at IS NULL',
      `c.post_id = $${whereParams.length}`,
    ];

    return this.findManyByWhereAndQuery(whereParts, whereParams, queryParams);
  }

  buildOrderClause(queryParams: GetCommentsQueryParams): string {
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
}
