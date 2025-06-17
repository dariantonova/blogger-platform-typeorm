import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { camelCaseToSnakeCase } from '../../../../common/utils/camel-case-to-snake-case';
import { UsersSortBy } from '../../../user-accounts/api/input-dto/users-sort-by';
import { UserViewDto } from '../../../user-accounts/api/view-dto/user.view-dto';
import { buildWhereClause } from '../../../../common/utils/sql/build-where-clause';
import { buildPaginationClause } from '../../../../common/utils/sql/build-pagination-clause';
import { UserViewRowWrap } from './dto/user.view-row.wrap';

@Injectable()
export class UsersQueryRepositoryWrap {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const whereParts = ['u.deleted_at IS NULL'];
    const orParts: string[] = [];
    const whereSqlParams: any[] = [];

    if (queryParams.searchLoginTerm) {
      whereSqlParams.push(`%${queryParams.searchLoginTerm}%`);
      orParts.push(`u.login ILIKE $${whereSqlParams.length}`);
    }

    if (queryParams.searchEmailTerm) {
      whereSqlParams.push(`%${queryParams.searchEmailTerm}%`);
      orParts.push(`u.email ILIKE $${whereSqlParams.length}`);
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

  async findById(id: number): Promise<UserViewRowWrap | null> {
    const findQuery = `
    ${this.buildSelectFromClause()}
    WHERE u.deleted_at IS NULL
    AND u.id = $1;
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? findResult[0] : null;
  }

  async findByIdOrInternalFail(id: number): Promise<UserViewDto> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return UserViewDto.mapToViewWrap(user);
  }

  private async findManyByWhereAndQuery(
    whereParts: string[],
    whereSqlParams: any[],
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const whereClause = buildWhereClause(whereParts);
    const orderClause = this.buildOrderClause(queryParams);

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const sqlParams = [...whereSqlParams, limit, offset];
    const paginationClause = buildPaginationClause(sqlParams.length);

    const findSql = this.getUsersSelectSql(
      whereClause,
      orderClause,
      paginationClause,
    );
    const findResult = await this.dataSource.query(findSql, sqlParams);

    const countSql = `
    SELECT
    COUNT(*)::int as count
    FROM users u
    ${whereClause};
    `;
    const countResult = await this.dataSource.query(countSql, whereSqlParams);
    const totalCount = countResult[0].count;

    const users: UserViewDto[] = findResult.map(UserViewDto.mapToViewWrap);

    return PaginatedViewDto.mapToView<UserViewDto[]>({
      items: users,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  private buildOrderClause(queryParams: GetUsersQueryParams): string {
    const allowedSortFields = Object.values(UsersSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : UsersSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return `ORDER BY ${sortBy} ${sortDirection}`;
  }

  private getUsersSelectSql(
    whereClause: string,
    orderClause: string,
    paginationClause: string,
  ): string {
    return `
    ${this.buildSelectFromClause()}
    ${whereClause}
    ${orderClause}
    ${paginationClause}
    `;
  }

  private buildSelectFromClause(): string {
    return `
    SELECT
    u.id, u.login, u.email, u.created_at
    FROM users u
    `;
  }
}
