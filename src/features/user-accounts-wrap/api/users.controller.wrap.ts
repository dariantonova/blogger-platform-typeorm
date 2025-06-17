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
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQueryWrap } from '../application/queries/get-users.query.wrap';
import { CreateUserCommandWrap } from '../application/usecases/create-user.usecase.wrap';
import { GetUserByIdOrInternalFailQueryWrap } from '../application/queries/get-user-by-id-or-internal-fail.query.wrap';
import { DeleteUserCommandWrap } from '../application/usecases/delete-user.usecase.wrap';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from '../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { UserViewDto } from '../../user-accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/create-user.input-dto';
import { IntValidationTransformationPipe } from '../../../core/pipes/int-validation-transformation-pipe';

@Controller('sa/users')
export class UsersControllerWrap {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.queryBus.execute(new GetUsersQueryWrap(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommandWrap,
      number
    >(new CreateUserCommandWrap(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQueryWrap(createdUserId),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommandWrap(id));
  }
}
