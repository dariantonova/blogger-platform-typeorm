import { GetCommentsQueryParams } from '../../../comments/api/input-dto/get-comments-query-params.input-dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../../comments/api/view-dto/comments.view-dto';
import { CommentsQueryRepository } from '../../../comments/infrastructure/query/comments.query-repository';
import { CommentsQueryService } from '../../../comments/application/comments.query-service';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostCommentsQuery {
  constructor(
    public postId: string,
    public queryParams: GetCommentsQueryParams,
    public currentUserId: string | undefined,
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
    private commentsQueryService: CommentsQueryService,
  ) {}

  async execute({
    postId,
    queryParams,
    currentUserId,
  }: GetPostCommentsQuery): Promise<PaginatedViewDto<CommentViewDto[]>> {
    await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    const paginatedComments =
      await this.commentsQueryRepository.findPostComments(postId, queryParams);

    const commentsViewDtos = await Promise.all(
      paginatedComments.items.map((comment) =>
        this.commentsQueryService.mapCommentToView(comment, currentUserId),
      ),
    );

    return {
      ...paginatedComments,
      items: commentsViewDtos,
    };
  }
}
