import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { BlogViewDtoSql } from './view-dto/blog.view-dto.sql';
import { GetBlogsQuerySql } from '../application/queries/get-blogs.query.sql';
import { CreateBlogInputDto } from '../../../blogger-platform/blogs/api/input-dto/create-blog.input-dto';
import { CreateBlogCommandSql } from '../application/usecases/create-blog.usecase.sql';
import { GetBlogByIdOrInternalFailQuerySql } from '../application/queries/get-blog-by-id-or-internal-fail.query.sql';

@Controller('sql/sa/blogs')
@UseGuards(BasicAuthGuard)
export class BlogsSaController {
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

  @Post()
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDtoSql> {
    const createdBlogId = await this.commandBus.execute<
      CreateBlogCommandSql,
      number
    >(new CreateBlogCommandSql(body));

    return this.queryBus.execute(
      new GetBlogByIdOrInternalFailQuerySql(createdBlogId),
    );
  }

  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async updateBlog(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Body() body: UpdateBlogInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(new UpdateBlogCommand(id, body));
  // }
  //
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteBlog(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   await this.commandBus.execute(new DeleteBlogCommand(id));
  // }
  //
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
  //
  // @Post(':blogId/posts')
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
