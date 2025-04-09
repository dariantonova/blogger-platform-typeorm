import { Controller, Get, Param } from '@nestjs/common';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';
import { QueryBus } from '@nestjs/cqrs';
import { GetCommentByIdOrNotFoundFailQuery } from '../application/queries/get-comment-by-id-or-not-found-fail.query';

@Controller('comments')
export class CommentsController {
  constructor(private queryBus: QueryBus) {}

  @Get(':id')
  async getComment(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<CommentViewDto> {
    return this.queryBus.execute(new GetCommentByIdOrNotFoundFailQuery(id));
  }
}
