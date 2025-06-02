import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAccessOptionalAuthGuardSql } from '../../../user-accounts-sql/guards/bearer/jwt-access-optional-auth.guard.sql';
import { UserContextDtoSql } from '../../../user-accounts-sql/guards/dto/user-context.dto.sql';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request';
import { CommentViewDto } from '../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { GetCommentByIdOrNotFoundFailQuerySql } from '../application/queries/get-comment-by-id-or-not-found-fail.query.sql';

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
    @ExtractUserIfExistsFromRequest() user: UserContextDtoSql | null,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(
      new GetCommentByIdOrNotFoundFailQuerySql(id, user?.id),
    );
  }

  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAccessAuthGuard)
  // async updateComment(
  //   @ExtractUserFromRequest() user: UserContextDto,
  //   @Param('id', ObjectIdValidationPipe) id: string,
  //   @Body() body: UpdateCommentInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(new UpdateCommentCommand(id, body, user.id));
  // }
  //
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAccessAuthGuard)
  // async deleteComment(
  //   @ExtractUserFromRequest() user: UserContextDto,
  //   @Param('id', ObjectIdValidationPipe) id: string,
  // ): Promise<void> {
  //   await this.commandBus.execute(new DeleteCommentCommand(id, user.id));
  // }
  //
  // @Put(':commentId/like-status')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @UseGuards(JwtAccessAuthGuard)
  // async makeCommentLikeOperation(
  //   @ExtractUserFromRequest() user: UserContextDto,
  //   @Param('commentId', ObjectIdValidationPipe) commentId: string,
  //   @Body() body: LikeInputDto,
  // ): Promise<void> {
  //   await this.commandBus.execute(
  //     new MakeCommentLikeOperationCommand({
  //       commentId,
  //       userId: user.id,
  //       likeStatus: body.likeStatus,
  //     }),
  //   );
  // }
}
