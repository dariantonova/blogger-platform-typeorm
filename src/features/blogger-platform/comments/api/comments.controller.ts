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
import { CommentViewDto } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdOrNotFoundFailQuery } from '../application/queries/get-comment-by-id-or-not-found-fail.query';
import { JwtAuthGuard } from '../../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-from-request';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';
import { UpdateCommentInputDto } from './input-dto/update-comment.input-dto';
import { UpdateCommentCommand } from '../application/usecases/update-comment.usecase';
import { DeleteCommentCommand } from '../application/usecases/delete-comment.usecase';
import { LikeInputDto } from '../../likes/api/input-dto/like.input-dto';
import { MakeCommentLikeOperationCommand } from '../application/usecases/make-comment-like-operation.usecase';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';

@Controller('comments')
export class CommentsController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getComment(
    @Param('id', ObjectIdValidationPipe) id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(
      new GetCommentByIdOrNotFoundFailQuery(id, user?.id),
    );
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', ObjectIdValidationPipe) id: string,
    @Body() body: UpdateCommentInputDto,
  ): Promise<void> {
    await this.commandBus.execute(new UpdateCommentCommand(id, body, user.id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<void> {
    await this.commandBus.execute(new DeleteCommentCommand(id, user.id));
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async makeCommentLikeOperation(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('commentId', ObjectIdValidationPipe) commentId: string,
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
