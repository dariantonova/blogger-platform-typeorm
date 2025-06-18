import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

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
  constructor(private postsQueryRepository: PostsQueryRepository) {}

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
