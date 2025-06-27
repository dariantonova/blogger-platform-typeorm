import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentLikesRepo } from '../../../likes/infrastructure/comment-likes.repo';
import { BlogsRepo } from '../../infrastructure/blogs.repo';
import { PostsRepo } from '../../../posts/infrastructure/posts.repo';
import { PostLikesRepo } from '../../../likes/infrastructure/post-likes.repo';
import { CommentsRepo } from '../../../comments/infrastructure/comments.repo';

export class DeleteBlogCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepo,
    private postsRepository: PostsRepo,
    private postLikesRepository: PostLikesRepo,
    private commentsRepository: CommentsRepo,
    private commentLikesRepository: CommentLikesRepo,
  ) {}

  async execute({ blogId }: DeleteBlogCommand): Promise<void> {
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
