import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GetBlogsQueryParams } from '../../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDtoSql } from '../../api/view-dto/blog.view-dto.sql';
import { camelCaseToSnakeCase } from '../../../../../utils/camel-case-to-snake-case';
import { BlogsSortBy } from '../../../../blogger-platform/blogs/api/input-dto/blogs-sort-by';
import { mapBlogRowToDto } from '../mappers/blog.mapper';
import { BlogDtoSql } from '../../dto/blog.dto.sql';

@Injectable()
export class BlogsQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findBlogs(
    queryParams: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDtoSql[]>> {
    const whereParts = ['b.deleted_at IS NULL'];
    const orParts: string[] = [];
    const params: any[] = [];

    if (queryParams.searchNameTerm) {
      params.push(`%${queryParams.searchNameTerm}%`);
      orParts.push(`b.name ILIKE $${params.length}`);
    }

    if (orParts.length > 0) {
      whereParts.push(`(${orParts.join(' OR ')})`);
    }
    const searchParams = [...params];

    const whereClause =
      whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const allowedSortFields = Object.values(BlogsSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : BlogsSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit);
    params.push(offset);

    const findSql = `
    SELECT
    b.id, b.name, b.description, b.website_url, b.is_membership, b.created_at, b.updated_at
    FROM blogs b
    ${whereClause}
    ORDER BY b.${sortBy} ${sortDirection}
    LIMIT $${params.length - 1} OFFSET $${params.length};
    `;
    const findResult = await this.dataSource.query(findSql, params);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM blogs b
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, searchParams);
    const totalCount = countResult[0].count;

    const blogs: BlogDtoSql[] = findResult.map(mapBlogRowToDto);

    const items = blogs.map(BlogViewDtoSql.mapToView);

    return PaginatedViewDto.mapToView<BlogViewDtoSql[]>({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }
}
