import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetPostsQueryParams } from '../../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostDtoSql } from '../../dto/post.dto.sql';
import { camelCaseToSnakeCase } from '../../../../../utils/camel-case-to-snake-case';
import { PostsSortBy } from '../../../../blogger-platform/posts/api/input-dto/posts-sort-by';
import { mapPostRowsToDtos } from '../mappers/post.mapper';
import { buildWhereClause } from '../../../../../utils/sql/build-where-clause';
import { buildPaginationClause } from '../../../../../utils/sql/build-pagination-clause';
import { PostsRepositorySql } from '../posts.repository.sql';

@Injectable()
export class PostsQueryRepositorySql {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private postsRepository: PostsRepositorySql,
  ) {}

  async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDtoSql[]>> {
    const whereClause = buildWhereClause(whereParts);

    const orderClause = this.buildOrderClause(queryParams);

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = this.postsRepository.getPostsSelectSql(
      whereClause,
      orderClause,
      paginationClause,
    );
    const findResult = await this.dataSource.query(findSql, sqlParams);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM posts p
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, whereSqlParams);
    const totalCount = countResult[0].count;

    const posts: PostDtoSql[] = mapPostRowsToDtos(findResult);

    return PaginatedViewDto.mapToView<PostDtoSql[]>({
      items: posts,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  async findBlogPosts(
    blogId: number,
    queryParams: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostDtoSql[]>> {
    const whereParams: any[] = [blogId];
    const whereParts = [
      'p.deleted_at IS NULL',
      `p.blog_id = $${whereParams.length}`,
    ];

    return this.findManyByWhereAndQuery(whereParts, whereParams, queryParams);
  }

  async findByIdOrInternalFail(id: number): Promise<PostDtoSql> {
    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new InternalServerErrorException('Post not found');
    }

    return post;
  }

  buildOrderClause(queryParams: GetPostsQueryParams): string {
    const allowedSortFields = Object.values(PostsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : PostsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${sortBy} ${sortDirection}`;
  }
}
