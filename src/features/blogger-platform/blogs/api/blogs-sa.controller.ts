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
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetBlogByIdOrNotFoundFailQuery } from '../application/queries/get-blog-by-id-or-not-found-fail.query';
import { BasicAuthGuard } from '../../../user-accounts/api/guards/basic/basic-auth.guard';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { GetBlogByIdOrInternalFailQuery } from '../application/queries/get-blog-by-id-or-internal-fail.query';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { GetBlogPostsQuery } from '../../posts/application/queries/get-blog-posts.query';
import { CreateBlogPostInputDto } from './input-dto/create-blog-post.input-dto';
import { CreatePostCommandWrap } from '../../posts/application/usecases/create-post.usecase';
import { GetPostByIdOrInternalFailQuery } from '../../posts/application/queries/get-post-by-id-or-internal-fail.query';
import { UpdateBlogPostCommandWrap } from '../../posts/application/usecases/update-blog-post.usecase';
import { DeleteBlogPostCommandWrap } from '../../posts/application/usecases/delete-blog-post.usecase';
import { UpdateBlogPostInputDto } from './input-dto/update-blog-post.input-dto';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSaController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

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

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommand,
      number
    >(new CreateBlogCommand(body));

    return this.queryBus.execute(
      new GetBlogByIdOrInternalFailQuery(createdBlogId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', IntValidationTransformationPipe) id: number,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', IntValidationTransformationPipe) blogId: number,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(
      new GetBlogPostsQuery(blogId, query, undefined),
    );
  }

  @Post(':blogId/posts')
  async createBlogPost(
    @Param('blogId', IntValidationTransformationPipe) blogId: number,
    @Body() body: CreateBlogPostInputDto,
  ): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommandWrap,
      number
    >(
      new CreatePostCommandWrap({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId,
      }),
    );

    return this.queryBus.execute(
      new GetPostByIdOrInternalFailQuery(createdPostId, undefined),
    );
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlogPost(
    @Param('blogId', IntValidationTransformationPipe)
    blogId: number,
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Body() body: UpdateBlogPostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateBlogPostCommandWrap(blogId, postId, body),
    );
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogPost(
    @Param('blogId', IntValidationTransformationPipe)
    blogId: number,
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteBlogPostCommandWrap(blogId, postId),
    );
  }
}
