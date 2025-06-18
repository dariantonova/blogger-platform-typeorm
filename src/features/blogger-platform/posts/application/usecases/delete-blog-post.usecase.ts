import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { PostLikesRepository } from '../../../likes/infrastructure/post-likes.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentLikesRepository } from '../../../likes/infrastructure/comment-likes.repository';

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
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
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
