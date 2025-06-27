import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';
import { CommentsQueryRepo } from '../../infrastructure/query/comments.query-repo';
import { PostsQueryRepo } from '../../../posts/infrastructure/query/posts.query-repo';

export class GetPostCommentsQuery {
  constructor(
    public postId: number,
    public queryParams: GetCommentsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsQueryHandler
  implements
    IQueryHandler<GetPostCommentsQuery, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepo,
    private commentsQueryRepository: CommentsQueryRepo,
  ) {}

  async execute({
    postId,
    queryParams,
    currentUserId,
  }: GetPostCommentsQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.checkPostExistsOrNotFoundFail(postId);

    return this.commentsQueryRepository.findPostComments(
      postId,
      queryParams,
      currentUserId,
    );
  }
}
