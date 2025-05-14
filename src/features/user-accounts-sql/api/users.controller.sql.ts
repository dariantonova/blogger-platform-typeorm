import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from '../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { GetUsersQuery } from '../../user-accounts/application/queries/get-users.query';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/create-user.input-dto';
import { CreateUserCommand } from '../../user-accounts/application/usecases/admins/create-user.usecase';
import { GetUserByIdOrInternalFailQuery } from '../../user-accounts/application/queries/get-user-by-id-or-internal-fail.query';
import { ObjectIdValidationPipe } from '../../../core/pipes/object-id-validation-pipe';
import { DeleteUserCommand } from '../../user-accounts/application/usecases/admins/delete-user.usecase';
import { UserViewDtoSql } from './view-dto/users.view-dto.sql';
import { GetUsersQuerySql } from '../application/queries/get-users.query.sql';
import { CreateUserCommandSql } from '../application/usecases/create-user.usecase.sql';
import { GetUserByIdOrInternalFailQuerySql } from '../application/queries/get-user-by-id-or-internal-fail.query.sql';

@Controller('sql/users')
export class UsersControllerSql {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDtoSql[]>> {
    return this.queryBus.execute(new GetUsersQuerySql(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDtoSql> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommandSql,
      number
    >(new CreateUserCommandSql(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuerySql(createdUserId),
    );
  }
  //
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(BasicAuthGuard)
  // async deleteUser(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   await this.commandBus.execute(new DeleteUserCommandSql(id));
  // }
}
