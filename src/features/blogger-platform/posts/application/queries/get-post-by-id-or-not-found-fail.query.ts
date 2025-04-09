import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

export class GetPostByIdOrNotFoundFailQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQuery)
export class GetPostByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetPostByIdOrNotFoundFailQuery, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    postId,
  }: GetPostByIdOrNotFoundFailQuery): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrNotFoundFail(postId);
  }
}
