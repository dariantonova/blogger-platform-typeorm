import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';

export class GetCommentByIdOrNotFoundFailQuery {
  constructor(public commentId: string) {}
}

@QueryHandler(GetCommentByIdOrNotFoundFailQuery)
export class GetCommentByIdOrNotFoundQueryHandler
  implements IQueryHandler<GetCommentByIdOrNotFoundFailQuery, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute({
    commentId,
  }: GetCommentByIdOrNotFoundFailQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);
  }
}
