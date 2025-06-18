import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';

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
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

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
