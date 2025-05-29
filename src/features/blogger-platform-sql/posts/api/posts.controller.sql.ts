import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { PostViewDtoSql } from './view-dto/post.view-dto.sql';
import { GetPostByIdOrNotFoundFailQuerySql } from '../application/queries/get-post-by-id-or-not-found-fail.query.sql';

@Controller('sql/posts')
export class PostsControllerSql {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  // @Get()
  // @UseGuards(JwtAccessOptionalAuthGuard)
  // async getPosts(
  //   @Query() query: GetPostsQueryParams,
  //   @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   return this.queryBus.execute(new GetPostsQuery(query, user?.id));
  // }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPost(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PostViewDtoSql> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQuerySql(id, user?.id),
    );
  }
}
