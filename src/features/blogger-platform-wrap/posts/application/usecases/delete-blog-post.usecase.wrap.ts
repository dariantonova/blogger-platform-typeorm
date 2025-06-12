import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../infrastructure/posts.repository.wrap';

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
  constructor(private postsRepository: PostsRepositoryWrap) {}

  async execute({ blogId, postId }: DeleteBlogPostCommandWrap): Promise<void> {
    const post = await this.postsRepository.findByIdAndBlogIdOrNotFoundFail(
      postId,
      blogId,
    );

    post.makeDeleted();

    await this.postsRepository.save(post);

    // await this.deletePostComments(postId);
  }

  // private async deletePostComments(postId: string): Promise<void> {
  //   const comments = await this.commentsRepository.findAllPostComments(postId);
  //
  //   for (const comment of comments) {
  //     comment.makeDeleted();
  //   }
  //
  //   const savePromises = comments.map((comment) =>
  //     this.commentsRepository.save(comment),
  //   );
  //   await Promise.all(savePromises);
  // }
}
