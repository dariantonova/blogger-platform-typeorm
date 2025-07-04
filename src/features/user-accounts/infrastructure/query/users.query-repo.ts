import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../domain/user.entity';
import { ILike, Repository } from 'typeorm';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { MeViewDto, UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersSortBy } from '../../api/input-dto/users-sort-by';

import { SortDirectionSql } from '../../../../common/types/typeorm/sort-direction-sql';

@Injectable()
export class UsersQueryRepo {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async findUsers(
    queryParams: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const orParts: any[] = [];

    if (queryParams.searchLoginTerm) {
      orParts.push({ login: ILike(`%${queryParams.searchLoginTerm}%`) });
    }

    if (queryParams.searchEmailTerm) {
      orParts.push({ email: ILike(`%${queryParams.searchEmailTerm}%`) });
    }

    const [sortBy, sortDirection] = this.validateSortQueryParams(queryParams);

    const [users, totalCount] = await this.usersRepository.findAndCount({
      where: orParts,
      order: { [sortBy]: sortDirection },
      skip: queryParams.calculateSkip(),
      take: queryParams.pageSize,
    });

    const items = users.map(UserViewDto.mapToViewEntity);

    return PaginatedViewDto.mapToView<UserViewDto[]>({
      items,
      totalCount,
      page: queryParams.pageNumber,
      pageSize: queryParams.pageSize,
    });
  }

  async findByIdOrInternalFail(id: number): Promise<UserViewDto> {
    const user = await this.findById(id);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return UserViewDto.mapToViewEntity(user);
  }

  async me(userId: number): Promise<MeViewDto> {
    const user = await this.findById(userId);

    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    return MeViewDto.mapToViewEntity(user);
  }

  private async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  private validateSortQueryParams(
    queryParams: GetUsersQueryParams,
  ): [string, SortDirectionSql] {
    const allowedSortFields = Object.values(UsersSortBy);
    const sortBy = allowedSortFields.includes(queryParams.sortBy)
      ? queryParams.sortBy
      : UsersSortBy.CreatedAt;

    const sortDirection =
      queryParams.sortDirection.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    return [sortBy, sortDirection];
  }
}
