import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositorySql } from '../../infrastructure/blogs.repository.sql';
import { PostsRepositorySql } from '../../../posts/infrastructure/posts.repository.sql';
import { PostLikesRepositorySql } from '../../../likes/infrastructure/post-likes.repository.sql';
import { CommentsRepositorySql } from '../../../comments/infrastructure/comments.repository.sql';
import { CommentLikesRepositorySql } from '../../../likes/infrastructure/comment-likes.repository.sql';

export class DeleteBlogCommandSql {
  constructor(public blogId: number) {}
}

@CommandHandler(DeleteBlogCommandSql)
export class DeleteBlogUseCaseSql
  implements ICommandHandler<DeleteBlogCommandSql>
{
  constructor(
    private blogsRepository: BlogsRepositorySql,
    private postsRepository: PostsRepositorySql,
    private postLikesRepository: PostLikesRepositorySql,
    private commentsRepository: CommentsRepositorySql,
    private commentLikesRepository: CommentLikesRepositorySql,
  ) {}

  async execute({ blogId }: DeleteBlogCommandSql): Promise<void> {
    await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    await this.commentLikesRepository.softDeleteLikesOfCommentsWithBlogId(
      blogId,
    );
    await this.commentsRepository.softDeleteCommentsOfPostsWithBlogId(blogId);
    await this.postLikesRepository.softDeleteLikesOfPostsWithBlogId(blogId);
    await this.postsRepository.softDeleteByBlogId(blogId);
    await this.blogsRepository.softDeleteById(blogId);
  }
}
