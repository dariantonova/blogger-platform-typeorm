import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../../blogger-platform/blogs/api/view-dto/blogs.view-dto';
import { GetBlogsQueryWrap } from '../application/queries/get-blogs.query.wrap';
import { IntValidationPipe } from '../../../../core/pipes/int-validation-pipe';
import { GetBlogByIdOrNotFoundFailQueryWrap } from '../application/queries/get-blog-by-id-or-not-found-fail.query.wrap';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { CreateBlogInputDto } from '../../../blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { CreateBlogCommandWrap } from '../application/usecases/create-blog.usecase.wrap';
import { GetBlogByIdOrInternalFailQueryWrap } from '../application/queries/get-blog-by-id-or-internal-fail.query.wrap';
import { UpdateBlogInputDto } from '../../../blogger-platform/blogs/api/input-dto/update-blog.input-dto';
import { UpdateBlogCommandWrap } from '../application/usecases/update-blog.usecase.wrap';
import { DeleteBlogCommandWrap } from '../application/usecases/delete-blog.usecase.wrap';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { GetBlogPostsQueryWrap } from '../../posts/application/queries/get-blog-posts.query.wrap';
import { CreateBlogPostInputDto } from '../../../blogger-platform/blogs/api/input-dto/create-blog-post.input-dto';
import { CreatePostCommandWrap } from '../../posts/application/usecases/create-post.usecase.wrap';
import { GetPostByIdOrInternalFailQueryWrap } from '../../posts/application/queries/get-post-by-id-or-internal-fail.query.wrap';
import { UpdateBlogPostCommandWrap } from '../../posts/application/usecases/update-blog-post.usecase.wrap';
import { DeleteBlogPostCommandWrap } from '../../posts/application/usecases/delete-blog-post.usecase.wrap';
import { UpdateBlogPostInputDtoWrap } from './input-dto/update-blog-post.input-dto.sql';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSaControllerWrap {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

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

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommandWrap,
      string
    >(new CreateBlogCommandWrap(body));

    return this.queryBus.execute(
      new GetBlogByIdOrInternalFailQueryWrap(createdBlogId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', IntValidationPipe) id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommandWrap(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id', IntValidationPipe) id: string): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommandWrap(id));
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', IntValidationPipe) blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(
      new GetBlogPostsQueryWrap(blogId, query, undefined),
    );
  }

  @Post(':blogId/posts')
  async createBlogPost(
    @Param('blogId', IntValidationPipe) blogId: string,
    @Body() body: CreateBlogPostInputDto,
  ): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommandWrap,
      string
    >(
      new CreatePostCommandWrap({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId,
      }),
    );

    return this.queryBus.execute(
      new GetPostByIdOrInternalFailQueryWrap(createdPostId, undefined),
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogPost(
    @Param('blogId', IntValidationPipe)
    blogId: string,
    @Param('postId', IntValidationPipe)
    postId: string,
    @Body() body: UpdateBlogPostInputDtoWrap,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateBlogPostCommandWrap(blogId, postId, body),
    );
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogPost(
    @Param('blogId', IntValidationPipe)
    blogId: string,
    @Param('postId', IntValidationPipe)
    postId: string,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteBlogPostCommandWrap(blogId, postId),
    );
  }
}
