import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../infrastructure/blogs.repository';
import { Blog } from '../../domain/blog.entity';
import { CreateBlogDto } from '../../dto/create-blog.dto';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, number>
{
  constructor(private blogsRepository: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = Blog.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog.id;
  }
}
