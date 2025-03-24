import { Controller, Get, Param } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { ObjectIdValidationPipe } from '../../../../core/pipes/object-id-validation-pipe';

@Controller('comments')
export class CommentsController {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getComment(
    @Param('id', ObjectIdValidationPipe) id: string,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrNotFoundFail(id);
  }
}
