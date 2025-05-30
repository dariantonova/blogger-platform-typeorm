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
import { BlogViewDtoSql } from './view-dto/blog.view-dto.sql';
import { GetBlogsQuerySql } from '../application/queries/get-blogs.query.sql';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDtoSql } from '../../posts/api/view-dto/post.view-dto.sql';
import { GetBlogPostsQuerySql } from '../../posts/application/queries/get-blog-posts.query.sql';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { GetBlogByIdOrNotFoundFailQuerySql } from '../application/queries/get-blog-by-id-or-not-found-fail.query.sql';

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
  ): Promise<PaginatedViewDto<BlogViewDtoSql[]>> {
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
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<PostViewDtoSql[]>> {
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
  ): Promise<BlogViewDtoSql> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQuerySql(id));
  }
}
