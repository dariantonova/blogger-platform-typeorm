import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../infrastructure/posts.repository.wrap';
import { PostLikesRepositoryWrap } from '../../../likes/infrastructure/post-likes.repository.wrap';
import { CommentsRepositoryWrap } from '../../../comments/infrastructure/comments.repository.wrap';
import { CommentLikesRepositoryWrap } from '../../../likes/infrastructure/comment-likes.repository.wrap';

export class DeleteBlogPostCommandWrap {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeleteBlogPostCommandWrap)
export class DeleteBlogPostUseCaseWrap
  implements ICommandHandler<DeleteBlogPostCommandWrap>
{
  constructor(
    private postsRepository: PostsRepositoryWrap,
    private postLikesRepository: PostLikesRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
    private commentLikesRepository: CommentLikesRepositoryWrap,
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
