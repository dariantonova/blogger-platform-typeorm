import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostDto } from '../../dto/create-post.dto';
import { Post } from '../../domain/post.entity';
import { BlogsRepo } from '../../../blogs/infrastructure/blogs.repo';
import { PostsRepo } from '../../infrastructure/posts.repo';

export class CreatePostCommandWrap {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommandWrap)
export class CreatePostUseCaseWrap
  implements ICommandHandler<CreatePostCommandWrap, number>
{
  constructor(
    private postsRepository: PostsRepo,
    private blogsRepository: BlogsRepo,
  ) {}

  async execute({ dto }: CreatePostCommandWrap): Promise<number> {
    await this.blogsRepository.findByIdOrNotFoundFail(dto.blogId);

    const post = Post.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    });

    await this.postsRepository.save(post);

    return post.id;
  }
}
