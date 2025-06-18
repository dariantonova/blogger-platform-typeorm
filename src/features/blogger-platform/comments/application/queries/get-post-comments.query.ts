import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../../posts/infrastructure/query/posts.query-repository';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../api/view-dto/comments.view-dto';

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
    private postsQueryRepository: PostsQueryRepository,
    private commentsQueryRepository: CommentsQueryRepository,
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
