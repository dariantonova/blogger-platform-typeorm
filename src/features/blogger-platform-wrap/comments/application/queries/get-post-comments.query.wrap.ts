import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepositoryWrap } from '../../../posts/infrastructure/query/posts.query-repository.wrap';
import { CommentsQueryRepositoryWrap } from '../../infrastructure/query/comments.query-repository.wrap';
import { GetCommentsQueryParams } from '../../../../blogger-platform/comments/api/input-dto/get-comments-query-params.input-dto';
import { CommentViewDto } from '../../../../blogger-platform/comments/api/view-dto/comments.view-dto';

export class GetPostCommentsQueryWrap {
  constructor(
    public postId: number,
    public queryParams: GetCommentsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostCommentsQueryWrap)
export class GetPostCommentsQueryHandlerWrap
  implements
    IQueryHandler<GetPostCommentsQueryWrap, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositoryWrap,
    private commentsQueryRepository: CommentsQueryRepositoryWrap,
  ) {}

  async execute({
    postId,
    queryParams,
    currentUserId,
  }: GetPostCommentsQueryWrap): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(postId, undefined);

    return this.commentsQueryRepository.findPostComments(
      postId,
      queryParams,
      currentUserId,
    );
  }
}
