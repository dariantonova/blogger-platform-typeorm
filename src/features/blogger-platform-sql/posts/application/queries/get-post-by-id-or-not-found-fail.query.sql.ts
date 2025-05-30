import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostByIdOrNotFoundFailQuerySql {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQuerySql)
export class GetPostByIdOrNotFoundFailQueryHandlerSql
  implements IQueryHandler<GetPostByIdOrNotFoundFailQuerySql, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrNotFoundFailQuerySql): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
