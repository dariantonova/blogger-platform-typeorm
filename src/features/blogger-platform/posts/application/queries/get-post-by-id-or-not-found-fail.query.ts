import { PostViewDto } from '../../api/view-dto/posts.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PostsQueryService } from '../posts.query-service';

export class GetPostByIdOrNotFoundFailQuery {
  constructor(
    public postId: string,
    public currentUserId: string | undefined,
  ) {}
}

@QueryHandler(GetPostByIdOrNotFoundFailQuery)
export class GetPostByIdOrNotFoundFailQueryHandler
  implements IQueryHandler<GetPostByIdOrNotFoundFailQuery, PostViewDto>
{
  constructor(
    private postsQueryRepository: PostsQueryRepository,
    private postQueryService: PostsQueryService,
  ) {}

  async execute({
    postId,
    currentUserId,
  }: GetPostByIdOrNotFoundFailQuery): Promise<PostViewDto> {
    const post = await this.postsQueryRepository.findByIdOrNotFoundFail(postId);

    return this.postQueryService.mapPostToView(post, currentUserId);
  }
}
