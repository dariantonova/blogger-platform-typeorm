import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { CommentsQueryService } from '../comments.query-service';

export class GetCommentByIdOrNotFoundFailQuery {
  constructor(
    public commentId: string,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrNotFoundFailQuery)
export class GetCommentByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrNotFoundFailQuery, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsQueryService: CommentsQueryService,
  ) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrNotFoundFailQuery): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);

    return this.commentsQueryService.mapCommentToView(comment, currentUserId);
  }
}
