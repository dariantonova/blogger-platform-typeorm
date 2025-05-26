import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from '../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/create-user.input-dto';
import { UserViewDtoSql } from './view-dto/user.view-dto.sql';
import { GetUsersQuerySql } from '../application/queries/get-users.query.sql';
import { CreateUserCommandSql } from '../application/usecases/create-user.usecase.sql';
import { GetUserByIdOrInternalFailQuerySql } from '../application/queries/get-user-by-id-or-internal-fail.query.sql';
import { DeleteUserCommandSql } from '../application/usecases/delete-user.usecase.sql';

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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommandSql(id));
  }
}
