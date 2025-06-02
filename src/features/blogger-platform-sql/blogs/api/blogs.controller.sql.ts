import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQuerySql } from '../application/queries/get-blogs.query.sql';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { GetBlogPostsQuerySql } from '../../posts/application/queries/get-blog-posts.query.sql';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { GetBlogByIdOrNotFoundFailQuerySql } from '../application/queries/get-blog-by-id-or-not-found-fail.query.sql';
import { BlogViewDto } from '../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { ExtractUserIfExistsFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-if-exists-from-request.sql';

// @Controller('sql/blogs')
@Controller('blogs')
export class BlogsControllerSql {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuerySql(query));
  }

  @Get(':blogId/posts')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getBlogPosts(
    @Param(
      'blogId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    blogId: number,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(
      new GetBlogPostsQuerySql(blogId, query, user?.id),
    );
  }

  @Get(':id')
  async getBlog(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
  ): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQuerySql(id));
  }
}
