import { GetCommentsQueryParams } from '../../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';
import { PostsQueryRepositorySql } from '../../../posts/infrastructure/query/posts.query-repository.sql';
import { CommentsQueryRepositorySql } from '../../infrastructure/query/comments.query-repository.sql';
import { CommentsQueryServiceSql } from '../comments.query-service.sql';

export class GetPostCommentsQuerySql {
  constructor(
    public postId: number,
    public queryParams: GetCommentsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostCommentsQuerySql)
export class GetPostCommentsQueryHandlerSql
  implements
    IQueryHandler<GetPostCommentsQuerySql, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private commentsQueryRepository: CommentsQueryRepositorySql,
    private commentsQueryService: CommentsQueryServiceSql,
  ) {}

  async execute({
    postId,
    queryParams,
    currentUserId,
  }: GetPostCommentsQuerySql): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    const paginatedComments =
      await this.commentsQueryRepository.findPostComments(postId, queryParams);

    return this.commentsQueryService.mapPaginatedCommentsToView(
      paginatedComments,
      currentUserId,
    );
  }
}
