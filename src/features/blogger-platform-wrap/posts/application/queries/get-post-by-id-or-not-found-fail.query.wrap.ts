import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepositoryWrap } from '../../infrastructure/query/posts.query-repository.wrap';
import { PostViewDto } from '../../../../blogger-platform/posts/api/view-dto/posts.view-dto';

export class GetPostByIdOrNotFoundFailQueryWrap {
  constructor(
    public postId: string,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQueryWrap)
export class GetPostByIdOrNotFoundFailQueryHandlerWrap
  implements IQueryHandler<GetPostByIdOrNotFoundFailQueryWrap, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepositoryWrap) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrNotFoundFailQueryWrap): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrNotFoundFail(
      postId,
      currentUserId,
    );
  }
}
