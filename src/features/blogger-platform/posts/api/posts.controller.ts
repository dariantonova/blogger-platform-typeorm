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
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/admins/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/admins/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/admins/delete-post.usecase';
import { GetPostByIdOrInternalFailQuery } from '../application/queries/get-post-by-id-or-internal-fail.query';
import { GetPostByIdOrNotFoundFailQuery } from '../application/queries/get-post-by-id-or-not-found-fail.query';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { GetPostCommentsQuery } from '../application/queries/get-post-comments.query';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query));
  }

  @Get(':id')
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(new GetPostByIdOrNotFoundFailQuery(id));
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(body));

    return this.queryBus.execute(
      new GetPostByIdOrInternalFailQuery(createdPostId),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdatePostCommand(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(BasicAuthGuard)
  async deletePost(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeletePostCommand(id));
  }

  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(new GetPostCommentsQuery(postId, query));
  }
}
