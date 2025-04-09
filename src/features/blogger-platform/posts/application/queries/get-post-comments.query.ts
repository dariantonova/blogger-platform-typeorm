import { GetCommentsQueryParams } from '../../../comments/api/input-dto/get-comments-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../../comments/api/view-dto/comments.view-dto';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { CommentsQueryRepository } from '../../../comments/infrastructure/query/comments.query-repository';

export class GetPostCommentsQuery {
  constructor(
    public postId: string,
    public queryParams: GetCommentsQueryParams,
  ) {}
}

@QueryHandler(GetPostCommentsQuery)
export class GetPostCommentsQueryHandler
  implements
    IQueryHandler<GetPostCommentsQuery, PaginatedViewDto<CommentViewDto[]>>
{
  constructor(
    private postsRepository: PostsRepository,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute({
    postId,
    queryParams,
  }: GetPostCommentsQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsRepository.findByIdOrNotFoundFail(postId);

    return this.commentsQueryRepository.findPostComments(postId, queryParams);
  }
}
