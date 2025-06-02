import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { GetPostByIdOrNotFoundFailQuerySql } from '../application/queries/get-post-by-id-or-not-found-fail.query.sql';
import { GetPostsQueryParams } from '../../../blogger-platform/posts/api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetPostsQuerySql } from '../application/queries/get-posts.query.sql';
import { PostViewDto } from '../../../blogger-platform/posts/api/view-dto/posts.view-dto';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request';
import { CreatePostCommentInputDto } from '../../../blogger-platform/posts/api/input-dto/create-post-comment.input-dto';
import { JwtAccessAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-auth.guard.sql';
import { CreateCommentCommandSql } from '../../comments/application/usecases/create-comment.usecase.sql';
import { GetCommentByIdOrInternalFailQuerySql } from '../../comments/application/queries/get-comment-by-id-or-internal-fail.query.sql';
import { GetCommentsQueryParams } from '../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { GetPostCommentsQuerySql } from '../../comments/application/queries/get-post-comments.query.sql';

// @Controller('sql/posts')
@Controller('posts')
export class PostsControllerSql {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPosts(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute(new GetPostsQuerySql(query, user?.id));
  }

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPost(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PostViewDto> {
    return this.queryBus.execute(
      new GetPostByIdOrNotFoundFailQuerySql(id, user?.id),
    );
  }

  @Get(':postId/comments')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getPostComments(
    @Param(
      'postId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    postId: number,
    @Query() query: GetCommentsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.queryBus.execute(
      new GetPostCommentsQuerySql(postId, query, user?.id),
    );
  }

  @Post(':postId/comments')
  @UseGuards(JwtAccessAuthGuardSql)
  async createPostComment(
    @ExtractUserFromRequest() user: UserContextDtoSql,
    @Param(
      'postId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    postId: number,
    @Body() body: CreatePostCommentInputDto,
  ): Promise<CommentViewDto> {
    const createdCommentId = await this.commandBus.execute<
      CreateCommentCommandSql,
      number
    >(
      new CreateCommentCommandSql({
        content: body.content,
        postId,
        userId: user.id,
      }),
    );

    return this.queryBus.execute(
      new GetCommentByIdOrInternalFailQuerySql(createdCommentId, undefined),
    );
  }
}
