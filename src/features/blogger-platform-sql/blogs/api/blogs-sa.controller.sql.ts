import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../../blogger-platform/blogs/api/input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { BlogViewDtoSql } from './view-dto/blog.view-dto.sql';
import { GetBlogsQuerySql } from '../application/queries/get-blogs.query.sql';

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

  // @Post()
  // @UseGuards(BasicAuthGuard)
  // async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
  //   const createdBlogId = await this.commandBus.execute<
  //     CreateBlogCommand,
  //     string
  //   >(new CreateBlogCommand(body));
  //
  //   return this.queryBus.execute(
  //     new GetBlogByIdOrInternalFailQuery(createdBlogId),
  //   );
  // }
  //
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(BasicAuthGuard)
  // async updateBlog(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Body() body: UpdateBlogInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(new UpdateBlogCommand(id, body));
  // }
  //
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(BasicAuthGuard)
  // async deleteBlog(
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   await this.commandBus.execute(new DeleteBlogCommand(id));
  // }
  //
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
