import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardWrap } from '../../../user-accounts-wrap/guards/bearer/jwt-access-optional-auth.guard.wrap';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { GetPostsQueryWrap } from '../application/queries/get-posts.query.wrap';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { IntValidationPipe } from '../../../../core/pipes/int-validation-pipe';
import { GetPostByIdOrNotFoundFailQueryWrap } from '../application/queries/get-post-by-id-or-not-found-fail.query.wrap';

@Controller('posts')
export class PostsControllerWrap {
  constructor(private queryBus: QueryBus) {}

  @Get()
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQueryWrap(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getPost(
    @Param('id', IntValidationPipe)
    id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQueryWrap(id, user?.id),
    );
  }

  // @Get(':postId/comments')
  // @UseGuards(JwtAccessOptionalAuthGuardSql)
  // async getPostComments(
  //   @Param(
  //     'postId',
  //     new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
  //   )
  //     postId: number,
  //   @Query() query: GetCommentsQueryParams,
  //   @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  // ): Promise<PaginatedViewDto<CommentViewDto[]>> {
  //   return this.queryBus.execute(
  //     new GetPostCommentsQuerySql(postId, query, user?.id),
  //   );
  // }
  //
  // @Post(':postId/comments')
  // @UseGuards(JwtAccessAuthGuardSql)
  // async createPostComment(
  //   @ExtractUserFromRequestSql() user: UserContextDtoSql,
  //   @Param(
  //     'postId',
  //     new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
  //   )
  //     postId: number,
  //   @Body() body: CreatePostCommentInputDto,
  // ): Promise<CommentViewDto> {
  //   const createdCommentId = await this.commandBus.execute<
  //     CreateCommentCommandSql,
  //     number
  //   >(
  //     new CreateCommentCommandSql({
  //       content: body.content,
  //       postId,
  //       userId: user.id,
  //     }),
  //   );
  //
  //   return this.queryBus.execute(
  //     new GetCommentByIdOrInternalFailQuerySql(createdCommentId, undefined),
  //   );
  // }
  //
  // @Put(':postId/like-status')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAccessAuthGuardSql)
  // async makePostLikeOperation(
  //   @ExtractUserFromRequestSql() user: UserContextDtoSql,
  //   @Param(
  //     'postId',
  //     new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
  //   )
  //     postId: number,
  //   @Body() body: LikeInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new MakePostLikeOperationCommandSql({
  //       postId,
  //       userId: user.id,
  //       likeStatus: body.likeStatus,
  //     }),
  //   );
  // }
}
