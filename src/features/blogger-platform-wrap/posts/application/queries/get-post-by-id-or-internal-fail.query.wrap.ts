import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepositoryWrap } from '../../infrastructure/query/posts.query-repository.wrap';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostByIdOrInternalFailQueryWrap {
  constructor(
    public postId: number,
    public currentUserId: number | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrInternalFailQueryWrap)
export class GetPostByIdOrInternalFailQueryHandlerWrap
  implements IQueryHandler<GetPostByIdOrInternalFailQueryWrap, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepositoryWrap) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrInternalFailQueryWrap): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrInternalFail(
      postId,
      currentUserId,
    );
  }
}
