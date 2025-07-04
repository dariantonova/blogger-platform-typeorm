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
import { BasicAuthGuard } from './guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { CreateUserInputDto } from './input-dto/create-user.input-dto';
import { IntValidationTransformationPipe } from '../../../core/pipes/int-validation-transformation-pipe';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { GetUserByIdOrInternalFailQuery } from '../application/queries/get-user-by-id-or-internal-fail.query';

@Controller('sa/users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(BasicAuthGuard)
  async getUsers(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.queryBus.execute(new GetUsersQuery(query));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const createdUserId = await this.commandBus.execute<
      CreateUserCommand,
      number
    >(new CreateUserCommand(body));

    return this.queryBus.execute(
      new GetUserByIdOrInternalFailQuery(createdUserId),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deleteUser(
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
