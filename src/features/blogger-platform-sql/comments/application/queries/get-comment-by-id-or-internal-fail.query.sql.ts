import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { CommentsQueryRepositorySql } from '../../infrastructure/query/comments.query-repository.sql';
import { CommentsQueryServiceSql } from '../comments.query-service.sql';

export class GetCommentByIdOrInternalFailQuerySql {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrInternalFailQuerySql)
export class GetCommentByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetCommentByIdOrInternalFailQuerySql, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepositorySql,
    private commentsQueryService: CommentsQueryServiceSql,
  ) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrInternalFailQuerySql): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrInternalFail(commentId);

    return this.commentsQueryService.mapCommentToView(comment, currentUserId);
  }
}
