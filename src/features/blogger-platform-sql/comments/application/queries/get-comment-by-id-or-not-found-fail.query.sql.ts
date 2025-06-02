import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { CommentsQueryRepositorySql } from '../../infrastructure/query/comments.query-repository.sql';
import { CommentsQueryServiceSql } from '../comments.query-service.sql';

export class GetCommentByIdOrNotFoundFailQuerySql {
  constructor(
    public commentId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetCommentByIdOrNotFoundFailQuerySql)
export class GetCommentByIdOrNotFoundFailQueryHandlerSql
  implements IQueryHandler<GetCommentByIdOrNotFoundFailQuerySql, CommentViewDto>
{
  constructor(
    private commentsQueryRepository: CommentsQueryRepositorySql,
    private commentsQueryService: CommentsQueryServiceSql,
  ) {}

  async execute({
    commentId,
    currentUserId,
  }: GetCommentByIdOrNotFoundFailQuerySql): Promise<CommentViewDto> {
    const comment =
      await this.commentsQueryRepository.findByIdOrNotFoundFail(commentId);

    return this.commentsQueryService.mapCommentToView(comment, currentUserId);
  }
}
