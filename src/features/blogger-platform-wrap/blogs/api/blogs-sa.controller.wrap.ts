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

  // @Get(':blogId/posts')
  // @UseGuards(JwtAccessOptionalAuthGuard)
  // async getBlogPosts(
  //   @Param('blogId', ObjectIdValidationPipe) blogId: string,
  //   @Query() query: GetPostsQueryParams,
  //   @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  // ): Promise<PaginatedViewDto<PostViewDto[]>> {
  //   return this.queryBus.execute(
  //     new GetBlogPostsQuery(blogId, query, user?.id),
  //   );
  // }
  //
  // @Post(':blogId/posts')
  // @UseGuards(BasicAuthGuard)
  // async createBlogPost(
  //   @Param('blogId', ObjectIdValidationPipe) blogId: string,
  //   @Body() body: CreateBlogPostInputDto,
  // ): Promise<PostViewDto> {
  //   const createdPostId = await this.commandBus.execute<
  //     CreatePostCommand,
  //     string
  //   >(
  //     new CreatePostCommand({
  //       title: body.title,
  //       shortDescription: body.shortDescription,
  //       content: body.content,
  //       blogId,
  //     }),
  //   );
  //
  //   return this.queryBus.execute(
  //     new GetPostByIdOrInternalFailQuery(createdPostId, undefined),
  //   );
  // }
}
