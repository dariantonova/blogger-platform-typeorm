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
} from '@nestjs/common';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/posts.view-dto';
import { CreateBlogPostInputDto } from './input-dto/create-blog-post.input-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { CreatePostCommand } from '../../posts/application/usecases/create-post.usecase';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { GetBlogByIdOrNotFoundFailQuery } from '../application/queries/get-blog-by-id-or-not-found-fail.query';
import { GetBlogByIdOrInternalFailQuery } from '../application/queries/get-blog-by-id-or-internal-fail.query';
import { GetBlogPostsQuery } from '../application/queries/get-blog-posts.query';
import { GetPostByIdOrInternalFailQuery } from '../../posts/application/queries/get-post-by-id-or-internal-fail.query';

@Controller('blogs')
export class BlogsController {
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
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<BlogViewDto> {
    return this.queryBus.execute(new GetBlogByIdOrNotFoundFailQuery(id));
  }

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommand,
      string
    >(new CreateBlogCommand(body));

    return this.queryBus.execute(
      new GetBlogByIdOrInternalFailQuery(createdBlogId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteBlogCommand(id));
  }

  @Get(':blogId/posts')
  async getBlogPosts(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetBlogPostsQuery(blogId, query));
  }

  @Post(':blogId/posts')
  async createBlogPost(
    @Param('blogId', ObjectIdValidationPipe) blogId: string,
    @Body() body: CreateBlogPostInputDto,
  ): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(
      new CreatePostCommand({
        title: body.title,
        shortDescription: body.shortDescription,
        content: body.content,
        blogId,
      }),
    );

    return this.queryBus.execute(
      new GetPostByIdOrInternalFailQuery(createdPostId),
    );
  }
}
