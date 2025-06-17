import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepositoryWrap } from '../../infrastructure/posts.repository.wrap';
import { BlogsRepositoryWrap } from '../../../blogs/infrastructure/blogs.repository.wrap';
import { PostWrap } from '../../domain/post.wrap';
import { CreatePostDtoSql } from '../../../../blogger-platform-sql/posts/dto/create-post.dto.sql';

export class CreatePostCommandWrap {
  constructor(public dto: CreatePostDtoSql) {}
}

@CommandHandler(CreatePostCommandWrap)
export class CreatePostUseCaseWrap
  implements ICommandHandler<CreatePostCommandWrap, number>
{
  constructor(
    private postsRepository: PostsRepositoryWrap,
    private blogsRepository: BlogsRepositoryWrap,
  ) {}

  async execute({ dto }: CreatePostCommandWrap): Promise<number> {
    await this.blogsRepository.findByIdOrNotFoundFail(dto.blogId);

    const post = PostWrap.createInstance({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: dto.blogId,
    });

    await this.postsRepository.save(post);

    return post.id;
  }
}
