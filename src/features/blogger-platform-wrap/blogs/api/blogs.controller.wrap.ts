import { Controller, Get, Param, Query } from '@nestjs/common';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryWrap } from '../application/queries/get-blogs.query.wrap';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetBlogByIdOrNotFoundFailQueryWrap } from '../application/queries/get-blog-by-id-or-not-found-fail.query.wrap';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { GetBlogPostsQueryWrap } from '../../posts/application/queries/get-blog-posts.query.wrap';

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
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQueryWrap(id));
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', IntValidationTransformationPipe) blogId: number,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(
      new GetBlogPostsQueryWrap(blogId, query, undefined),
    );
  }
}
