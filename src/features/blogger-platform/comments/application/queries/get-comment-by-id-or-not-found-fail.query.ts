import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';

export class GetCommentByIdOrNotFoundFailQuery {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrNotFoundFailQuery)
export class GetCommentByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrNotFoundFailQuery, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrNotFoundFailQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrNotFoundFail(
      commentId,
      currentUserId,
    );
  }
}
