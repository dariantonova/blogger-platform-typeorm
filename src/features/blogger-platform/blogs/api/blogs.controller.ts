import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetBlogByIdOrNotFoundFailQuery } from '../application/queries/get-blog-by-id-or-not-found-fail.query';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetBlogPostsQuery } from '../../posts/application/queries/get-blog-posts.query';
import { JwtAccessOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@Controller('blogs')
export class BlogsController {
  constructor(private queryBus: QueryBus) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQuery(query));
  }

  @Get(':id')
  async getBlog(
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQuery(id));
  }

  @Get(':blogId/posts')
  @UseGuards(JwtAccessOptionalAuthGuard)
  async getBlogPosts(
    @Param('blogId', IntValidationTransformationPipe) blogId: number,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(
      new GetBlogPostsQuery(blogId, query, user?.id),
    );
  }
}
