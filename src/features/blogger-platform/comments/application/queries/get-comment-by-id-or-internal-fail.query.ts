import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';

export class GetCommentByIdOrInternalFailQuery {
  constructor(public commentId: string) {}
}

@QueryHandler(GetCommentByIdOrInternalFailQuery)
export class GetCommentByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrInternalFailQuery, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute({
    commentId,
  }: GetCommentByIdOrInternalFailQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrInternalFail(commentId);
  }
}
