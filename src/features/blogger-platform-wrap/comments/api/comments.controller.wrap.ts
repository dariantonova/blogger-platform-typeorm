import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardWrap } from '../../../user-accounts-wrap/guards/bearer/jwt-access-optional-auth.guard.wrap';
import { JwtAccessAuthGuardWrap } from '../../../user-accounts-wrap/guards/bearer/jwt-access-auth.guard.wrap';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { UpdateCommentInputDto } from '../../../blogger-platform/comments/api/input-dto/update-comment.input-dto';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetCommentByIdOrNotFoundFailQueryWrap } from '../application/queries/get-comment-by-id-or-not-found-fail.query.wrap';
import { UpdateCommentCommandWrap } from '../application/usecases/update-comment.usecase.wrap';
import { DeleteCommentCommandWrap } from '../application/usecases/delete-comment.usecase.wrap';
import { LikeInputDto } from '../../../blogger-platform/likes/api/input-dto/like.input-dto';
import { MakeCommentLikeOperationCommandWrap } from '../../likes/application/usecases/make-comment-like-operation.usecase.wrap';
import { ExtractUserIfExistsFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-if-exists-from-request.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { ExtractUserFromRequestSql } from '../../../user-accounts-sql/guards/decorators/param/extract-user-from-request.sql';

@Controller('comments')
export class CommentsControllerWrap {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuardWrap)
  async getComment(
    @Param('id', IntValidationTransformationPipe) id: number,
    @ExtractUserIfExistsFromRequestSql() user: UserContextDtoSql | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(
      new GetCommentByIdOrNotFoundFailQueryWrap(id, user?.id),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardWrap)
  async updateComment(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param('id', IntValidationTransformationPipe) id: number,
    @Body() body: UpdateCommentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommandWrap(id, body, user.id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardWrap)
  async deleteComment(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommandWrap(id, user.id));
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuardWrap)
  async makeCommentLikeOperation(
    @ExtractUserFromRequestSql() user: UserContextDtoSql,
    @Param('commentId', IntValidationTransformationPipe) commentId: number,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new MakeCommentLikeOperationCommandWrap({
        commentId,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }
}
