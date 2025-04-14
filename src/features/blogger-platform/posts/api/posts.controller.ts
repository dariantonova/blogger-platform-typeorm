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
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { CreatePostCommentInputDto } from './input-dto/create-post-comment.input-dto';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetCommentByIdOrInternalFailQuery } from '../../comments/application/queries/get-comment-by-id-or-internal-fail.query';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { MakePostLikeOperationCommand } from '../application/usecases/make-post-like-operation.usecase';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/optional-jwt-guard';

@Controller('posts')
export class PostsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getPost(
    @Param('id', ObjectIdValidationPipe) id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQuery(id, user?.id),
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createPost(@Body() body: CreatePostInputDto): Promise<PostViewDto> {
    const createdPostId = await this.commandBus.execute<
      CreatePostCommand,
      string
    >(new CreatePostCommand(body));

    return this.queryBus.execute(
      new GetPostByIdOrInternalFailQuery(createdPostId, undefined),
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
  @UseGuards(JwtOptionalAuthGuard)
  async getPostComments(
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(
      new GetPostCommentsQuery(postId, query, user?.id),
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAuthGuard)
  async createPostComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() body: CreatePostCommentInputDto,
  ): Promise<CommentViewDto> {
    const createdCommentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(
      new CreateCommentCommand({
        content: body.content,
        postId,
        userId: user.id,
      }),
    );

    return this.queryBus.execute(
      new GetCommentByIdOrInternalFailQuery(createdCommentId, undefined),
    );
  }

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async makePostLikeOperation(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('postId', ObjectIdValidationPipe) postId: string,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new MakePostLikeOperationCommand({
        postId,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }
}
