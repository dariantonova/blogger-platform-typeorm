import {
  Body,
  Controller,
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
import { JwtAccessOptionalAuthGuard } from '../../../user-accounts/api/guards/bearer/jwt-access-optional-auth.guard';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQuery } from '../application/queries/get-posts.query';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetPostByIdOrNotFoundFailQuery } from '../application/queries/get-post-by-id-or-not-found-fail.query';
import { JwtAccessAuthGuard } from '../../../user-accounts/api/guards/bearer/jwt-access-auth.guard';
import { CreatePostCommentInputDto } from './input-dto/create-post-comment.input-dto';
import { CommentViewDto } from '../../comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../comments/api/input-dto/get-comments-query-params.input-dto';
import { GetPostCommentsQuery } from '../../comments/application/queries/get-post-comments.query';
import { CreateCommentCommand } from '../../comments/application/usecases/create-comment.usecase';
import { GetCommentByIdOrInternalFailQuery } from '../../comments/application/queries/get-comment-by-id-or-internal-fail.query';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { MakePostLikeOperationCommandWrap } from '../../likes/application/usecases/make-post-like-operation.usecase';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/api/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDto } from '../../../user-accounts/api/guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../../../user-accounts/api/guards/decorators/param/extract-user-from-request';

@Controller('posts')
export class PostsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtAccessOptionalAuthGuard)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuery(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuard)
  async getPost(
    @Param('id', IntValidationTransformationPipe)
    id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQuery(id, user?.id),
    );
  }

  @Get(':postId/comments')
  @UseGuards(JwtAccessOptionalAuthGuard)
  async getPostComments(
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(
      new GetPostCommentsQuery(postId, query, user?.id),
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAccessAuthGuard)
  async createPostComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Body() body: CreatePostCommentInputDto,
  ): Promise<CommentViewDto> {
    const createdCommentId = await this.commandBus.execute<
      CreateCommentCommand,
      number
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
  @UseGuards(JwtAccessAuthGuard)
  async makePostLikeOperation(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new MakePostLikeOperationCommandWrap({
        postId,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }
}
