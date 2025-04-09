import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
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
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { CreatePostInputDto } from './input-dto/create-post.input-dto';
import { UpdatePostInputDto } from './input-dto/update-post.input-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { CommentsService } from '../../comments/application/comments.service';
import { CommentsQueryRepository } from '../../comments/infrastructure/query/comments.query-repository';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../application/usecases/create-post.usecase';
import { UpdatePostCommand } from '../application/usecases/update-post.usecase';
import { DeletePostCommand } from '../application/usecases/delete-post.usecase';

@Controller('posts')
export class PostsController {
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  async getPosts(
    @Query() query: GetPostsQueryParams,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.findPosts(query);
  }

  @Get(':id')
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrNotFoundFail(id);
  }

  @Post()
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(body));
    return this.postsQueryRepository.findByIdOrInternalFail(createdPostId);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdatePostInputDto,
  ): Promise<void> {
    await this.commandBus.execute<UpdatePostCommand>(
      new UpdatePostCommand(id, body),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute<DeletePostCommand>(new DeletePostCommand(id));
  }

  @Get(':postId/comments')
  async getPostComments(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Query() query: GetCommentsQueryParams,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const comments = await this.commentsService.getPostComments(postId, query);

    const items = comments.map(CommentViewDto.mapToView);
    const totalCount =
      await this.commentsQueryRepository.countPostComments(postId);

    return PaginatedViewDto.mapToView<CommentViewDto[]>({
      items,
      totalCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
    });
  }
}
