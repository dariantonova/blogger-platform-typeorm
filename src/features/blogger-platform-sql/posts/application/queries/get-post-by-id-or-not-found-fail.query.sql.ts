import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDtoSql } from '../../api/view-dto/post.view-dto.sql';
import { PostsQueryRepositorySql } from '../../infrastructure/query/posts.query-repository.sql';
import { PostsQueryServiceSql } from '../posts.query-service.sql';

export class GetPostByIdOrNotFoundFailQuerySql {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQuerySql)
export class GetPostByIdOrNotFoundFailQueryHandlerSql
  implements IQueryHandler<GetPostByIdOrNotFoundFailQuerySql, PostViewDtoSql>
{
  constructor(
    private postsQueryRepository: PostsQueryRepositorySql,
    private postQueryService: PostsQueryServiceSql,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrNotFoundFailQuerySql): Promise<PostViewDtoSql> {
    const post = await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
