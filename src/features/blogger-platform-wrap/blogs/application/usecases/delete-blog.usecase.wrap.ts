import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryWrap } from '../../infrastructure/blogs.repository.wrap';
import { PostsRepositoryWrap } from '../../../posts/infrastructure/posts.repository.wrap';
import { PostLikesRepositoryWrap } from '../../../likes/infrastructure/post-likes.repository.wrap';
import { CommentsRepositoryWrap } from '../../../comments/infrastructure/comments.repository.wrap';
import { CommentLikesRepositoryWrap } from '../../../likes/infrastructure/comment-likes.repository.wrap';

export class DeleteBlogCommandWrap {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommandWrap)
export class DeleteBlogUseCaseWrap
  implements ICommandHandler<DeleteBlogCommandWrap>
{
  constructor(
    private blogsRepository: BlogsRepositoryWrap,
    private postsRepository: PostsRepositoryWrap,
    private postLikesRepository: PostLikesRepositoryWrap,
    private commentsRepository: CommentsRepositoryWrap,
    private commentLikesRepository: CommentLikesRepositoryWrap,
  ) {}

  async execute({ blogId }: DeleteBlogCommandWrap): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.makeDeleted();

    await this.blogsRepository.save(blog);

    await this.commentLikesRepository.softDeleteLikesOfCommentsWithBlogId(
      blogId,
    );
    await this.commentsRepository.softDeleteCommentsOfPostsWithBlogId(blogId);
    await this.postLikesRepository.softDeleteLikesOfPostsWithBlogId(blogId);
    await this.postsRepository.softDeleteByBlogId(blogId);
  }
}
