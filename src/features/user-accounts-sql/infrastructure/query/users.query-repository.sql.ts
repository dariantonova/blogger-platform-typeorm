import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDtoSql } from '../../api/view-dto/users.view-dto.sql';
import { GetUsersQueryParams } from '../../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { camelCaseToSnakeCase } from '../../utils/camel-case-to-snake-case';
import { UserDtoSql } from '../../dto/user.dto.sql';
import { UsersSortBy } from '../../../user-accounts/api/input-dto/users-sort-by';
import { mapUserRowToDto } from '../mappers/user.mapper';

@Injectable()
export class UsersQueryRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findUsers(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDtoSql[]>> {
    const whereParts = ['u.deleted_at IS NULL'];
    const orParts: string[] = [];
    const params: any[] = [];

    if (queryParams.searchLoginTerm) {
      params.push(`%${queryParams.searchLoginTerm}%`);
      orParts.push(`u.login ILIKE $${params.length}`);
    }

    if (queryParams.searchEmailTerm) {
      params.push(`%${queryParams.searchEmailTerm}%`);
      orParts.push(`u.email ILIKE $${params.length}`);
    }

    if (orParts.length > 0) {
      whereParts.push(`(${orParts.join(' OR ')})`);
    }
    const searchParams = [...params];

    const whereClause =
      whereParts.length > 0 ? 'WHERE ' + whereParts.join(' AND ') : '';

    const limit = queryParams.pageSize;
    const offset = queryParams.calculateSkip();

    const allowedSortFields = Object.values(UsersSortBy); // Защита от SQL-инъекций
    const sortBy = camelCaseToSnakeCase(
      allowedSortFields.includes(queryParams.sortBy)
        ? queryParams.sortBy
        : UsersSortBy.CreatedAt,
    );
    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    params.push(limit);
    params.push(offset);

    const findSql = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    ${whereClause}
    ORDER BY u.${sortBy} ${sortDirection}
    LIMIT $${params.length - 1} OFFSET $${params.length}
    `;
    const findResult = await this.dataSource.query(findSql, params);

    const countSql = `
    SELECT
    COUNT(*) as count
    FROM users u
    ${whereClause}
    `;
    const countResult = await this.dataSource.query(countSql, searchParams);
    const totalCount = +countResult[0].count;

    const users: UserDtoSql[] = findResult.map(mapUserRowToDto);

    const items = users.map(UserViewDtoSql.mapToView);

    return PaginatedViewDto.mapToView<UserViewDtoSql[]>({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  async findById(id: number): Promise<UserDtoSql | null> {
    const findQuery = `
    SELECT
    u.id, u.login, u.email, u.password_hash, u.created_at, u.updated_at
    FROM users u
    WHERE u.id = $1
    AND u.deleted_at IS NULL
    `;
    const findResult = await this.dataSource.query(findQuery, [id]);

    return findResult[0] ? mapUserRowToDto(findResult[0]) : null;
  }

  async findByIdOrInternalFail(id: number): Promise<UserViewDtoSql> {
    const user = await this.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return UserViewDtoSql.mapToView(user);
  }
}
