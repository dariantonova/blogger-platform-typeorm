import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepo } from '../../../likes/infrastructure/comment-likes.repo';
import { PostsRepo } from '../../infrastructure/posts.repo';
import { PostLikesRepo } from '../../../likes/infrastructure/post-likes.repo';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';

export class DeleteBlogPostCommandWrap {
  constructor(
    public blogId: number,
    public postId: number,
  ) {}
}

@CommandHandler(DeleteBlogPostCommandWrap)
export class DeleteBlogPostUseCaseWrap
  implements ICommandHandler<DeleteBlogPostCommandWrap>
{
  constructor(
    private postsRepository: PostsRepo,
    private postLikesRepository: PostLikesRepo,
    private commentsRepository: CommentsRepo,
    private commentLikesRepository: CommentLikesRepo,
  ) {}

  async execute({ blogId, postId }: DeleteBlogPostCommandWrap): Promise<void> {
    const post = await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(
      postId,
      blogId,
    );

    post.makeDeleted();

    await this.postsRepository.save(post);

    await this.commentLikesRepository.softDeleteLikesOfCommentsWithPostId(
      postId,
    );
    await this.commentsRepository.softDeleteByPostId(postId);
    await this.postLikesRepository.softDeleteByPostId(postId);
  }
}
