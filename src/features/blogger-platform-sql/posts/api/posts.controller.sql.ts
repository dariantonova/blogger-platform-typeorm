import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { GetPostByIdOrNotFoundFailQuerySql } from '../application/queries/get-post-by-id-or-not-found-fail.query.sql';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQuerySql } from '../application/queries/get-posts.query.sql';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';

// @Controller('sql/posts')
@Controller('posts')
export class PostsControllerSql {
  constructor(private queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuerySql(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPost(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQuerySql(id, user?.id),
    );
  }
}
