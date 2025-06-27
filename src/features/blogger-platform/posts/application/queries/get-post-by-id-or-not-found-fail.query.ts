import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepo } from '../../infrastructure/query/posts.query-repo';

export class GetPostByIdOrNotFoundFailQuery {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQuery)
export class GetPostByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetPostByIdOrNotFoundFailQuery, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepo) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrNotFoundFailQuery): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrNotFoundFail(
      postId,
      currentUserId,
    );
  }
}
