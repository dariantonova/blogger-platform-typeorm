import { UpdatePostDto } from '../../dto/update-post.dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
  ) {}

  async execute({ postId, dto }: UpdatePostCommand): Promise<void> {
    const post = await this.postsRepository.findByIdOrNotFoundFail(postId);

    const blog = await this.blogsRepository.findByIdOrInternalFail(dto.blogId);

    post.update({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
      blogName: blog.name,
    });

    await this.postsRepository.save(post);
  }
}
