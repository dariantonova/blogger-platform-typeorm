import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from './view-dto/comments.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getComment(@Param('id') id: string): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findCommentByIdOrNotFoundFail(id);
  }
}
