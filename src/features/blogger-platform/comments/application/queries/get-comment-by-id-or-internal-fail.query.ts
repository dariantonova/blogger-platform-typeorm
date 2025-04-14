import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { CommentsQueryService } from '../comments.query-service';

export class GetCommentByIdOrInternalFailQuery {
  constructor(
    public commentId: string,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrInternalFailQuery)
export class GetCommentByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetCommentByIdOrInternalFailQuery, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commentsQueryService: CommentsQueryService,
  ) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrInternalFailQuery): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrInternalFail(commentId);

    return this.commentsQueryService.mapCommentToView(comment, currentUserId);
  }
}
