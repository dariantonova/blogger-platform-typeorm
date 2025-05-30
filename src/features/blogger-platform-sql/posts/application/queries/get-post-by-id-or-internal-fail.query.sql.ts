import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostByIdOrInternalFailQuerySql {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrInternalFailQuerySql)
export class GetPostByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetPostByIdOrInternalFailQuerySql, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrInternalFailQuerySql): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findByIdOrInternalFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
