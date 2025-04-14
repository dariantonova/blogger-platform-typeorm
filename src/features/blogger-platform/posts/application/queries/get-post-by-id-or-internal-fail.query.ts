import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { PostsQueryService } from '../posts.query-service';

export class GetPostByIdOrInternalFailQuery {
  constructor(
    public postId: string,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrInternalFailQuery)
export class GetPostByIdOrInternalFailQueryHandler
  implements IQueryHandler<GetPostByIdOrInternalFailQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postQueryService: PostsQueryService,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrInternalFailQuery): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findByIdOrInternalFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
