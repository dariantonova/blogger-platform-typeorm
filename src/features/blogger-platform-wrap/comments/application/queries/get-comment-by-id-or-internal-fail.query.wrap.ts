import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepositoryWrap } from '../../infrastructure/query/comments.query-repository.wrap';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';

export class GetCommentByIdOrInternalFailQueryWrap {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrInternalFailQueryWrap)
export class GetCommentByIdOrInternalFailQueryHandlerWrap
  implements
    IQueryHandler<GetCommentByIdOrInternalFailQueryWrap, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepositoryWrap) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrInternalFailQueryWrap): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrInternalFail(
      commentId,
      currentUserId,
    );
  }
}
