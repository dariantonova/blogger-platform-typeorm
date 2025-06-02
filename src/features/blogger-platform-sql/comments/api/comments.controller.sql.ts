import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { GetCommentByIdOrNotFoundFailQuerySql } from '../application/queries/get-comment-by-id-or-not-found-fail.query.sql';
import { JwtAccessAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-auth.guard.sql';
import { UpdateCommentInputDto } from '../../../blogger-platform/comments/api/input-dto/update-comment.input-dto';
import { UpdateCommentCommandSql } from '../application/usecases/update-comment.usecase.sql';
import { DeleteCommentCommandSql } from '../application/usecases/delete-comment.usecase.sql';
import { LikeInputDto } from '../../../blogger-platform/likes/api/input-dto/like.input-dto';
import { MakeCommentLikeOperationCommandSql } from '../../likes/application/usecases/make-comment-like-operation.usecase.sql';
import { ExtractUserIfExistsFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-if-exists-from-request.sql';
import { ExtractUserFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-from-request.sql';

@Controller('sql/comments')
export class CommentsControllerSql {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardSql)
  async getComment(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(
      new GetCommentByIdOrNotFoundFailQuerySql(id, user?.id),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardSql)
  async updateComment(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
    @Body() body: UpdateCommentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommandSql(id, body, user.id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardSql)
  async deleteComment(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommandSql(id, user.id));
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardSql)
  async makeCommentLikeOperation(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param(
      'commentId',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND }),
    )
    commentId: number,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new MakeCommentLikeOperationCommandSql({
        commentId,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }
}
