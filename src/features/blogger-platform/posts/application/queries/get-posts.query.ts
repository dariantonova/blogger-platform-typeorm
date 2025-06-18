import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

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
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    queryParams,
    currentUserId,
  }: GetPostsQuery): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.findPosts(queryParams, currentUserId);
  }
}
