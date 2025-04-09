import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostByIdOrInternalFailQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostByIdOrInternalFailQuery)
export class GetPostByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetPostByIdOrInternalFailQuery, PostViewDto>
{
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute({
    postId,
  }: GetPostByIdOrInternalFailQuery): Promise<PostViewDto> {
    return this.postsQueryRepository.findByIdOrInternalFail(postId);
  }
}
