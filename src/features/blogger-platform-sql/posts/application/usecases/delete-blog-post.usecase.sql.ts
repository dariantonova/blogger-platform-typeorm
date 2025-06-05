import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositorySql } from '../../infrastructure/posts.repository.sql';
import { PostLikesRepositorySql } from '../../../likes/infrastructure/post-likes.repository.sql';
import { CommentsRepositorySql } from '../../../comments/infrastructure/comments.repository.sql';
import { CommentLikesRepositorySql } from '../../../likes/infrastructure/comment-likes.repository.sql';

export class DeleteBlogPostCommandSql {
  constructor(
    public blogId: number,
    public postId: number,
  ) {}
}

@CommandHandler(DeleteBlogPostCommandSql)
export class DeleteBlogPostUseCaseSql
  implements ICommandHandler<DeleteBlogPostCommandSql>
{
  constructor(
    private postsRepository: PostsRepositorySql,
    private postLikesRepository: PostLikesRepositorySql,
    private commentsRepository: CommentsRepositorySql,
    private commentLikesRepository: CommentLikesRepositorySql,
  ) {}

  async execute({ blogId, postId }: DeleteBlogPostCommandSql): Promise<void> {
    await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(postId, blogId);

    await this.commentLikesRepository.softDeleteLikesOfCommentsWithPostId(
      postId,
    );
    await this.commentsRepository.softDeleteByPostId(postId);
    await this.postLikesRepository.softDeleteByPostId(postId);
    await this.postsRepository.softDeleteById(postId);
  }
}
