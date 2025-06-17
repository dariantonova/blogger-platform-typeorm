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
import { JwtAccessOptionalAuthGuardWrap } from '../../../user-accounts-wrap/guards/bearer/jwt-access-optional-auth.guard.wrap';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { GetPostsQueryWrap } from '../application/queries/get-posts.query.wrap';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetPostByIdOrNotFoundFailQueryWrap } from '../application/queries/get-post-by-id-or-not-found-fail.query.wrap';
import { JwtAccessAuthGuardWrap } from '../../../user-accounts-wrap/guards/bearer/jwt-access-auth.guard.wrap';
import { CreatePostCommentInputDto } from '../../../blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { GetCommentsQueryParams } from '../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { GetPostCommentsQueryWrap } from '../../comments/application/queries/get-post-comments.query.wrap';
import { CreateCommentCommandWrap } from '../../comments/application/usecases/create-comment.usecase.wrap';
import { GetCommentByIdOrInternalFailQueryWrap } from '../../comments/application/queries/get-comment-by-id-or-internal-fail.query.wrap';
import { LikeInputDto } from '../../../blogger-platform/likes/api/input-dto/like.input-dto';
import { MakePostLikeOperationCommandWrap } from '../../likes/application/usecases/make-post-like-operation.usecase.wrap';
import { ExtractUserIfExistsFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-if-exists-from-request.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { ExtractUserFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-from-request.sql';

@Controller('posts')
export class PostsControllerWrap {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQueryWrap(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getPost(
    @Param('id', IntValidationTransformationPipe)
    id: number,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQueryWrap(id, user?.id),
    );
  }

  @Get(':postId/comments')
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getPostComments(
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(
      new GetPostCommentsQueryWrap(postId, query, user?.id),
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAccessAuthGuardWrap)
  async createPostComment(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param('postId', IntValidationTransformationPipe)
    postId: number,
    @Body() body: CreatePostCommentInputDto,
  ): Promise<CommentViewDto> {
    const createdCommentId = await this.commandBus.execute<
      CreateCommentCommandWrap,
      number
    >(
      new CreateCommentCommandWrap({
        content: body.content,
        postId,
        userId: user.id,
      }),
    );

    return this.queryBus.execute(
      new GetCommentByIdOrInternalFailQueryWrap(createdCommentId, undefined),
    );
  }

  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardWrap)
  async makePostLikeOperation(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
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
