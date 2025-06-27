import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../dto/create-blog.dto';
import { Blog } from '../../domain/blog.entity';
import { BlogsRepo } from '../../infrastructure/blogs.repo';

export class CreateBlogCommand {
  constructor(public dto: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase
  implements ICommandHandler<CreateBlogCommand, number>
{
  constructor(private blogsRepository: BlogsRepo) {}

  async execute({ dto }: CreateBlogCommand): Promise<number> {
    const blog = Blog.createInstance(dto);

    await this.blogsRepository.save(blog);

    return blog.id;
  }
}
