import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryWrap } from '../../infrastructure/blogs.repository.wrap';
import { BlogWrap } from '../../domain/blog.wrap';
import { CreateBlogDto } from '../../../../blogger-platform/blogs/dto/create-blog.dto';

export class CreateBlogCommandWrap {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommandWrap)
export class CreateBlogUseCaseWrap
  implements ICommandHandler<CreateBlogCommandWrap, string>
{
  constructor(private blogsRepository: BlogsRepositoryWrap) {}

  async execute({ dto }: CreateBlogCommandWrap): Promise<string> {
    const blog = BlogWrap.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog.id.toString();
  }
}
