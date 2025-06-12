import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetBlogsQueryParams } from '../../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { BlogsSortBy } from '../../../../blogger-platform/blogs/api/input-dto/blogs-sort-by';
import { camelCaseToSnakeCase } from '../../../../../common/utils/camel-case-to-snake-case';
import { BlogViewRowWrap } from './dto/blog.view-row.wrap';
import { buildPaginationClause } from '../../../../../common/utils/sql/build-pagination-clause';
import { buildWhereClause } from '../../../../../common/utils/sql/build-where-clause';

@Injectable()
export class BlogsQueryRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogs(
    queryParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const whereParts = ['b.deleted_at IS NULL'];
    const orParts: string[] = [];
    const whereSqlParams: any[] = [];

    if (queryParams.searchNameTerm) {
      whereSqlParams.push(`%${queryParams.searchNameTerm}%`);
      orParts.push(`b.name ILIKE $${whereSqlParams.length}`);
    }

    if (orParts.length > 0) {
      whereParts.push(`(${orParts.join(' OR ')})`);
    }

    return this.findManyByWhereAndQuery(
      whereParts,
      whereSqlParams,
      queryParams,
    );
  }

  async findById(id: string): Promise<BlogViewRowWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE b.deleted_at IS NULL
    AND b.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [+id]);

    return findResult[0] ? findResult[0] : null;
  }

  async findByIdOrInternalFail(id: string): Promise<BlogViewDto> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new InternalServerErrorException('Blog not found');
    }

    return BlogViewDto.mapToViewWrap(blog);
  }

  async findByIdOrNotFoundFail(id: string): Promise<BlogViewDto> {
    const blog = await this.findById(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return BlogViewDto.mapToViewWrap(blog);
  }

  private async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];

    const selectFromClause = this.buildSelectFromClause();
    const whereClause = buildWhereClause(whereParts);
    const orderClause = this.buildOrderClause(queryParams);
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = `
    ${selectFromClause}
    ${whereClause}
    ${orderClause}
    ${paginationClause};
    `;
    const findResult = await this.dataSource.query(findSql, sqlParams);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM blogs b
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, whereSqlParams);
    const totalCount = countResult[0].count;

    const blogs: BlogViewDto[] = findResult.map(BlogViewDto.mapToViewWrap);

    return PaginatedViewDto.mapToView<BlogViewDto[]>({
      items: blogs,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at
    FROM blogs b
    `;
  }

  private buildOrderClause(queryParams: GetBlogsQueryParams): string {
    const allowedSortFields = Object.values(BlogsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : BlogsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${sortBy} ${sortDirection}`;
  }
}
