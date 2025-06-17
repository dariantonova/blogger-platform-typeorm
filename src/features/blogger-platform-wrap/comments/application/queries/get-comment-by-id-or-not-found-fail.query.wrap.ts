import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepositoryWrap } from '../../infrastructure/query/comments.query-repository.wrap';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';

export class GetCommentByIdOrNotFoundFailQueryWrap {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrNotFoundFailQueryWrap)
export class GetCommentByIdOrNotFoundFailQueryHandlerWrap
  implements
    IQueryHandler<GetCommentByIdOrNotFoundFailQueryWrap, CommentViewDto>
{
  constructor(private commentsQueryRepository: CommentsQueryRepositoryWrap) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrNotFoundFailQueryWrap): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findByIdOrNotFoundFail(
      commentId,
      currentUserId,
    );
  }
}
