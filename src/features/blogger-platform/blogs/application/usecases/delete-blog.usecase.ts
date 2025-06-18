import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { PostLikesRepository } from '../../../likes/infrastructure/post-likes.repository';
import { CommentsRepository } from '../../../comments/infrastructure/comments.repository';
import { CommentLikesRepository } from '../../../likes/infrastructure/comment-likes.repository';

export class DeleteBlogCommand {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(
    private blogsRepository: BlogsRepository,
    private postsRepository: PostsRepository,
    private postLikesRepository: PostLikesRepository,
    private commentsRepository: CommentsRepository,
    private commentLikesRepository: CommentLikesRepository,
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
