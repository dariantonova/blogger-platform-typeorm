import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepositoryWrap } from '../../infrastructure/blogs.repository.wrap';
import { UpdateBlogDto } from '../../../../blogger-platform/blogs/dto/update-blog.dto';

export class UpdateBlogCommandWrap {
  constructor(
    public blogId: string,
    public dto: UpdateBlogDto,
  ) {}
}

@CommandHandler(UpdateBlogCommandWrap)
export class UpdateBlogUseCaseWrap
  implements ICommandHandler<UpdateBlogCommandWrap>
{
  constructor(private blogsRepository: BlogsRepositoryWrap) {}

  async execute({ blogId, dto }: UpdateBlogCommandWrap): Promise<void> {
    const blog = await this.blogsRepository.findByIdOrNotFoundFail(blogId);

    blog.update(dto);

    await this.blogsRepository.save(blog);
  }
}
