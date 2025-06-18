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
import { JwtAccessOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-optional-auth.guard';
import { JwtAccessAuthGuard } from '../../../user-accounts/guards/bearer/jwt-access-auth.guard';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { IntValidationTransformationPipe } from '../../../../core/pipes/int-validation-transformation-pipe';
import { GetCommentByIdOrNotFoundFailQuery } from '../application/queries/get-comment-by-id-or-not-found-fail.query';
import { UpdateCommentCommandWrap } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommandWrap } from '../application/usecases/delete-comment.usecase';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { MakeCommentLikeOperationCommand } from '../../likes/application/usecases/make-comment-like-operation.usecase';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtAccessOptionalAuthGuard)
  async getComment(
    @Param('id', IntValidationTransformationPipe) id: number,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(
      new GetCommentByIdOrNotFoundFailQuery(id, user?.id),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async updateComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', IntValidationTransformationPipe) id: number,
    @Body() body: UpdateCommentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateCommentCommandWrap(id, body, user.id),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async deleteComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', IntValidationTransformationPipe) id: number,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommandWrap(id, user.id));
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessAuthGuard)
  async makeCommentLikeOperation(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('commentId', IntValidationTransformationPipe) commentId: number,
    @Body() body: LikeInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new MakeCommentLikeOperationCommand({
        commentId,
        userId: user.id,
        likeStatus: body.likeStatus,
      }),
    );
  }
}
