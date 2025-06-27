import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepo } from '../../infrastructure/query/comments.query-repo';

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
  constructor(private commentsQueryRepository: CommentsQueryRepo) {}

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
