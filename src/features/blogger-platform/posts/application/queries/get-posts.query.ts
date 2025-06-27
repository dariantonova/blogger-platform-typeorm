import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepo } from '../../infrastructure/query/posts.query-repo';

export class GetPostsQuery {
  constructor(
    public queryParams: GetPostsQueryParams,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsQueryHandler
  implements IQueryHandler<GetPostsQuery, PaginatedViewDto<PostViewDto[]>>
{
  constructor(private postsQueryRepository: PostsQueryRepo) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.findPosts(queryParams, currentUserId);
  }
}
