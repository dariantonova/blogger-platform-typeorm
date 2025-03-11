import { CommentsRepository } from '../infrastructure/comments.repository';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import { CommentDocument } from '../domain/comment.entity';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';

export class CommentsService {
  constructor(
    private commentsRepository: CommentsRepository,
    private postsRepository: PostsRepository,
  ) {}

  async getPostComments(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<CommentDocument[]> {
    await this.postsRepository.findPostByIdOrNotFoundFail(postId);

    return this.commentsRepository.findPostComments(postId, query);
  }
}
