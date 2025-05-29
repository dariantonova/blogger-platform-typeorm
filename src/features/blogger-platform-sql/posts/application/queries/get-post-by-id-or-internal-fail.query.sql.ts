import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDtoSql } from '../../api/view-dto/post.view-dto.sql';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';

export class GetPostByIdOrInternalFailQuerySql {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrInternalFailQuerySql)
export class GetPostByIdOrInternalFailQueryHandlerSql
  implements IQueryHandler<GetPostByIdOrInternalFailQuerySql, PostViewDtoSql>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrInternalFailQuerySql): Promise<PostViewDtoSql> {
    const post = await this.postsQueryRepository.findByIdOrInternalFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
