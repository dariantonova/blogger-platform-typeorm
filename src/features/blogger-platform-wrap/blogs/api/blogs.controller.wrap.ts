import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryWrap } from '../application/queries/get-blogs.query.wrap';
import { IntValidationPipe } from '../../../../core/pipes/int-validation-pipe';
import { GetBlogByIdOrNotFoundFailQueryWrap } from '../application/queries/get-blog-by-id-or-not-found-fail.query.wrap';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';

@Controller('blogs')
export class BlogsControllerWrap {
  constructor(private queryBus: QueryBus) {}

  @Get()
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute(new GetBlogsQueryWrap(query));
  }

  @Get(':id')
  async getBlog(
    @Param('id', IntValidationPipe) id: string,
  ): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQueryWrap(id));
  }

  // @Get(':blogId/posts')
  // async getBlogPosts(
  //   @Param('blogId', ObjectIdValidationPipe) blogId: string,
  //   @Query() query: GetPostsQueryParams,
  //   @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   return this.queryBus.execute(
  //     new GetBlogPostsQuery(blogId, query, user?.id),
  //   );
  // }
}
