import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';

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
  constructor(private postsQueryRepository: PostsQueryRepository) {}

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
