import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelType } from '../../domain/user.entity';
import { ObjectId } from 'mongodb';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery } from 'mongoose';
import { SortDirection } from '../../../../core/dto/base.query-params.input-dto';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  async findUsers(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const filter: FilterQuery<User> = {
      deletedAt: null,
    };

    if (query.searchLoginTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        login: { $regex: query.searchLoginTerm, $options: 'i' },
      });
    }

    if (query.searchEmailTerm) {
      filter.$or = filter.$or || [];
      filter.$or.push({
        email: { $regex: query.searchEmailTerm, $options: 'i' },
      });
    }

    const users = await this.UserModel.find(filter)
      .sort({
        [query.sortBy]: query.sortDirection === SortDirection.Asc ? 1 : -1,
        _id: 1,
      })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const items = users.map(UserViewDto.mapToView);

    return PaginatedViewDto.mapToView<UserViewDto[]>({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      _id: new ObjectId(id),
      deletedAt: null,
    });
  }

  async findUserByIdOrNotFoundFail(id: string): Promise<UserViewDto> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserViewDto.mapToView(user);
  }

  async findUserByIdOrInternalFail(id: string): Promise<UserViewDto> {
    const user = await this.findUserById(id);

    if (!user) {
      throw new Error('User not found');
    }

    return UserViewDto.mapToView(user);
  }
}
