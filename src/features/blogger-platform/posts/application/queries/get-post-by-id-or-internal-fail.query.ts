import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepo } from '../../infrastructure/query/posts.query-repo';

export class GetPostByIdOrInternalFailQuery {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrInternalFailQuery)
export class GetPostByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetPostByIdOrInternalFailQuery, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepo) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrInternalFailQuery): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrInternalFail(
      postId,
      currentUserId,
    );
  }
}
