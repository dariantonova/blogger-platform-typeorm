import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepo } from '../../infrastructure/query/comments.query-repo';

export class GetCommentByIdOrInternalFailQuery {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrInternalFailQuery)
export class GetCommentByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrInternalFailQuery, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepo) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrInternalFailQuery): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrInternalFail(
      commentId,
      currentUserId,
    );
  }
}
