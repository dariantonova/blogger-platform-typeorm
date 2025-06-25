import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { CreatePostDto } from '../../dto/create-post.dto';
import { Post } from '../../../../typeorm/entities/blogger-platform/post.entity';

export class CreatePostCommandWrap {
  constructor(public dto: CreatePostDto) {}
}

@CommandHandler(CreatePostCommandWrap)
export class CreatePostUseCaseWrap
  implements ICommandHandler<CreatePostCommandWrap, number>
{
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
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
